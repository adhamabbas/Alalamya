const asyncHandler = require('express-async-handler');
const ReturnedCheck = require('../models/ReturnCheckModel');
const Clint = require('../models/ClintModel');
const ApiError = require('../utils/apiError');

// إنشاء شيك مرتجع
exports.createReturnedCheck = asyncHandler(async (req, res, next) => {
  const { clint_name, amount } = req.body;

  // تحقق من وجود العميل باستخدام الاسم
  const clint = await Clint.findOne({ clint_name });
  if (!clint) {
    return next(new ApiError('Client not found', 404));
  }

  // إنشاء الشيك المرتجع
  const returnedCheck = await ReturnedCheck.create({ clint: clint._id, amount });

  res.status(201).json({ data: returnedCheck });
});

// الحصول على جميع الشيكات المرتجعة
exports.getAllReturnedChecks = asyncHandler(async (req, res) => {
  const returnedChecks = await ReturnedCheck.find().populate('clint');
  res.status(200).json({ results: returnedChecks.length, data: returnedChecks });
});
