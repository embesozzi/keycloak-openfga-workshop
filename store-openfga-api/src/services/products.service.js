const data = require('../data');

const get = function(_id){
    return getAll().find(getAll => product.id == _id);
}

const getAll = function(){
    return data.Products;
}

const publish = function(_id){
   //ToDo: Update product
}

module.exports = {
    get,
    getAll,
    publish
};