var express = require('express');
const { product } = require('../config/connection');
var router = express.Router();
const layout = 'admin-layout'
var productHelpers = require("../helpers/productHelpers")
var adminHelpers = require('../helpers/adminHelpers');

const { Router, response } = require('express');
/* GET home page. */

// ADMIN PAGE
router.get('/', function (req, res) {
  if (req.session.adminlogIn) {
    res.render('admin/admin-page', { layout, nav: true });
  } else {
    res.redirect('/admin/login')
  }
});

// admin products

router.get('/products', function (req, res) {

  productHelpers.getAllproducts().then((products) => {
    res.render('admin/products', { layout, products, nav: true })

  })
});

//ADD products
router.get('/add-product', (req, res, next) => {
  productHelpers.getCategory().then((cata) => {

    res.render('admin/add-products', { layout, nav: true, cata })

  })

})

router.post('/add-product', (req, res) => {
  productHelpers.addProducts(req.body).then((insertedId) => {
    console.log(req.body);
    let image = req.files.image
    let imageName = insertedId
    image.mv('./public/productimages/' + imageName + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/products')
      }
      else {
        console.log(err);
      }
    })
  })

})

// edit products
router.get('/edit-product/:id', async (req, res) => {

  let product = await productHelpers.getProductDetails(req.params.id)
  productHelpers.getCategory().then((category) => {

    res.render('admin/edit-products', { layout, product, nav: true, category })
  })


})                                                    //////////////
router.post('/edit-product/:id', (req, res) => {
  productHelpers.editProduct(req.params.id, req.body).then(() => {
    let image = req.files.image
    let imageName = req.params.id
    image.mv('./public/productimages/' + imageName + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/admin/products')
      }
      else {
        console.log(err);
      }
    })
  })

})

// Delete products
router.get('/delete-product/:id', (req, res) => {

  productHelpers.deleteProduct(req.params.id).then(() => {                               
    res.redirect('/admin/products')
    console.log("yes");
  })
})

// USER Management
// user view
router.get('/users', (req, res) => {
  adminHelpers.getUserDetails().then((user) => {

    res.render('admin/users', { layout, user, nav: true })
  })

})
router.get('/block-user/:id', (req, res) => {
  let userId = req.params.id
  adminHelpers.blockUser(userId).then(() => {
    res.redirect('/admin/users')
  })

})

router.get('/unblock-user/:id', (req, res) => {
  let userId = req.params.id
  adminHelpers.unBlockUser(userId).then(() => {
    res.redirect('/admin/users')
  })

})

//CATEGORY MANAGEMENT

router.get('/category', (req, res) => {
  productHelpers.getCategory().then((category) => {
    console.log(category);
    res.render('admin/category', { layout, nav: true, category })
  })

})
// add caegory
router.get('/add-category', (req, res) => {
  res.render('admin/add-category', { layout, nav: true })
})


router.post('/add-category', (req, res) => {
  productHelpers.addCategory(req.body).then((data) => {
    console.log(data);
    res.redirect('/admin/category')
  })

})

// edit catogory

router.get('/edit-category/:id', async (req, res) => {
  let category = await productHelpers.getCategoryDetails(req.params.id)
  res.render('admin/edit-category', { layout, category, nav: true })

})

router.post('/edit-category/:id', (req, res) => {
  
  productHelpers.updateCategory(req.params.id, req.body).then(() => {

    res.redirect('/admin/category')
  })
})

// delete catogory
router.get('/delete-category/:id', (req, res) => {
  let category = req.params.id
  productHelpers.deleteCategory(category).then((response) => {
    res.redirect('/admin/category')
  })
})


// login 
router.get('/login', (req, res) => {
  if (req.session.adminlogIn) {
    res.redirect('/admin')
  } else {
    res.render('admin/login')

  }

})


router.post('/login', (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    console.log("yes coming");
    if (response.status) {
      req.session.adminlogIn = true
      res.redirect('/admin')
    } else {

      res.redirect('/admin/login');
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.adminlogIn = false
  res.redirect('/admin/login',)
})


module.exports = router;
