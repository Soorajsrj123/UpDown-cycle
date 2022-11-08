const { response } = require('express');
var express = require('express');
const userHelpers = require('../helpers/userHelpers');
var router = express.Router();
const config = require('../config/otp');
const otp = require('../config/otp');
const productHelpers = require('../helpers/productHelpers');
const { product } = require('../config/connection');
const Client = require('twilio')(config.accountId, config.authToken)

/* GET users listing. */

// home page
router.get('/', function (req, res, next) {
  let user = req.session.loggedIn
  if (user) {
    res.render('index', { nav: true, user });
  }
  else {
    res.redirect('/login')
  }


});

// user login
router.get('/login', (req, res, next) => {
  if (req.session.loggedIn) {
res.redirect('/')
  }else{
  res.render('users/user-login', { nav: false })
  }
})

router.post('/login', (req, res) => {
  console.log(req.body);
  userHelpers.doLogin(req.body).then((response) => {

    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.send({ value: 'success' })
    }
    else {
      res.send({ value: 'failed' })
    }
  })
})
// user SIGNUP

router.get('/signup', (req, res) => {
  res.render('users/user-signup', { nav: false })
})

router.post('/signup', (req, res) => {
  userHelpers.doSignUp(req.body).then((response) => {
    if (!response.status) {
      res.send({ value: 'failed' })
    } else {
      res.send({ value: 'success' })
    }
  })
})

//OTP LOGIN
router.get('/otp', (req, res) => {
  res.render('users/otp')
})

router.get('/otp-login', (req, res) => {

  Client.verify.services(config.serviceId).verifications.create({

    to: `+91${req.query.mobileNumber.trim()}`,
    channel: 'sms'
  }).then((data) => {
    res.status(200).send(data)
  })
})

router.get('/otp-verify', (req, res) => {
  Client.verify.services(otp.serviceId).verificationChecks.create({
    to: `+91${req.query.mobileNumber.trim()}`,
    code: req.query.code

  }).then((data) => {

    if (data.valid) {
      req.session.loggedIn = true
      res.status(200)
      res.send({ value: 'success' })
    }
    else {
      res.send({ value: 'failed' })
    }
  }).catch(err => {
    res.send(err)
  })
})
// USER logout
router.get('/logout', (req, res) => {
  req.session.loggedIn = false
  res.redirect('/login')
})









// shop page
router.get('/shop', (req, res, next) => {
  productHelpers.getAllproducts().then((products) => {
    res.render('users/user-shop', { products, nav: true ,user:true})
  })

})
// product page
router.get('/products/:id', (req, res, next) => {
  let proId = req.params.id
  productHelpers.getProductDetails(proId).then((products) => {
    res.render('users/user-product', { products, nav: true })
  })

})

router.get('/page', (req, res, next) => {
  res.render('users/user-page')
})

module.exports = router;
