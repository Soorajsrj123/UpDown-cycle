const { response } = require('express');
var express = require('express');
const userHelpers = require('../helpers/userHelpers');
var router = express.Router();
const config = require('../config/otp');
const otp = require('../config/otp');
const productHelpers = require('../helpers/productHelpers');
const { product, user } = require('../config/connection');
const userController = require('../controller/userController');
const { verifyLogin } = require('../controller/userController');
const { verifyAdmin } = require('../controller/adminControler');
const adminControler = require('../controller/adminControler');
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

router.get('/logout',userController.logout)

//OTP LOGIN
router.get('/otp',verifyLogin,userController.otpPage)

router.get('/otp-login',verifyLogin,userController.otpLogin)

router.get('/otp-verify',verifyLogin, userController.otpVerify)



// shop page
router.get('/shop',verifyLogin,userController.shopPage)


// product page  //page for product zoom
router.get('/products/:id',verifyLogin,userController.productPage)

// CART MANAGEMENT

// cart page
router.get('/cart',verifyLogin,userController.cartPage)

// for get prod details
router.get('/add-to-cart/:id',userController.addToCart)

// USER logout

// put
router.put('/change-product-quantity',verifyLogin,userController.changeQuantity)

router.post('/remove-product',verifyLogin,userController.removeProductCart)

router.get('/check-out',verifyLogin,userController.checkoutGet)

router.post('/check-out',verifyLogin,userController.checkoutPost)

router.get('/orders',verifyLogin,userController.getorders)

router.put('/cancelOrder',verifyLogin,userController.cancelOrder)
router.get('/success',verifyLogin,userController.success)

router.get('/profile',verifyLogin,userController.userProfile)
router.post('/edit-address',verifyLogin,userController.editAddress)

router.get('/address',verifyLogin,userController.getaddress)

router.get('/fill-address/:id',verifyLogin,userController.filladress)

router.post('/verify-payment',verifyLogin,userController.verifyPayment)
router.post('/deleteAddress',verifyLogin,userController.removeAddress)
router.get('/check-cart-quantity/:id',verifyLogin,userController.checkCartQuantity)

router.get('/paypal-success',verifyLogin,userController.paypalSuccess)

router.post('/create-order',verifyLogin,userController.paypalOrder)
router.post('/add-address',verifyLogin,userController.addAddress)
router.post('/changeUserProfile',verifyLogin,userController.changeUserProfile)

router.post('/return-order',verifyLogin,userController.returnOrder)

router.get('/downloadinvoice/:id',verifyAdmin,userController.downloadinvoice)

router.get('/add-wishlist/:id',verifyAdmin,adminControler.getwishlist)








// router.get('/page', (req, res, next) => {
//   res.render('users/user-page')
// })


module.exports = router;
