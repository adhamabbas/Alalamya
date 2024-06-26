const Sell = require('../models/sellModel');
const Sell_bell = require('../models/Sell_bellModel');
const Buy = require('../models/BuyModel');
const Clint = require('../models/ClintModel');
const Supplier = require('../models/SupplayrModel');

exports.generateReport = async (startDate, endDate) => {
  const matchStage = {
    $match: {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }
  };

  // حساب إجمالي المبيعات
  const totalSales = await Sell.aggregate([
    matchStage,
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$price_allQuantity' },
        totalWeight: { $sum: '$o_wieght' }
      }
    }
  ]);

  // حساب الأموال المدفوعة من العملاء باستخدام Sell و Sell_bell
  const totalPaidByClientsFromSell = await Sell.aggregate([
    matchStage,
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$pay_now' }
      }
    }
  ]);

  const totalPaidByClientsFromSellBell = await Sell_bell.aggregate([
    matchStage,
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$pay_now' }
      }
    }
  ]);

  const totalPaidByClients = (totalPaidByClientsFromSell.length > 0 ? totalPaidByClientsFromSell[0].totalPaid : 0) +
                             (totalPaidByClientsFromSellBell.length > 0 ? totalPaidByClientsFromSellBell[0].totalPaid : 0);

  // حساب الأموال المتبقية على العملاء
  const totalDueFromClients = await Clint.aggregate([
    {
      $group: {
        _id: null,
        totalDue: { $sum: '$money_on' }
      }
    }
  ]);

  // حساب الأموال المدفوعة للموردين باستخدام Buy فقط
  const totalPaidToSuppliersFromBuy = await Buy.aggregate([
    matchStage,
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$pay' }
      }
    }
  ]);

  const totalPaidToSuppliers = totalPaidToSuppliersFromBuy.length > 0 ? totalPaidToSuppliersFromBuy[0].totalPaid : 0;

  // حساب الأموال المتبقية على الموردين
  const totalDueToSuppliers = await Supplier.aggregate([
    {
      $group: {
        _id: null,
        totalDue: { $sum: '$price_on' }
      }
    }
  ]);

  // حساب إجمالي المشتريات من الموردين باستخدام Buy فقط
  const totalPurchasesFromBuy = await Buy.aggregate([
    matchStage,
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$price_all' }
      }
    }
  ]);

  const totalPurchases = totalPurchasesFromBuy.length > 0 ? totalPurchasesFromBuy[0].totalAmount : 0;

  // حساب إجمالي الربح (إجمالي المبيعات - إجمالي المشتريات)
  const totalProfit = totalSales.length > 0 ? totalSales[0].totalAmount - totalPurchases : 0;

  return {
    totalSales: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
    totalWeightSold: totalSales.length > 0 ? totalSales[0].totalWeight : 0,
    totalPaidByClients,
    totalDueFromClients: totalDueFromClients.length > 0 ? totalDueFromClients[0].totalDue : 0,
    totalPaidToSuppliers,
    totalDueToSuppliers: totalDueToSuppliers.length > 0 ? totalDueToSuppliers[0].totalDue : 0,
    totalPurchases,
    totalProfit
  };
};
