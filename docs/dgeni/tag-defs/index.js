var path = require('path');

module.exports = require("fs")
    .readdirSync(__dirname)
    .filter(function(file){
        return file !== 'index.js'
    })
    .map(function(file){
        return require(path.resolve(__dirname, file));
    });