const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Campaign = new Schema({
    campaignName:{
        type:String
    },
    campaignOperatingId:{
        type: mongoose.Types.ObjectId
    },
    campaignDescription:{
        type:String
    },
    campaignPhoto:{
        type:String,
        default:'uploads/default/campaign.png',
    },
    campaignStartdate:{
        type:Date
    },
    campaignFinishdate:{
        type:Date
    }
});

module.exports = mongoose.model('Campaign', Campaign);
