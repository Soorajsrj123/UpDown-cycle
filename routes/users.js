const { response } = require('express');
var express = require('express');
const userHelpers = require('../helpers/userHelpers');
var router = express.Router();
const config = require('../config/otp');
const otp = require('../config/otp');
const productHelpers = require('../helpers/productHelpers');
const { product } = require('../config/connection');
const userController = require('../controller/userController');
const Client = require('twilio')(config.accountId, config.authToken)

/* GET users listing. */

// home page
router.get('/',userController.landingPage);

// user login
router.get('/login',userController.loginPageGet);

router.post('/login',userController.loginPagePost)
// user SIGNUP

router.get('/signup',userController.signUpPageGet)

router.post('/signup',userController.signUpPagePost)

//OTP LOGIN
router.get('/otp',userController.otpPage)

router.get('/otp-login',userController.otpLogin)

router.get('/otp-verify', userController.otpVerify)



// shop page
router.get('/shop',userController.shopPage)


// product page  //page for product zoom
router.get('/products/:id',userController.productPage)

// CART MANAGEMENT

// cart page
router.get('/cart',userController.cartPage)

// for get prod details
router.get('/add-to-cart/:id',userController.addToCart)

// USER logout
router.get('/logout',userController.logout)

router.post('/change-product-quantity',userController.changeQuantity)

router.post('/remove-product',userController.removeProductCart)

router.get('/check-out',userController.checkoutGet)

router.post('/check-out',userController.checkoutPost)

router.get('/orders',userController.getorders)

router.post('/cancelOrder',userController.cancelOrder)
router.get('/success',userController.success)

router.get('/profile',userController.userProfile)

router.get('/address',userController.getaddress)

router.get('//filladdress/:id',(userController.filladress))







router.get('/page', (req, res, next) => {
  res.render('users/user-page')
})

module.exports = router;
