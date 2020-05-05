const express = require('express')
const router = express.Router();
const Category = require('../services/modals/Category');
const Operatings = require('../services/modals/Operatings');
const verifyToken = require('../services/middleware/verify-token');

router.get('/getOperation', (req, res) => {
    const promise = Category.find({});
    promise.then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json(err);
    })
});

router.post('/add&deleteOperation/:operationId',verifyToken,(req,res)=>{
    const {nameOperation, type} =req.body;
    Operatings.findOne({_id:req.operating_id},(err,docs)=>{
        if(docs){
            var count = docs.operationId.includes(req.params.operationId);
            if(count==false){
                const promise = Operatings.updateOne({_id:req.operating_id},{ $push: { operations: { operationName:nameOperation,type:type,subId:req.params.operationId},operationId:req.params.operationId}},{new:true});
                promise.then(data=>{res.json('Ekleme Başarılı');})
                  .catch(err=>{res.json(err);})
            }else if(count==true){
                const promise = Operatings.updateOne({_id:req.operating_id},{ $pull: { operations: { operationName:nameOperation},operationId:req.params.operationId}},{new:true});
                promise.then(data=>{res.json('Silme Başarılı');})
                  .catch(err=>{res.json(err);})
            }
        }
    })
});

router.post('/updateOperationPrice/:operationId',verifyToken,(req,res)=>{
    const {operationPrice} =req.body;
    const promise = Operatings.updateOne({_id:req.operating_id,'operations.subId':req.params.operationId},{ $set:
        {  "operations.$.operationPrice":operationPrice}},{new:true});
    promise.then(data=>{res.json('Düzenleme Başarılı');})
    .catch(err=>{res.json(err);})
});

router.get('/getOperationPrice',verifyToken,(req,res)=>{
    const promise = Operatings.findOne({_id:req.operating_id});
    promise.then(data=>{res.json(data.operations);})
    .catch(err=>{res.json(err);})
});

router.get('/getOperationPrice/:_id',verifyToken,(req,res)=>{
    const promise = Operatings.findOne({_id:req.params._id});
    promise.then(data=>{res.json(data.operations);})
    .catch(err=>{res.json(err);})
});

module.exports = router;
