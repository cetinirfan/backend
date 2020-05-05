const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeedBack = new Schema({
    title:{
        type:String
    },
    description:{
        type:String
    }, 
    telephone:{
        type:Number,
    },
    feedBackType:{
        type:Number,
        default:0
    },
    feedBackCreated:{
        type:Date,
        default:Date.now()
    }
});

module.exports = mongoose.model('FeedBack', FeedBack);
