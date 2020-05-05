const express = require('express');
const router = express.Router();
const FeedBack = require('../services/modals/FeedBack');

router.post('/addFeedback',(req,res,next)=>{
    const {telephone,title,description} =req.body;
	const NewFeedBack = new FeedBack({
        telephone,
        title,
        description,
	});
  const promise = NewFeedBack.save();
	promise.then((data)=>{
		res.json(data)
	}).catch((err)=>{
		res.json(err);
	})
});

module.exports = router;
