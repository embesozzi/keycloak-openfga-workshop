const productsService = require('../services/products.service');

const get = async function(req, res){
    console.log(`[Store API] Getting product id:  ${req.params.id}`);
    res.send(productsService.get(req.params.id));
}

const getAll = async function(req, res){
    console.log('[Store API] Getting products');
    res.send(productsService.getAll());
}    

const publish = async function(req, res){
    console.log(`[Store API] Publishing product id:  ${req.params.id}`);
    res.send(productsService.publish(req.params.id));
}

module.exports = {
    get,
    getAll,
    publish
};