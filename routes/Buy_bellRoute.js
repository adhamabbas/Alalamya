const express = require('express');
const {
  getBuy_bellValidator,
  createBuy_bellValidator,
  updateBuy_bellValidator,
  deleteBuy_bellValidator,
} = require('../utils/validators/Buy_bellValidator');

const {
  getBuy_bells,
  getBuy_bell,
  createBuy_bell,
  updateBuy_bell,
  deleteBuy_bell,
  
  
} = require('../services/Buy_bellService');
const authService = require('../services/authService');

const router = express.Router();

router
  .route('/')
  .get(getBuy_bells)
  .post(
    authService.protect,
    authService.allowedTo('admin','manager','user2'),
    createBuy_bellValidator,
    createBuy_bell
  );
router
  .route('/:id')
  .get(
    authService.protect,
    authService.allowedTo('admin','manager'),
    getBuy_bellValidator, getBuy_bell)
  .put(
    authService.protect,
    authService.allowedTo('admin'),
    updateBuy_bellValidator,
    updateBuy_bell
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteBuy_bellValidator,
    deleteBuy_bell
  );
  


module.exports = router;
