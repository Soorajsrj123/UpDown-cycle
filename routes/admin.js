var express = require('express');
const { product } = require('../config/connection');
var router = express.Router();
const layout = 'admin-layout'
var productHelpers = require("../helpers/productHelpers")
var adminHelpers = require('../helpers/adminHelpers');
const adminController = require('../controller/adminControler');
const { Router, response } = require('express');
const { editProduct } = require('../helpers/productHelpers');
/* GET home page. */

// ADMIN PAGE
router.get('/',adminController.dashBoard);

// admin products

router.get('/products', adminController.productPage);

//ADD products
router.get('/add-product',adminController.addProductGet)

router.post('/add-product', adminController.addProductPost)

// edit products
router.get('/edit-product/:id',adminController.editProductGet)                                                    //////////////
router.post('/edit-product/:id', adminController.editProductPost)

// Delete products
router.get('/delete-product/:id',adminController.deleteProduct)

// USER Management
// user view
router.get('/users',adminController.userManagement)

router.get('/block-user/:id',adminController.blockUserGet)

router.get('/unblock-user/:id',adminController.unblockUserGet)

//CATEGORY MANAGEMENT

router.get('/category',adminController.category)
// add caegory
router.get('/add-category',adminController.addCategoryGet)


router.post('/add-category',adminController.addCategoryPost)

// edit catogory

router.get('/edit-category/:id', adminController.editCategoryGet)

router.post('/edit-category/:id', adminController.editCategoryPost)

// delete catogory
router.get('/delete-category/:id',adminController.deleteCategory)


router.get('/orders',adminController.getOrderDetails)
// router.post('/orders',adminController.cancellOrder)


// login 
router.get('/login',adminController.loginGet)


router.post('/login', adminController.loginPost)

router.get('/logout', adminController.logout)


module.exports = router;
