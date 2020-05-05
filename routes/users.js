const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../services/modals/Users');
const Operatings = require('../services/modals/Operatings');
const verifyToken = require('../services/middleware/verify-token');
const multer =require('multer');
const smsSend = require('../services/modals/sms');
const fs =require('fs');
const randomInt = require('random-int');
const gnp = require('generate-password');

router.post('/register',(req,res,next)=>{
	const {fullName,password,telephone} = req.body;
	Users.findOne({telephone:telephone},(err,data)=>{
		if(data){
			res.json({
				status: false,
				message: 'Register failed, user is already registered'});
		}else{
      var verification_code = randomInt(1000,9999);
			bcrypt.hash(password,10).then((hash)=>{
				const New = new Users({
          fullName,
          telephone,
          userSmsCode:verification_code,
					password:hash
				});
				const promise = New.save();
				promise.then((data)=>{
          smsSend('Sn '+req.body.fullName+' eKuaförüm uygulamasına hoşgeldiniz!! Doğrulama kodunuz: '+verification_code,req.body.telephone);
					res.json(data)
				}).catch((err)=>{
					res.json(err);
				})
			});
		}
	})
});

router.post('/forgetPassword/v1/', (req, res) => {
  const { telephone } = req.body;
    const verification_code = randomInt(1000,9999);
    Users.updateOne({telephone},{$set:{userSmsCode:verification_code}})
    .then(data=>{
      smsSend('Telefon numarası doğrulama kodunuz: '+verification_code,req.body.telephone);
      res.json({
				status: true,
				message: 'Doğrulama kodu Telefonunuza gönderildi'});
    })
    .catch((err)=>{
      res.json({
				status: false,
				message: 'Doğrulama kodu Telefonunuza gönderilemedi'});
  });
});

router.post('/forgetPassword/v2/', (req, res) => {
  const { telephone,userSmsCode } = req.body;
  const password = gnp.generate({
    length: 10,
    uppercase: true});
  Users.findOne({telephone:telephone},(error,Users)=>{
    if(Users.userSmsCode==userSmsCode){
      bcrypt.hash(password,10).then((hash)=>{
        Users.updateOne({ $set: {
            password:hash,
            userSmsCode:0
          } },{new: true})
          .then((data)=>{
            smsSend('Şifrenizi kimse ile lütfen paylaşmayınız. Yeni şifreniz: '+password,req.body.telephone);
            res.json({
              status: true,
              message: 'Şifreniz başarıyla değiştirildi.'});
          }).catch((err)=>{
          res.json({
            status: false,
            message: 'Şifrenizi değiştirirken bir hata oluştu.'});
        });
      });
    }else{
      res.json({
        status: false,
        message: 'Eşleşmeyen kod.'});
    }
  })
});

router.post('/removeTelephone', (req, res) => {
  const { telephone } = req.body;
  Users.findOneAndDelete({telephone:telephone})
    .then(data =>{
      res.json('Kullanıcı başarıyla silindi');
    })
    .catch(err=>{
      res.json(err);
    })
});

router.post('/changeCode', (req, res) => {
  const { telephone } = req.body;
  const verification_code = randomInt(1000,9999);
  Users.findOneAndUpdate({telephone},{$set:{userSmsCode:verification_code}})
    .then(data =>{
      smsSend('Telefon numarası doğrulama kodunuz: '+verification_code,req.body.telephone);
      res.json('Kod Başarıyla değiştirildi');
    })
    .catch(err=>{
      res.json(err);
    })
});

router.post('/code', (req, res) => {
  const { telephone, userSmsCode } = req.body;
  Users.findOne({telephone})
  .then(data =>{
    if(data.userSmsCode===userSmsCode){
        Users.updateOne({telephone},{$set:{userSmsCode:0}})
        .then(data =>{
          res.json('Doğrulama kodu başarılı');
        })
        .catch(err=>{
          res.json(err);
        })
    }else{
      res.json('Bulunamadı');
    }
    })
  .catch(err=>{
    res.json(err);
  })
});

router.post('/removeCode', (req, res) => {
  const { telephone } = req.body;
  Users.findOne({telephone})
  .then(data =>{
    if(data){
        Users.deleteOne({telephone})
        .then(data =>{
          res.json('Kod Başarıyla silindi');
        })
        .catch(err=>{
          res.json(err);
        })
    }else{
      res.json('Kullanıcı Bulunamadı');
    }
    })
  .catch(err=>{
    res.json(err);
  })
});


router.post('/login', (req, res) => {
	const { telephone, password } = req.body;
	Users.findOne({telephone}, (err, Users) => {
    if(!Users){
      res.json({
        status: false,
        message: 'Telefon, kullanıcı bulunamadı.'
      });
    }else{
      if(Users.userSmsCode==0){
        const user_id=Users._id;
        bcrypt.compare(password, Users.password).then((result) => {
          if (result){
                      const token = jwt.sign({user_id:Users._id}, req.app.get('api_key'));
            res.json({status:true, token, user_id})
          }else{
            res.json({
              status: false,
              message: 'Doğrulama hatası, hatalı parola.'
            });
                  }
              })

      }else{
        res.json('Doğrulanmamış kullanıcı')
      }
    }
    })
});

