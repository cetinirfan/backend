const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Users = new Schema({
    fullName:{
        type:String
    },
    password:{
        type:String
    }, 
    telephone:{
        type:Number,
        unique:true
    },
    userPhoto:{
        type:String,
        default:'https://i.hizliresim.com/eMC6le.png',
    },
    userBanType:{
        type:Number,
        default:0,
    },
    userSmsCode:{
        type:String,
    },
    operatingComments:[],
    userAppointments:[{type: mongoose.Types.ObjectId, ref: 'Appointment'}],
    userFavorite:[],
    userFavOperatings:[{type: mongoose.Types.ObjectId, ref: 'Operatings'}],
    userCreated:{
        type:Date,
        default:Date.now()
    }
});

module.exports = mongoose.model('Users', Users);
