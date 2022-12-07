require("dotenv").config();

const { response } = require("express");
var express = require("express");
const userHelpers = require("../helpers/userHelpers");
var router = express.Router();
const config = require("../config/otp");
const otp = require("../config/otp");
const productHelpers = require("../helpers/productHelpers");
const { product } = require("../config/connection");
const userController = require("../controller/userController");
const { resolveInclude } = require("ejs");
const { Db } = require("mongodb");
var db = require("../config/connection");
const Client = require("twilio")(config.accountId, config.authToken);

const paypal = require("@paypal/checkout-server-sdk");
const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

module.exports = {
  verifyLogin: (req, res, next) => {
    if (req.session.loggedIn) {
      next();
    } else {
      res.redirect("/login");
    }
  },

  landingPage: async function (req, res, next) {
    let user = req.session.loggedIn;
    let product = await productHelpers.getAllproducts();
    let mainBanner = await productHelpers.getBanner();
    if (user) {
      let cartCount = await userHelpers.getCartCount(req.session.user._id);

      res.render("index", { nav: true, user, cartCount, product, mainBanner });
    } else {
      res.render("index", { nav: true, user: false, product, mainBanner });
      // res.redirect('/login')
    }
  },

  loginPageGet: (req, res, next) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    } else {
      res.render("users/user-login", { nav: false });
    }
  },

  loginPagePost: (req, res) => {
    console.log(req.body);
    userHelpers.doLogin(req.body).then((response) => {
      console.log("my respp", response);
      if (response.status) {
        req.session.loggedIn = true;
        req.session.user = response.user;
        res.send({ value: "success" });
      } else if (response.blocked) {
        res.send({ value: "blocked" });
      } else {
        res.send({ value: "failed" });
      }
    });
  },

  signUpPageGet: (req, res) => {
    res.render("users/user-signup", { nav: false });
  },

  signUpPagePost: (req, res) => {
    userHelpers.doSignUp(req.body).then((response) => {
      if (!response.status) {
        res.send({ value: "failed" });
      } else {
        req.session.loggedIn = true;
        res.send({ value: "success" });
      }
    });
  },
  otpPage: (req, res) => {
    res.render("users/otp");
  },

  otpLogin: (req, res) => {
    Client.verify
      .services(config.serviceId)
      .verifications.create({
        to: `+91${req.query.mobileNumber.trim()}`,
        channel: "sms",
      })
      .then((data) => {
        res.status(200).send(data);
      });
  },

  otpVerify: (req, res) => {
    Client.verify
      .services(otp.serviceId)
      .verificationChecks.create({
        to: `+91${req.query.mobileNumber.trim()}`,
        code: req.query.code,
      })
      .then((data) => {
        if (data.valid) {
          req.session.loggedIn = true;
          res.status(200);
          res.send({ value: "success" });
        } else {
          res.send({ value: "failed" });
        }
      })
      .catch((err) => {
        res.send(err);
      });
  },

  shopPage: (req, res, next) => {
    if (req.session.loggedIn) {
      productHelpers.getAllproducts().then(async (products) => {
        let cartCount = await userHelpers.getCartCount(req.session.user._id);
        res.render("users/user-shop", {
          products,
          nav: true,
          user: true,
          cartCount,
        });
      });
    } else {
      res.redirect("/");
    }
  },

  productPage: (req, res, next) => {
    let proId = req.params.id;
    productHelpers.getProductDetails(proId).then(async (products) => {
      let cartCount = await userHelpers.getCartCount(req.session.user._id);
      res.render("users/user-product", {
        products,
        nav: true,
        user: true,
        cartCount,
      });
    });
  },

  cartPage: async (req, res) => {
    let products = await userHelpers.getCartProducts(req.session.user._id);
    console.log(products);
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    let total = await userHelpers.getTotalAmmount(req.session.user._id);
    let offertotal=total.offertotal
    total=total.total
    res.render("users/cart", {
      total,
      offertotal,
      products,
      nav: true,
      user: true,
      cartCount,
    });
  },
  addToCart: (req, res) => {
    userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true });
    });
  },

  changeQuantity: (req, res) => {
  
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
      response.total = await userHelpers.getTotalAmmount(req.session.user._id);
      console.log( response.total,"mmmmmmmmmm");
     
      res.json(response);
    });
  },
  removeProductCart: (req, res) => {
    // console.log(req.body);
    userHelpers.removeProductFromCart(req.body).then((response) => {
      res.json(response);
    });
  },
  checkoutGet: async (req, res) => {
    userId = req.session.user._id;
    let address = await userHelpers.getaddress(userId);
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    let total = await userHelpers.getTotalAmmount(req.session.user._id);
    let offertotal=total.offertotal
    total=total.total
    res.render("users/checkout", {
      paypalClientId: process.env.PAYPAL_CLIENT_ID,
      total,
      offertotal,
      nav: true,
      user: true,
      address,
      cartCount,
    });
  },
  checkoutPost: async (req, res) => {
    let totalAmmount = await userHelpers.getTotalAmmount(req.session.user._id);
    req.body.userId = req.session.user._id;
    userHelpers.placeOrder(req.body, totalAmmount).then((response) => {
      if (req.body.payment == "COD") {
        res.send({ success: true });
      } else if (req.body.payment == "razorpay") {
        userHelpers.generatRazorpay(req.body, totalAmmount).then((response) => {
          res.json(response);
        });
      } else {
        res.json({ paypal: true });
      }
    });
  },

  success: (req, res) => {
    res.render("users/successpage");
  },
  getorders: async (req, res) => {
    req.body.userId = req.session.user._id;
    let orderItems = await userHelpers.getorders(req.body.userId);
    console.log("orderssss", orderItems);
    let cartCount = await userHelpers.getCartCount(req.session.user._id);

    res.render("users/orders", {
      orderItems,
      nav: true,
      user: true,
      cartCount,
    });
  },
  cancelOrder: (req, res) => {
    console.log(req.body, "naa body");
    userHelpers.cancelOrder(req.body, req.session.user._id).then((response) => {
      res.json(response);
    });
  },

  userProfile: async (req, res) => {
    userId = req.session.user._id;
    let userdetails = await userHelpers.userdetails(userId);
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    userHelpers.getaddress(userId).then((address) => {
      // console.log("kjhgfd", address, "kjhg");
      res.render("users/profile", {
        nav: true,
        user: true,
        address: address[0],
        userdetails,
        cartCount,
      });
    });
  },

  getaddress: (req, res) => {
    userId = req.session.user._id;

    userHelpers.getaddress(userId).then((address) => {
      res.render("users/address", { address });
    });
  },
  filladress: (req, res) => {
    userId = req.session.user._id;
    addrsId = req.params.id;
    userHelpers.filladress(userId, addrsId).then((data) => {
      res.send(data[0].address);
    });
  },
  verifyPayment: (req, res) => {
    console.log(req.body);
    userHelpers
      .verifyPayment(req.body)
      .then(() => {
        userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
          console.log("payment successfull");
          res.json({ status: true });
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: false });
      });
  },
  logout: (req, res) => {
    req.session.loggedIn = false;
    res.redirect("/login");
  },
  removeAddress: (req, res) => {
    userId = req.session.user._id;
    userHelpers.removeAddress(req.body.addressId, userId).then((response) => {
      res.json({ status: "success" });
    });
  },
  paypalSuccess: async (req, res) => {
    const orderDetails = await db.order.find({ userId: req.session.user._id });
    let orders = orderDetails[0].orders.slice().reverse();
    let orderId1 = orders[0]._id;
    let orderId = "" + orderId1;
    userHelpers.changePaymentStatus(req.session.user._id, orderId).then(() => {
      res.json({ status: true });
    });
  },
  paypalOrder: async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest();
    const total = 1000;
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: total,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: total,
              },
            },
          },
        },
      ],
    });

    try {
      const order = await paypalClient.execute(request);
      console.log(order);
      res.json({ id: order.result.id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  addAddress: (req, res) => {
    console.log(req.body, "jgghghj");
    userId = req.session.user._id;
    userHelpers.addressAdd(req.body, userId).then((response) => {
      res.json(response);
    });
  },

  checkCartQuantity: (req, res) => {
    console.log(req.params.id, "producttttttt");
    userHelpers
      .checkCartQuantity(req.session.user._id, req.params.id)
      .then((quantity) => {
        res.send(quantity);
      });
  },
  editAddress: (req, res) => {
    let userId = req.session.user._id;
    userHelpers.updateAddress(req.body, userId).then(() => {
      res.send({ status: true });
    });
  },

  changeUserProfile: async (req, res) => {
    console.log(req.body, "first body");

    let user = await db.user.findOne({ _id: req.session.user._id });

    userHelpers.editProfile(req.body, user).then((response) => {
      console.log("response", response);
      if (response.status) {
        console.log("succ");
        res.json({ status: true });
      } else {
        console.log("fails");
        res.json({ status: false });
      }
    });
  },
  downloadinvoice: (req, res) => {
    let orderId = req.params.id;
    console.log(orderId, "idsssss");
    let userId = req.session.user._id;
    userHelpers.getdata(orderId, userId).then((details) => {
    
      res.send(details[0]);
    });
  },

  returnOrder:(req,res)=>{
console.log(req.body,"my body");
    userHelpers.returnProduct(req.body,req.session.user._id).then((response)=>{
      
res.send(response)
      
    })
  }

};
