const mongoose = require('mongoose');
const Clint = require('./ClintModel');
const User = require('./userModel');

const taxSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    clint: {
      type: mongoose.Schema.ObjectId,
      ref: 'Clint',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    taxRate: {
      type: Number,
      required: true,
    },
    discountRate: {
      type: Number,
      required: true,
    },
    netAmount: {
      type: Number,
      
    },
    taxAmount: {
      type: Number,
    
    },
    discountAmount: {
      type: Number,
      
    },
  },
  { timestamps: true }
);


taxSchema.pre(/^find/, function (next) {
    this.populate({ path: 'user', select: 'name -_id' })
      .populate({ path: 'clint', select: 'clint_name money_pay money_on -_id' });
  
    next();
  });

taxSchema.pre('save', async function (next) {
  const tax = this;
  
  // Calculate the tax and discount amounts
  tax.taxAmount = tax.amount * (tax.taxRate / 100);
  tax.discountAmount = tax.amount * (tax.discountRate / 100);
  tax.netAmount =  tax.taxAmount - tax.discountAmount;
  
  // Update the client's financials
  const clint = await Clint.findById(tax.clint);
  if (clint) {
    clint.money_pay += tax.discountAmount;
    clint.money_on += tax.netAmount;
    clint.total_monye += tax.netAmount;
    clint.disCount = (clint.disCount || 0) + 1;
    await clint.save();
  }

  next();
});

const Tax_clint = mongoose.model('Tax', taxSchema);

module.exports = Tax_clint;
