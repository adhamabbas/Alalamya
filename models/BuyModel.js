const mongoose = require('mongoose');
const User = require('./userModel');
const Product = require('./ProductModel');
const Supplayr =require('./SupplayrModel');


const BuySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    supplayr: {
      type: mongoose.Schema.ObjectId,
      ref: 'Supplayr',
    },
    size: {
      type: Number,
      required: true,
    },
    
    E_wieght: {
      type: Number,
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
    product_code:{
      type: Number,
      required: true,
    },
    price_Kilo: {
      type: Number,
      required: true,
    },
    price_all: {
      type: Number,
      required: true,
    },
    pay:{
      type: Number,
      required: true,
      default:0,
    },
    
  },
  { timestamps: true }
);

BuySchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name -_id' })
    .populate({ path: 'product', select: 'name avg_price weight -_id' })
    .populate({ path: 'supplayr', select: 'supplayr_name price_pay price_on -_id' });

  next();
});

BuySchema.statics.calcAveragePrice = async function (
  productId
) {
  const result = await this.aggregate([
    // Stage 1 : get all Buys in specific product
    {
      $match: { product: productId },
    },
    // Stage 2: Grouping Buys based on productID and calc  avg price
    {
      $group: {
        _id: '$product',
        avg_price: { $avg: '$price_Kilo' },
        
      },
    },
  ]);

  // console.log(result);
  

if (result.length > 0) {
  await Product.findByIdAndUpdate(productId, {
    avg_price: result[0].avg_price,
  });
} 
};

// Stage 3: Grouping Buys based on productID and calc weight

BuySchema.statics.updateProductWeight = async function(productId, weightBuy) {
  await Product.findByIdAndUpdate(productId, {
     $inc:{wieght: +weightBuy},
  });
};





BuySchema.statics.AddmoneyAndtakeMoney_b = async function (
  supplayrId
) {
  const result2 = await this.aggregate([
    
    // Stage 1 : get all Sells in specific supplayr
    {
      $match: { supplayr: supplayrId },
    },
    // Stage 2: Grouping Sells based on supplayrId and calc price it pay and total price
    {
      $group: {
        _id: '$supplayr',
        pricePay: { $sum: '$pay' },
        totalPrice:{$sum: '$price_all' },
        
      },
    },
  ]);

  // console.log(result);
  if (result2.length > 0) {
    await Supplayr.findByIdAndUpdate(supplayrId, {
      price_pay: result2[0].pricePay,
      total_price: result2[0].totalPrice,
    });
  } 
  
};

BuySchema.statics.takeMoney_d = async function(supplayrId,priceall) {
  await Supplayr.findByIdAndUpdate(supplayrId, {
     $inc:{price_on: +priceall},
  });
};

BuySchema.statics.takeMoney_b = async function(supplayrId,pricePay) {
  await Supplayr.findByIdAndUpdate(supplayrId, {
     $inc:{price_on: -pricePay},
  });
};

BuySchema.post('save', async function () {
 await this.constructor.calcAveragePrice(this.product)
  await this.constructor.updateProductWeight(this.product,this.E_wieght);
  await this.constructor.AddmoneyAndtakeMoney_b(this.supplayr);
  await this.constructor.takeMoney_d(this.supplayr,this.price_all);
  await this.constructor.takeMoney_b(this.supplayr,this.pay);
 
});

const Buy = mongoose.model('Buy', BuySchema);

module.exports = Buy ;