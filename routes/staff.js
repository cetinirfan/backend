const express = require('express')
const router = express.Router();
const Staff = require('../services/modals/Staff');
const Operatings = require('../services/modals/Operatings');
const verifyToken = require('../services/middleware/verify-token');
const multer =require('multer');
const fs =require('fs');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/staff/');
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

router.post('/addStaff',verifyToken,upload.single('image'),(req,res,next)=>{
  const {staffFullName} = req.body;
  const NewStaff = new Staff({
    staffFullName,
    staffOperatingId:req.operating_id,
    staffPhoto:'/uploads/staff/'+req.file.filename
  });
  const promise = NewStaff.save();
  promise.then((data)=>{
    res.json(data);
  }).catch((err)=>{
    res.json(err);
  })

});

router.get('/deleteStaff/:_id',verifyToken,(req,res)=>{
  Staff.findByIdAndDelete({_id:req.params._id})
    .exec()
    .then(data=>{
      fs.unlink('./uploads/staff/'+data.staffPhoto, (err)=> {
        if(err){
          console.log(err)
        }
      });
      res.json('Başarıyla Silindi');
    })
    .catch(err=>{
      res.json(err);
    })
});

router.get('/listStaff',verifyToken,(req,res)=>{
  Staff.find({staffOperatingId:req.operating_id})
    .exec()
    .then(data=>{
      res.json(data);
    })
    .catch(err=>{
      res.json(err);
    })
});

router.post('/addOperation/:operationId',verifyToken, (req, res) => {
  Staff.findByIdAndUpdate({_id:req.params._id},{$unset:{staffOperation:{operationName:''},}},(err,data)=>{
    if(data){
      let {addOperation} = req.body;
      addOperation.forEach(add => {
        const promise = Staff.findByIdAndUpdate({ _id: req.params._id }, { $push: { staffOperation: { operationName:add.name}}}, { new: true });
        promise.then((data) => {
          res.json(data.staffOperation);
        }).catch((err) => {
          res.json(err);
        });
      })
    }
  });
});

router.post('/add&deleteOperation/:_id',verifyToken,(req,res)=>{
  const {nameOperation, type ,subId} =req.body;
  Operatings.findOne({_id:req.operating_id},(err,dataoperating)=>{
      if(dataoperating){
        Staff.findOne({_id:req.params._id},(err,docs)=>{
          if(docs){
            var count = docs.operationId.includes(subId);
              if(count==false){
                const promise = Staff.updateOne({_id:req.params._id},{ $push: { staffOperations: { operationName:nameOperation,type:type,subId:subId},operationId:subId}},{new:true});
                promise.then(data=>{res.json('Ekleme Başarılı');})
                .catch(err=>{res.json(err);})
              }else if(count==true){
                const promise = Staff.updateOne({_id:req.params._id},{ $pull: { staffOperations: { operationName:nameOperation},operationId:subId}},{new:true});
                promise.then(data=>{res.json('Silme Başarılı');})
                .catch(err=>{res.json(err);})
          }
        }
      });
    }
  })
});

router.post('/updateWorkTime/:staffId',verifyToken,(req,res)=>{
  const {
    mondayStart,mondayEnd,
    tuesdayStart,tuesdayEnd,
    wednesdayStart,wednesdayEnd,
    thursdayStart,thursdayEnd,
    fridayStart,fridayEnd,
    saturdayStart,saturdayEnd,
    sundayStart,sundayEnd,
  } =req.body;
  Staff.findByIdAndUpdate({_id:req.params.staffId}, { $set: {
    staffWorkTime:{monday:{startDate:mondayStart,finishDate:mondayEnd},
      tuesday:{startDate:tuesdayStart,finishDate:tuesdayEnd},
      wednesday:{startDate:wednesdayStart,finishDate:wednesdayEnd},
      thursday:{startDate:thursdayStart,finishDate:thursdayEnd},
      friday:{startDate:fridayStart,finishDate:fridayEnd},
      saturday:{startDate:saturdayStart,finishDate:saturdayEnd},
      sunday:{startDate:sundayStart,finishDate:sundayEnd}
  },

  } },{new: true})
  .exec()
  .then(data=>{
    res.json(data.staffWorkTime);
  }).catch(err =>{
  res.json(err);
})
});


router.get('/getStaff/:_id',verifyToken,(req,res)=>{
  Staff.findOne({_id:req.params._id})
    .exec()
    .then(data=>{
      res.json(data.operationId);
    })
    .catch(err=>{
      res.json(err);
    })
});



module.exports = router;
