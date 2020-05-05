const express = require('express')
const router = express.Router();
const Appointment = require('../services/modals/Appointment');
const Staff = require('../services/modals/Staff');
const Operatings = require('../services/modals/Operatings');
const verifyToken = require('../services/middleware/verify-token');
const Users = require('../services/modals/Users');
const moment = require('moment');
require('moment/locale/tr');

/*router.post('/addAppointment/:_id',verifyToken,(req,res,next)=>{
    const {appointmentName,staffName,name,photo,id,date,time} =req.body;
    let date1= new Date(date+'T'+time);
    const NewAppointment = new Appointment({
        appointmentName,
        staffName,
        user:{name:name,photo:photo,id:id},
        operatingId:req.params._id,
        appointmentDate:date1,
    });
    const promise = NewAppointment.save();
    promise.then((data)=>{
        res.json(data)
    }).catch((err)=>{
        res.json(err);
    })
});*/

router.post('/addAppointment/:_id',verifyToken,(req,res,next)=>{
    const {appointmentName,staffName,name,photo,id,date,time,staffId} =req.body;

    let date1= new Date();
    date1.setFullYear(parseInt(date.split("-")[0]));
    date1.setMonth(parseInt(date.split("-")[1])-1);
    date1.setDate(parseInt(date.split("-")[2]));
    date1.setHours(parseInt(time.split(":")[0])+3);
    date1.setMinutes(parseInt(time.split(":")[1]));
    let date2 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(), date1.getHours(), date1.getMinutes(), 0, 0);
    const NewAppointment = new Appointment({
        appointmentName,
        staffName,
        user:{name:name,photo:photo,id:id},
        operatingId:req.params._id,
        appointmentDate:date2,
        staffId:staffId
    });
    const promise = NewAppointment.save();
    promise.then((data)=>{
        Appointment.findOne({_id:data._id},(err,Appo)=>{
            if(Appo){
                Staff.updateOne({_id:Appo.staffId},{$push:{appointmentDate:{date:req.body.date,time:req.body.time}}})
                  .then(data=>{
                      res.json('Başarılı');
                  })
            }
        })
    }).catch((err)=>{
        res.json(err);
    })
});

router.post('/getTime/:_id',verifyToken, (req, res) => {
    const {date} =req.body;
    Staff.findOne({_id:req.params._id})
      .then((data) => {
          let list = [];
          data.appointmentDate.map(item=>item.date == date && list.push(item.time));
          res.json(list)
      }).catch((err) => {
        res.json(err);
    })
});

router.post('/listStaff/:_id',verifyToken, (req, res) => {
    const {operations} = req.body;
    if(operations.length == 0){
        res.json({status:false,message:' Devam etmeden önce işlem seçiniz.'})
    }
    console.log(operations.length)
    if(operations.length=== 1){
        Staff.find({staffOperatingId:req.params._id})
        .then((data) => {
            const staffList=[];
            data.map(item=>{item.staffOperations.map(item2=>{
                if(item2.operationName==operations[0]){
                    staffList.push(item)
                }})});
            res.json(staffList);
        }).catch((err) => {
            res.json(err);
        })
    }
    if(operations.length=== 2){
        Staff.find({staffOperatingId:req.params._id})
        .then((data) => {
            const staffList2=[];
            const staffFinalList=[];
            data.map(item=>{item.staffOperations.map(item2=>{
                if(item2.operationName==operations[0]) {
                    staffList2.push(item)
                }})});
            staffList2.map(item=>{item.staffOperations.map(item2=>{
                if(item2.operationName==operations[1]) {
                    staffFinalList.push(item)
                }})});
            res.json(staffFinalList);
        }).catch((err) => {
            res.json(err);
        })
    }
    if(operations.length>2){
        Staff.find({staffOperatingId:req.params._id})
        .then((data) => {
            res.json(data);
        }).catch((err) => {
            res.json(err);
        })
    }
});

router.get('/getUserAppointment',verifyToken, (req, res) => {
    Users.findOne({_id:req.user_id})
      .populate('userAppointments')
      .then((data) => {
          res.json(data.userAppointments);
      }).catch((err) => {
        res.json(err);
    })
});

router.get('/getAppointment',verifyToken, (req, res) => {
    const promise = Appointment.find({operatingId:req.operating_id,appointmentType:1});
    promise.then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json(err);
    })
});

router.get('/getPendingAppointment',verifyToken, (req, res) => {
    const promise = Appointment.find({operatingId:req.operating_id,appointmentType:0});
    promise.then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json(err);
    })
});

router.post('/findDate/:_id',verifyToken,(req,res,next)=>{
    const {date} =req.body;
    let newDate= new Date(date);
    let dayCount =newDate.getDay();
    if(dayCount==0){
        Staff.findOne({_id:req.params._id})
          .then((data) => {res.json(data.staffWorkTime[0].sunday)})
          .catch(err=>{res.json(err)})
    }
    if(dayCount==1){
        Staff.findOne({_id:req.params._id})
          .then((data) => {res.json(data.staffWorkTime[0].monday)})
          .catch(err=>{res.json(err)})
    }
    if(dayCount==2){
        Staff.findOne({_id:req.params._id})
          .then((data) => {res.json(data.staffWorkTime[0].tuesday)})
          .catch(err=>{res.json(err)})
    }
    if(dayCount==3){
        Staff.findOne({_id:req.params._id})
          .then((data) => {res.json(data.staffWorkTime[0].wednesday)})
          .catch(err=>{res.json(err)})
    }
    if(dayCount==4){
        Staff.findOne({_id:req.params._id})
          .then((data) => {res.json(data.staffWorkTime[0].thursday)})
          .catch(err=>{res.json(err)})
    }
    if(dayCount==5){
        Staff.findOne({_id:req.params._id})
          .then((data) => {res.json(data.staffWorkTime[0].friday)})
          .catch(err=>{res.json(err)})
    }
    if(dayCount==6){
        Staff.findOne({_id:req.params._id})
          .then((data) => {res.json(data.staffWorkTime[0].saturday)})
          .catch(err=>{res.json(err)})
    }
});

router.get('/confirmation/:_id',verifyToken, (req, res) => {
    Appointment.findByIdAndUpdate({_id:req.params._id},{$set:{appointmentType:1}}
      ,{new:true})
      .then(data=>{
          Users.findByIdAndUpdate({_id:data.user.id},{$push:{userAppointments:req.params._id}},{new:true})
            .then(data1=>{
                res.json(data1)
            })
            .catch(err=>{
                res.json(err)
            })
      })
      .catch(err=>{
          res.json(err)})
});

router.get('/rejection/:_id',verifyToken, (req, res) => {
    Appointment.findByIdAndRemove({_id:req.params._id}
      ,{new:true})
      .then(data=>{
          res.json(data)})
      .catch(err=>{
          res.json(err)})
});


module.exports = router;
