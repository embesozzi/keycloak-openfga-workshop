const express = require('express');
const router = express.Router({ mergeParams: true });

const jwt = require('../middlewares/jwt');
const fga = require('../middlewares/openfga');
const productsController = require('../controllers/products.controller');

router.route('/')
    .get(
        [  
            jwt.validateToken,
            jwt.decodeToken, 
            fga.checkUserHasRole("view-product")
        ],
        productsController.getAll);

router.route('/:id')
    .get(
        [ 
            jwt.validateToken,
            jwt.decodeToken,
            fga.checkUserHasRole("view-product") 
        ],
        productsController.get);

router.route('/:id/publish')
    .post(
        [ 
            jwt.validateToken,
            jwt.decodeToken,  
            fga.checkUserHasRole("edit-product")
        ],
        productsController.publish);

module.exports = router;