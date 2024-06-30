const express = require('express');
const router = express.Router({ mergeParams: true });

const productsController = require('../controllers/products.controller');

router.route('/')
    .get(productsController.getAll);

router.route('/:id')
    .get(productsController.get);

router.route('/:id/publish')
    .post(productsController.publish);

module.exports = router;