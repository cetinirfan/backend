const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = new Schema({
    categoryName: {
        type: String,
        trim: true,
    },
    categorySub:[{
        operationSubName:{
            type: String,
            trim: true,
        }
    }],
    
});

module.exports = mongoose.model('Category', Category);