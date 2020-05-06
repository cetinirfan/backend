const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Staff = new Schema({
    staffFullName:{
        type:String
    },
    staffOperatingId:{
        type: mongoose.Types.ObjectId
    },
    staffWorkTime:[{
        monday:[{startDate:{type:String},finishDate:{type:String}}],
        tuesday:[{startDate:{type:String},finishDate:{type:String}}],
        wednesday:[{startDate:{type:String},finishDate:{type:String}}],
        thursday:[{startDate:{type:String},finishDate:{type:String}}],
        friday:[{startDate:{type:String},finishDate:{type:String}}],
        saturday:[{startDate:{type:String},finishDate:{type:String}}],
        sunday:[{startDate:{type:String},finishDate:{type:String}}],
    }],
    appointmentDate:[
        {date:{type:String},time:{type:String}
        }],
    staffPhoto:{
        type:String,
        default:'uploads/default/user.png',
    },
    operationId:[],
    staffOperations:[{
        operationName:{type:String},
        type:{type:Number},
        subId:{type:mongoose.Types.ObjectId}
    }],
    staffCreated:{
        type:Date,
        default:Date.now()
    }

});

module.exports = mongoose.model('Staff', Staff);
