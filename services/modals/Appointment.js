const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Appointment = new Schema({
    appointmentName:[],
    appointmentType:{
        type:Number,
        default:0
    },
    staffName:{
        type:String,
    },
    staffId:{type:mongoose.Types.ObjectId},
    user:{
        name:{type:String},
        id:{type:mongoose.Types.ObjectId},
        photo:{type:String}
    },

    operatingId:{type: mongoose.Types.ObjectId},
    appointmentDate:{
        type:Date,
    },
    appointmentCreated:{
        type:Date,
        default:Date.now()
    }
});

module.exports = mongoose.model('Appointment', Appointment);
