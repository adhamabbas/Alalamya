const mongoose = require('mongoose');
const Supplayr = require('./SupplayrModel');
const User = require('./userModel');

const tax_supplayrSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    supplayr: {
      type: mongoose.Schema.ObjectId,
      ref: 'Supplayr',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    taxRate: {
      type: Number,
      required: true,
      default:0,
    },
    discountRate: {
      type: Number,
      required: true,
      default:0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);


tax_supplayrSchema.pre(/^find/, function (next) {
    this.populate({ path: 'user', select: 'name -_id' })
      .populate({ path: 'clint', select: 'clint_name money_pay money_on -_id' });
  
    next();
  });

tax_supplayrSchema.pre('save', async function (next) {
  const tax = this;
  
  // Calculate the tax and discount amounts
  tax.taxAmount = tax.amount * (tax.taxRate / 100);
  tax.discountAmount = tax.amount * (tax.discountRate / 100);
  tax.netAmount =  tax.taxAmount - tax.discountAmount;
  
  // Update the client's financials
  const supplayr = await Supplayr.findById(tax.supplayr);
  if (supplayr) {
    supplayr.price_pay += tax.netAmount;
    supplayr.price_on -= tax.netAmount;
    supplayr.total_price -= tax.netAmount;
    supplayr.dis_count = (supplayr.dis_count || 0) + 1;
    await supplayr.save();
  }

  next();
});

const Tax_supplayr = mongoose.model('Tax_supplayr', tax_supplayrSchema);

module.exports = Tax_supplayr;
