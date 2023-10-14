const express = require('express');
const products = require('./products.route');

const router = express.Router();

router.use('/api/products', products);

router.get('/', (req, res) => res.send('API version 1.0.0'));

module.exports = router;