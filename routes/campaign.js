const express = require('express')
const router = express.Router();
const Campaign = require('../services/modals/Campaign');
const Operatings = require('../services/modals/Operatings');
const verifyToken = require('../services/middleware/verify-token');
const multer =require('multer');
const moment = require('moment');
const fs =require('fs');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads/campaign/');
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });

  const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter
  });

router.post('/addCampaign',verifyToken,upload.single('image'),(req,res,next)=>{
    const {campaignName,campaignDescription,campaignStartdate,campaignFinishdate} =req.body;
    let start= new Date(campaignStartdate);
    let finish= new Date(campaignFinishdate);
	const NewCampaign = new Campaign({
        campaignName,
        campaignDescription,
        campaignStartdate:start,
        campaignFinishdate:finish,
        campaignOperatingId:req.operating_id,
        campaignPhoto:'/uploads/campaign/'+req.file.filename
	});
  const promise = NewCampaign.save();
	promise.then((data)=>{
		res.json(data)
	}).catch((err)=>{
		res.json(err);
	})
});

router.get('/controlCampaign',verifyToken,(req,res)=>{
  Campaign.find({campaignOperatingId:req.operating_id})
      .then(data=>{
        data.map(item=>{Math.round(item.campaignFinishdate) < Math.round(Date.now()) ?
          Campaign.findOneAndDelete({_id:item._id})
          .then(data1=>{
            })
            .catch(err=>{
              res.json(err);
            }) : res.status(false)})
      }).catch((err)=>{
          res.json(err);
      })
});
router.get('/getCampaign',verifyToken,(req,res)=>{
  Campaign.find({campaignOperatingId:req.operating_id})
  .then(data=>res.json(data))
  .catch(err=>res.json(err))
});

router.get('/getCampaign/:_id',(req,res)=>{
  Campaign.find({campaignOperatingId:req.params._id})
  .then(data=>{
    let lastDate = Math.round(data.campaignFinishdate);
    let nowDate = Math.round(Date.now());
    if(nowDate>=lastDate){
      Campaign.findOneAndDelete({campaignOperatingId:req.params._id})
      .then(data=>{
        fs.unlink('/uploads/campaign/'+data.campaignPhoto, (err)=> {
          if(err){
              console.log(err)
          }
        });
        res.json(data)
      })
      .catch(err=>{
        res.json(err);
      })
    }else{
      res.json(data)
    }
  }).catch((err)=>{
      res.json(err);
  })
});

router.post('/deleteCampaign/:_id',verifyToken,(req,res)=>{
        Campaign.findByIdAndDelete({_id:req.params._id})
        .exec()
        .then(data=>{
          fs.unlink('/uploads/campaign/'+data.campaignPhoto, (err)=> {
            if(err){
                console.log(err)
            }
          })
            res.json('Başarıyla Silindi');
        })
        .catch(err=>{
            res.json(err);
        })
});

module.exports = router;
