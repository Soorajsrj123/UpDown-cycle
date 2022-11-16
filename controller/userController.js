const { response } = require('express');
var express = require('express');
const userHelpers = require('../helpers/userHelpers');
var router = express.Router();
const config = require('../config/otp');
const otp = require('../config/otp');
const productHelpers = require('../helpers/productHelpers');
const { product } = require('../config/connection');
const userController = require('../controller/userController');
const { resolveInclude } = require('ejs');
const { Db } = require('mongodb');
const Client = require('twilio')(config.accountId, config.authToken)


module.exports = {

    landingPage: async function (req, res, next) {
        let user = req.session.loggedIn
        if (user) {
            let cartCount = await userHelpers.getCartCount(req.session.user._id)
            res.render('index', { nav: true, user, cartCount });
        }
        else {
            res.render('index', { nav: true, user: false })
        }


    },

    loginPageGet: (req, res, next) => {
        if (req.session.loggedIn) {
            res.redirect('/')
        } else {
            res.render('users/user-login', { nav: false })
        }
    },

    loginPagePost: (req, res) => {
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
    },

    signUpPageGet: (req, res) => {
        res.render('users/user-signup', { nav: false })
    },

    signUpPagePost: (req, res) => {
        userHelpers.doSignUp(req.body).then((response) => {
            if (!response.status) {
                res.send({ value: 'failed' })
            } else {
                req.session.loggedIn = true
                res.send({ value: 'success' })
            }
        })
    },
    otpPage: (req, res) => {
        res.render('users/otp')
    },

    otpLogin: (req, res) => {

        Client.verify.services(config.serviceId).verifications.create({

            to: `+91${req.query.mobileNumber.trim()}`,
            channel: 'sms'
        }).then((data) => {
            res.status(200).send(data)
        })
    },

    otpVerify: (req, res) => {
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
    },

    shopPage: (req, res, next) => {
        if (req.session.loggedIn) {
            productHelpers.getAllproducts().then(async (products) => {
                let cartCount = await userHelpers.getCartCount(req.session.user._id)
                res.render('users/user-shop', { products, nav: true, user: true, cartCount })
            })
        }
        else {
            res.redirect('/')
        }

    },

    productPage: (req, res, next) => {
        let proId = req.params.id
        productHelpers.getProductDetails(proId).then((products) => {
            res.render('users/user-product', { products, nav: true, user: true })
        })

    },

    cartPage: async (req, res) => {

        let products = await userHelpers.getCartProducts(req.session.user._id)
        console.log(products);
        let cartCount = await userHelpers.getCartCount(req.session.user._id)
        let total = await userHelpers.getTotalAmmount(req.session.user._id)
        res.render('users/cart', { total, products, nav: true, user: true, cartCount })
    },
    addToCart: (req, res) => {
        userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
            res.json({ status: true })
        })

    },

    changeQuantity: (req, res) => {
        console.log('req.body');
        console.log(req.body);
        userHelpers.changeProductQuantity(req.body).then(async (response) => {
            response.total = await userHelpers.getTotalAmmount(req.session.user._id)
            console.log(response);
            res.json(response)
        })
    },
    removeProductCart: (req, res) => {
        // console.log(req.body);
        userHelpers.removeProductFromCart(req.body).then((response) => {
            res.json(response)
        })


    },
    checkoutGet: async (req, res) => {
        userId = req.session.user._id
        let address=await userHelpers.getaddress(userId)
        
        let total = await userHelpers.getTotalAmmount(req.session.user._id)
        res.render('users/checkout', { total, nav: true, user: true,address })

    },
    checkoutPost: (req, res) => {
        req.body.userId = req.session.user._id

        userHelpers.placeOrder(req.body).then((response) => {
            res.json(response)
        })
    },

    success: (req, res) => {
        res.render('users/successpage')
    },
    getorders: async (req, res) => {
        req.body.userId = req.session.user._id
        let orderItems = await userHelpers.getorders(req.body.userId)
        console.log(orderItems);


        res.render('users/orders', { orderItems,nav:true,user:true })
    },
    cancelOrder: (req, res) => {
    
        userHelpers.cancelOrder(req.body).then((response) => {
            res.json(response)
        })
    },
    userProfile: (req, res) => {
        res.render('users/profile',{nav:true,user:true})
    },
    getaddress:(req,res)=>{
        userId = req.session.user._id
        
        userHelpers.getaddress(userId).then((address)=>{
          

            res.render('users/address',{address})
        })


    },
    filladress:(req,res)=>{
        userId=req.session.user._id
        addrsId=req.params.id

        userHelpers.filladress(userId,addrsId).then((response)=>{
            res.send(data[0].address)
        })


    },

    logout: (req, res) => {
        req.session.loggedIn = false
        res.redirect('/login')
    }

}