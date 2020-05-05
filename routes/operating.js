const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Operatings = require('../services/modals/Operatings');
const Users = require('../services/modals/Users');
const verifyToken = require('../services/middleware/verify-token');
const multer =require('multer');
const fs =require('fs');

router.post('/register',(req,res,next)=>{
	const {operatingName,password,city,district,telephone,hairDresser,beautyCenter,barber} = req.body;
	Operatings.findOne({telephone:telephone},(err,data)=>{
		if(data){
			res.json({
				status: false,
				message: 'Register failed, user is already registered,'});
		}else{
			bcrypt.hash(password,10).then((hash)=>{
				const New = new Operatings({
          operatingName,
          city,
          district,
          telephone,
          hairDresser,
          beautyCenter,
          barber,
					password:hash
				});
				const promise = New.save();
				promise.then((data)=>{
					res.json(data)
				}).catch((err)=>{
					res.json(err);
				})
			});
		}
	})

});

router.post('/login', (req, res) => {
	const { telephone, password } = req.body;

	Operatings.findOne({telephone}, (err, Operatings) => {

		if(!Operatings){
			res.json({
				message: 'Doğrulama hatası, kullanıcı bulunamadı.'
			});
		}else{
      if(Operatings.operatingType==1){
        const operating_id=Operatings._id;
        bcrypt.compare(password, Operatings.password).then((result) => {
          if (result){
                      const token = jwt.sign({operating_id:Operatings._id}, req.app.get('api_key'));
            res.json({status:true, token, operating_id})
          }else{
            res.json({
              status: false,
              message: 'Doğrulama hatası, hatalı parola.'
            });
          }

        })
    }else{
      res.json({
        status: false,
        message: 'Doğrulama hatası, Onaylanmamış kullanıcı.'
      });
    }
    }
  })
});

router.post('/changePassword',verifyToken, (req, res) => {
  const { password , newpassword } = req.body;
  Operatings.findOne({_id:req.operating_id},(error,Operatings)=>{
    if(Operatings){
      bcrypt.compare(password, Operatings.password).then((result) => {
        if(result===true){
          bcrypt.hash(newpassword,10).then((hash)=>{
            Operatings.updateOne({ $set: {
              password:hash
            } },{new: true})
                .then((data)=>{
                    res.json('başarılı');
                }).catch((err3)=>{
                    res.json('başarısız');
                });
          });
        }
      })
    }
  })
});

  //salon düzenle
/*router.put('/setProfile',verifyToken,upload.single('image'),(req,res)=>{
	const {description,district,city,operatingLat,operatingLon} =req.body;

	Operatings.findByIdAndUpdate({_id:req.operating_id}, { $set: {
			description,
			city,
			district,
			operatingLoc:[operatingLon,operatingLat],
			operatingPhoto:'uploads/operatings/'+req.file.filename
		} },{new: true})
		.exec()
		.then(data=>{
			res.json(data);
		}).catch(err =>{
		res.json(err);
	})
});*/

router.post('/setProfile',verifyToken,(req,res)=>{
	const {description,district,city,operatingLat,operatingLon} =req.body;
	Operatings.findByIdAndUpdate({_id:req.operating_id}, { $set: {
			description,
			city,
			district,
			operatingLoc:[operatingLon,operatingLat],
		} },{new: true})
		.exec()
		.then(data=>{
			res.json(data);
		}).catch(err =>{
		res.json(err);
	})
});


const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './uploads/operatings/');
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


router.post('/upload',verifyToken,upload.single('image'),(req,res)=>{
	Operatings.findOne({_id:req.operating_id})
		.exec()
		.then(data=>{
			fs.unlink(data.operatingPhoto, (err)=> {
				if(err){
					console.log(err)
				}
			})
			const promise = Operatings.findByIdAndUpdate({_id:req.operating_id}, { $set: {operatingPhoto:'uploads/operatings/'+req.file.filename} },{new: true});
			promise.then((data)=>{
				res.json(data);
			}).catch((err)=>{
				res.json(err);
			})
		})
});

router.get('/getWorkTime/:_id',(req,res)=>{
	const promise = Operatings.findOne({_id:req.params._id});
	promise.then((data)=>{
		res.json(data.operatingWorkTime);
	}).catch((err)=>{
		res.json(err);
	})
});

//kendi salonum profil
router.get('/getProfile',verifyToken,(req,res)=>{
    const promise = Operatings.findOne({_id:req.operating_id});
        promise.then((data)=>{
            res.json(data);
        }).catch((err)=>{
            res.json(err);
        })
});
//salon profil
router.get('/getProfile/:_id',(req,res)=>{
  const promise = Operatings.findOne({_id:req.params._id});
      promise.then((data)=>{
          res.json(data);
      }).catch((err)=>{
          res.json(err);
      })
});

router.post("/nameSearch" ,(req,res)=>{
  const {search_name} = req.body;
  Operatings.find({ "operatingName" : { $regex: search_name, $options: 'i'}})
  .then(data=>{
    res.json(data)
  })
  .catch(err=>{
    res.json(err)
  })

});

router.post("/barberSearch" ,(req,res)=>{
  const {city,district} = req.body;
  Operatings.find({$and: [
  	{barber:1},
    {"city": {$regex: city, $options: 'i'}},
    {"district": {$regex: district, $options: 'i'}}
]})
  .then(data=>{
    res.json(data)
  })
  .catch(err=>{
    res.json(err)
  })

});

router.post("/hairDresserSearch" ,(req,res)=>{
  const {city,district} = req.body;
  Operatings.find({$and: [
  	{hairDresser:1},
    {"city": {$regex: city, $options: 'i'}},
    {"district": {$regex: district, $options: 'i'}}
]})
  .then(data=>{
    res.json(data)
  })
  .catch(err=>{
    res.json(err)
  })

});

router.post("/beautyCenterSearch" ,(req,res)=>{
  const {city,district} = req.body;
  Operatings.find({$and: [
  	{beautyCenter:1},
    {"city": {$regex: city, $options: 'i'}},
    {"district": {$regex: district, $options: 'i'}}
]})
  .then(data=>{
    res.json(data)
  })
  .catch(err=>{
    res.json(err)
  })

});

router.post('/updateWorkTime',verifyToken,(req,res)=>{
  const {
    mondayStart,mondayEnd,
    tuesdayStart,tuesdayEnd,
    wednesdayStart,wednesdayEnd,
    thursdayStart,thursdayEnd,
    fridayStart,fridayEnd,
    saturdayStart,saturdayEnd,
    sundayStart,sundayEnd,
  } =req.body;
  Operatings.findByIdAndUpdate({_id:req.operating_id}, { $set: {
    operatingWorkTime:{monday:{startDate:mondayStart,finishDate:mondayEnd},
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
    res.json(data.operatingWorkTime);
  }).catch(err =>{
  res.json(err);
})
});



module.exports = router;
