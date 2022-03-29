require('dotenv').config();
const express = require('express');
const router = express.Router();
const controller = require('./controller/controller')
const JWT = require('jsonwebtoken');
const { route } = require('express/lib/router');



// Midilwear For Authenticaion 
  
function AuthJwt(req,res,next){
  
    // when token is not sent by user while requesting 
    if(req.headers.authorization === undefined)  return res.sendStatus(401)
    
    let token = req.headers.authorization.split('Api-Key ')[1];
    
     JWT.verify(token, process.env.ACCESS_SECRET, (err, user) => {
        console.log(err)
        if (err) return res.sendStatus(403)
        req.user = user
        next()
      })
    
    }


router.get('/',(req,res)=>{
    res.render('home.pug',{msg : 'All feilds are mendotory !!!',theme : 'info'});
})

router.get('/register',(req,res)=>{
    res.render('register.pug',{msg : 'All feilds are mendotory !!!',theme : 'info'});
})

router.get('/login',(req,res)=>{
    res.render('login.pug',{msg : 'Enter the registered contact number to get an api keys !!!',theme : 'info'});
})

// on error
// router.get('*',(req,res)=>{
//   res.render("./error.pug");
// })

// api for register
router.post('/regiter',controller.register);

// api for getting token
router.post('/login',controller.getToken);

// api for getting provider list
router.get('/getProvider',AuthJwt,controller.getProvider);

// api for getting course list
router.get('/getCourse',AuthJwt,controller.getData);


module.exports = router;