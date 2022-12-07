var express = require('express');
const { product } = require('../config/connection');
var router = express.Router();
const layout = 'admin-layout'
var productHelpers = require("../helpers/productHelpers")
var adminHelpers = require('../helpers/adminHelpers');
const adminController = require('../controller/adminControler');
const { Router, response, json } = require('express');

const { Db } = require('mongodb');
const chartHelpers = require('../helpers/chartHelpers');

module.exports = {

  verifyAdmin:(req,res,next)=>{
   if(req.session.adminlogIn)
   {
        next();
   }
   else{
    res.redirect('/admin/login')
   }
  },


  dashBoard: function (req, res) {
    if (req.session.adminlogIn) {
      res.render('admin/admin-page', { layout, nav: true });
    } else {
      res.redirect('/admin/login')
    }
  },

  productPage: function (req, res) {

    productHelpers.getAllproducts().then((products) => {
      // console.log("mjnhgf",products);
      res.render('admin/products', { layout, products, nav: true })

    })
  },
  addProductGet: (req, res, next) => {
    productHelpers.getCategory().then((cata) => {

      res.render('admin/add-products', { layout, nav: true, cata })

    })
  },
  addProductPost:(req, res) => {

    const files=req.files
    const fileName=files.map((file)=>{
      return file.filename
    })
   
   const product=req.body
   product.img=fileName
// console.log('files=>',file);
// console.log('data=>',data);

    productHelpers.addProducts(product).then((insertedId) => {
      res.redirect('/admin/products')
    })
  
  },
  editProductGet: async (req, res) => {

    let product = await productHelpers.getProductDetails(req.params.id)
    productHelpers.getCategory().then((category) => {

      res.render('admin/edit-products', { layout, product, nav: true, category })
    })
  },
  editProductPost: (req, res) => {
    let prodId=req.params.id
    const files=req.files
    const fileName=files.map((file)=>{
      return file.filename
    })
   const product=req.body
   product.img=fileName
 
    
    productHelpers.editProduct(product,prodId).then((data) => {
    
      res.redirect('/admin/products')
    })
  },
  deleteProduct: (req, res) => {

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
  blockUserGet: (req, res) => {
    let userId = req.params.id
    adminHelpers.blockUser(userId).then(() => {
      req.session.loggedIn=false
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
  addCategoryGet: (req, res) => {
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
  editCategoryGet: async (req, res) => {
    let category = await productHelpers.getCategoryDetails(req.params.id)
    res.render('admin/edit-category', { layout, category, nav: true })

  },
  editCategoryPost: (req, res) => {

    productHelpers.updateCategory(req.params.id, req.body).then(() => {

      res.redirect('/admin/category')
    })
  },
  deleteCategory: (req, res) => {
    let category = req.params.id
    productHelpers.deleteCategory(category).then((response) => {
      res.redirect('/admin/category')
    })
  },
  getOrderDetails: async (req, res) => {

    let orderitems = await productHelpers.getOrderDetails()
    console.log('yes orders', orderitems);
    res.render('admin/order-management', { orderitems, layout, nav: true })

  }
  ,
  loginGet: (req, res) => {
    if (req.session.adminlogIn) {
      res.redirect('/admin')
    } else {
      res.render('admin/login')

    }

  },
  loginPost: (req, res) => {
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
  viewMore: async (req, res) => {
    let allOrders = await adminHelpers.orderDetails(req.params.id)
    res.render('admin/view-more', { allOrders })
  }
  , logout: (req, res) => {
    req.session.adminlogIn = false
    res.redirect('/admin/login',)
  },
  changeShippingStatus: (req, res) => {
    console.log(req.body);
    adminHelpers.shippingStatus(req.body.value, req.body.orderId, req.body.proId).then((response) => {
        res.json(response)
    })
  },
  chartGraph:(req,res)=>{
    try{
      chartHelpers.priceGraph().then((priceStat)=>{
        res.send({priceStat})

      })
    }catch(err){
      console.log(err);
    }
  },




  logintwoget:(req,res)=>{
          
    res.render('admin/logintwo')
  },




    logintwo: (req, res) => {
      console.log(req.body);
      adminHelpers.doLogintwo(req.body).then((response) => {
        console.log("my respp",response);
        if (response.status) {
          req.session.adminlogIn = true;
          req.session.admin = response.admin;
          console.log("main if succes");
          res.send({ value: "success" });
        } else {
          console.log("else suces");
          res.send({ value: "failed" });
        }
      });
    },

    salesreport:async(req,res)=>{
     
      let daily=await chartHelpers.dailysales()
     
      let monthly = await chartHelpers.monthWiseSales()
   
      let yearly=await chartHelpers.yearlysales()
     
     console.log(yearly,"srj");
      res.render('admin/sales',{ layout, nav: true ,monthly,daily,yearly})
    },

    bannerManagement:(req,res)=>{

      res.render('admin/bannerManagement',{layout,nav:true,})

    },

    mainBanner: async(req,res)=>{

      let bannerData= await productHelpers.getBanner()
      res.render('admin/bannerMain',{layout,nav:true,bannerData})
    },


    mainBannerpost:(req,res)=>{

      console.log(req.files,"file");
      console.log(req.body,"body bb");
      const files=req.files
      const fileName=files.map((file)=>{
        return file.filename
      })
      console.log(fileName,"my file img");
     const product=req.body
     product.img=fileName
       productHelpers.addbanner(product).then((response)=>{
        res.redirect("/admin/mainBanner")
       })
    },
    mainBannerget:(req,res)=>{
      res.render('admin/add-banner',{layout,nav:true})
    },
    deleteMainBanner:(req,res)=>{
       let bannerId=req.params.id
     
      productHelpers.deleteMainBanner(bannerId).then((response)=>{
        res.redirect('/admin/mainBanner')
      })
    },

    getallcoupon:(req,res)=>{
      res.render('admin/coupon',{layout,nav:true})
    },

    addCoupon:(req,res)=>{

      res.render('admin/add-coupon',{layout,nav:true})
    },
    getwishlist:(req,res)=>{
console.log(req.params.id,"ucha");
      productHelpers.addwishlist(req.session.user._id,req.params.id).then((response)=>{
        res.send(response)
      })
    }

}