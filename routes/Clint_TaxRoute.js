const express = require('express');


const {
  getTax_clints,
  getTax_clint,
  createTax_clint,
  updateTax_clint,
  deleteTax_clint,
} = require('../services/Clint_TaxService');

const authService = require('../services/authService');

const router = express.Router();

router
  .route('/')
  .get(getTax_clints)
  .post(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    createTax_clint
  );

router
  .route('/:id')
  .get(getTax_clint)
  .put(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    updateTax_clint
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteTax_clint
  );

module.exports = router;
