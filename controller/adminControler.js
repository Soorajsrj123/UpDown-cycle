var express = require('express');
const { product } = require('../config/connection');
var router = express.Router();
const layout = 'admin-layout'
var productHelpers = require("../helpers/productHelpers")
var adminHelpers = require('../helpers/adminHelpers');
const adminController = require('../controller/adminControler');
const { Router, response } = require('express');
const { editProduct } = require('../helpers/productHelpers');
const { Db } = require('mongodb');

module.exports = {

    dashBoard: function (req, res) {
        if (req.session.adminlogIn) {
            res.render('admin/admin-page', { layout, nav: true });
        } else {
            res.redirect('/admin/login')
        }
    },

    productPage: function (req, res) {

        productHelpers.getAllproducts().then((products) => {
            res.render('admin/products', { layout, products, nav: true })

        })
    },
    addProductGet: (req, res, next) => {
        productHelpers.getCategory().then((cata) => {

            res.render('admin/add-products', { layout, nav: true, cata })

        })
    },
    addProductPost:(req, res) => {
        productHelpers.addProducts(req.body).then((insertedId) => {
          console.log(req.body);
          if(req?.files?.image){
          let image = req.files.image
          let imageName = insertedId
          image.mv('./public/productimages/' + imageName + '.jpg')
          res.redirect('/admin/products')
          }else{
            res.redirect('/admin/products')
          }
        })
      
      },
      editProductGet:async (req, res) => {

        let product = await productHelpers.getProductDetails(req.params.id)
        productHelpers.getCategory().then((category) => {
      
          res.render('admin/edit-products', { layout, product, nav: true, category })
        })    
      },
      editProductPost:(req, res) => {
        productHelpers.editProduct(req.params.id, req.body).then(() => {
          if (req?.files?.image) {
            let image = req.files.image
            let imageName = req.params.id
            image.mv('./public/productimages/' + imageName + '.jpg')
      
            res.redirect('/admin/products')
          }
          else {
            res.redirect('/admin/products')
          }
        })
      },
      deleteProduct:(req, res) => {

        productHelpers.deleteProduct(req.params.id).then(() => {
          res.redirect('/admin/products')
          console.log("yes");
        })
      },
      userManagement: (req, res) => {
        adminHelpers.getUserDetails().then((user) => {
      
          res.render('admin/users', { layout, user, nav: true })
        })
      
      },
      blockUserGet:(req, res) => {
        let userId = req.params.id
        adminHelpers.blockUser(userId).then(() => {
          res.redirect('/admin/users')
        })
      
      },
      unblockUserGet: (req, res) => {
        let userId = req.params.id
        adminHelpers.unBlockUser(userId).then(() => {
          res.redirect('/admin/users')
        })
      
      },
      category: (req, res) => {
        productHelpers.getCategory().then((category) => {
          console.log(category);
          res.render('admin/category', { layout, nav: true, category })
        })
      
      },
      addCategoryGet:(req, res) => {
        res.render('admin/add-category', { layout, nav: true })
      },
      addCategoryPost: (req, res) => {

        productHelpers.addCategory(req.body).then((data) => {
          if (data.status) {
            res.send({ value: "success" })
          }
          else {
            res.send({ value: "failed" })
          }
        })
      
      },
      editCategoryGet:async (req, res) => {
        let category = await productHelpers.getCategoryDetails(req.params.id)
        res.render('admin/edit-category', { layout, category, nav: true })
      
      },
      editCategoryPost:(req, res) => {

        productHelpers.updateCategory(req.params.id, req.body).then(() => {
      
          res.redirect('/admin/category')
        })
      },
      deleteCategory:(req, res) => {
        let category = req.params.id
        productHelpers.deleteCategory(category).then((response) => {
          res.redirect('/admin/category')
        })
      },
     getOrderDetails:async(req,res)=>{

     let orders=await productHelpers.getOrderDetails()
     res.render('admin/order-management',{orders,layout,nav:true})

     }
      ,
      loginGet: (req, res) => {
        if (req.session.adminlogIn) {
          res.redirect('/admin')
        } else {
          res.render('admin/login')
      
        }
      
      },
      loginPost:(req, res) => {
        adminHelpers.doLogin(req.body).then((response) => {
          console.log("yes coming");
          if (response.status) {
            req.session.adminlogIn = true
            res.redirect('/admin')
          } else {
      
            res.redirect('/admin/login');
          }
        })
      },
      logout:(req, res) => {
        req.session.adminlogIn = false
        res.redirect('/admin/login',)
      }
}