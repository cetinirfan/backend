const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Operatings = new Schema({
    operatingName:{
        type:String
    },
    password:{
        type:String,
    },
    city:{
        type:String,
    },
    description:{
        type:String,
    },
    district:{
        type:String,
    },
    operatingLat: {
        type: String
    },
    operatingLon: {
        type: String
    },
    operatingLoc:[],
    telephone:{
        type:Number,
        unique:true,
    },
    operatingType:{
        type:Number,
        default:0,
    },
    barber:{
        type:Number,
    },
    beautyCenter:{
        type:Number,
    },
    hairDresser:{
        type:Number,
    },
    validationAdmin: {
        type: String
    },
    commentProperty:{
        commentCount:{type:Number,default:0},
        commentTotal:{type:Number,default :0},
        commentRating:{type:Number,default :0}
    },
    comments:[{
        userId:{type:mongoose.Types.ObjectId},
        userComment:{type:String},
        userRating:{type:Number},
        commentDate:{type:Date,default:Date.now()},
        userName:{type:String},
        userPhoto:{type:String}

    }],
    operatingPhoto:{
        type:String,
        default:'uploads/default/operating.jpeg',
    },
    operatingWorkTime:{
        monday:{startDate:{type:String,default:"-"},finishDate:{type:String,default:"-"}},
        tuesday:{startDate:{type:String,default:"-"},finishDate:{type:String,default:"-"}},
        wednesday:{startDate:{type:String,default:"-"},finishDate:{type:String,default:"-"}},
        thursday:{startDate:{type:String,default:"-"},finishDate:{type:String,default:"-"}},
        friday:{startDate:{type:String,default:"-"},finishDate:{type:String,default:"-"}},
        saturday:{startDate:{type:String,default:"-"},finishDate:{type:String,default:"-"}},
        sunday:{startDate:{type:String,default:"-"},finishDate:{type:String,default:"-"}},
    },
    operationId:[],
    operations:[{
        operationName:{type:String},
        operationPrice:{type:Number,default:0},
        type:{type:Number},
        subId:{type:mongoose.Types.ObjectId}
    }],
    oppointments:[],
    favorites:[],
    operatingValidationCreated:{
        type:Date,
    },
    operatingCreated:{
        type:Date,
        default:Date.now()
    }
});

module.exports = mongoose.model('Operatings', Operatings);
