const mongoose = require('mongoose');
const User = require('./userModel');
const Clint = require('./ClintModel');

const Sell_bellSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    clint: {
      type: String,
      required: true,
    },
    payBell: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'check'],
      required: true,
    },
    checkNumber: {
      type: String,
      required: function () {
        return this.paymentMethod === 'check';
      },
    },
    checkDate: {
      type: String,
      required: function () {
        return this.paymentMethod === 'check';
      },
    },
  },
  { timestamps: true }
);

Sell_bellSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name -_id' });
  next();
});

Sell_bellSchema.statics.takeMoney_d = async function (clintName, priceall) {
  const clint = await Clint.findOne({ clint_name: clintName });
  if (!clint) {
    throw new Error(`Client with name ${clintName} not found`);
  }
  await Clint.findOneAndUpdate(
    { clint_name: clintName },
    { $inc: { money_pay: priceall } },
    { new: true }
  );
};

Sell_bellSchema.statics.takeMoney_b = async function (clintName, pricePay) {
  const clint = await Clint.findOne({ clint_name: clintName });
  if (!clint) {
    throw new Error(`Client with name ${clintName} not found`);
  }
  await Clint.findOneAndUpdate(
    { clint_name: clintName },
    { $inc: { money_on: -pricePay } },
    { new: true }
  );
};

Sell_bellSchema.post('save', async function () {
  await this.constructor.takeMoney_d(this.clint, this.payBell);
  await this.constructor.takeMoney_b(this.clint, this.payBell);
});

const Sell_bell = mongoose.model('Sell_bell', Sell_bellSchema);

module.exports = Sell_bell;