router.post('/changePassword',verifyToken, (req, res) => {
  const { password , newpassword } = req.body;
  Users.findOne({_id:req.user_id},(error,Users)=>{
    if(Users){
      bcrypt.compare(password, Users.password).then((result) => {
        if(result===true){
          bcrypt.hash(newpassword,10).then((hash)=>{
            Users.updateOne({ $set: {
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

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads/users/');
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
    Users.findOne({_id:req.user_id})
    .exec()
    .then(data=>{
      fs.unlink('./uploads/users/'+data.userPhoto, (err)=> {
        if(err){
            console.log(err)
        }
      })
      const promise = Users.findByIdAndUpdate({_id:req.user_id}, { $set: {userPhoto:'uploads/users/'+req.file.filename} },{new: true});
          promise.then((data)=>{
            res.json(data);
          }).catch((err)=>{
              res.json(err);
          })
    })
  });

router.get('/getProfile',verifyToken,(req,res)=>{
    const promise = Users.findOne({_id:req.user_id});
        promise.then((data)=>{
            res.json(data);
        }).catch((err)=>{
            res.json(err);
        })
});

router.get('/getFavorite', verifyToken, (req,res)=>{
  Users.findOne({_id:req.user_id})
        .populate('userFavOperatings')
        .then((data)=>{
            res.json(data.userFavOperatings);
        }).catch((err)=>{
            res.json(err);
        })

});

router.get('/addFavorite/:_id',verifyToken,(req,res)=>{
  Users.findOne({_id:req.user_id},(err,data)=>{
    var count =data.userFavOperatings.indexOf(req.params._id,-1);
    if(count<0){
      Users.findByIdAndUpdate({_id:req.user_id},{$push:{userFavOperatings:req.params._id,userFavorite:req.params._id}},{new:true})
        .exec()
        .then(data=>{
          Operatings.findByIdAndUpdate({_id:req.params._id},{$push:{favorites:req.user_id}},{new:true})
            .exec()
            .then(data=>{res.json(data)})
            .catch(err=>{res.json(err)})
        })
        .catch(err=>{res.json(err)})
    }
  })
});

router.get('/deleteFavorite/:_id',verifyToken,(req,res)=>{
  Users.findOne({_id:req.user_id},(err,data)=>{
    var count =data.userFavOperatings.indexOf(req.params._id,-1);
    if(count>=0){
      Users.findByIdAndUpdate({_id:req.user_id},{$pull:{userFavOperatings:req.params._id,userFavorite:req.params._id}},{new:true})
        .exec()
        .then(data=>{
          Operatings.findByIdAndUpdate({_id:req.params._id},{$pull:{favorites:req.user_id}},{new:true})
            .exec()
            .then(data=>{res.json(data)})
            .catch(err=>{res.json(err)})
        })
        .catch(err=>{res.json(err)})
    }
  })
});

router.post('/addComment/:_id',verifyToken,(req,res)=>{
  const {userComment,userRating} = req.body;
  Users.findOne({_id:req.user_id},(err,data)=>{
    var count =data.operatingComments.indexOf(req.params._id,-1);
    if(count<0){
      Operatings.findByIdAndUpdate({_id:req.params._id},
        {$push:{comments:{userComment:userComment,userRating:userRating,userId:req.user_id,userName:data.fullName,userPhoto:data.userPhoto}}}
      ,{new:true})
        .then(data=>{
          var newCommentCount =data.commentProperty.commentCount+1;
          var newCommentTotal =data.commentProperty.commentTotal+parseInt(userRating);
          var newCommentRating = newCommentTotal/newCommentCount;
          Users.findByIdAndUpdate({_id:req.user_id},{$push:{operatingComments:req.params._id}},{new:true})
          .then(data=>{
            Operatings.findByIdAndUpdate({_id:req.params._id},
              {$set:{commentProperty:{commentCount:newCommentCount,commentTotal:newCommentTotal,commentRating:newCommentRating}}}
            ,{new:true})
              .then(data=>{
                res.json(data);
              })
              .catch(err=>{
                res.json(err);
              })
          })
      })
    }else{
      res.json({
        status: false,
        message: 'Zaten yorum yaptın.'
      });
    }
  })
});

router.get('/getComment',verifyToken,(req,res)=>{
  const promise = Operatings.findOne({_id:req.operating_id});
      promise.then((data)=>{
          res.json(data);
      }).catch((err)=>{
          res.json(err);
      })
});

router.get('/getComment/:_id',verifyToken,(req,res)=>{
  const promise = Operatings.findOne({_id:req.params._id});
      promise.then((data)=>{
          res.json(data);
      }).catch((err)=>{
          res.json(err);
      })
});

router.get('/getNearOperatings',(req,res)=>{
  const {lon,lat} =req.body;
      const promise = Operatings.find({
        operatingLoc:
          { $geoWithin:
            { $centerSphere:
              [ [ lon,lat ] ,
         40 / 6378.1 ] } } } );
          promise.then((data)=>{
              res.json(data);
          }).catch((err)=>{
              res.json(err);
          })
});



module.exports = router;
