var express = require("express");
var router = express.Router();

const adminController = require("../controller/adminControler");
const { verifyAdmin } = require("../controller/adminControler");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/productimages");
  },
  filename: (req, file, cb, err) => {
    // console.log(file);
    if (err) {
      console.log(err);
    }
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets/banner-images");
  },
  filename: (req, file, cb, err) => {
    // console.log(file);
    if (err) {
      console.log(err);
    }
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload2 = multer({ storage: storage2 });


router.get("/logout", adminController.logout);

router.get("/logintwo", adminController.logintwoget);

router.post("/logintwo", adminController.logintwo);

// ADMIN PAGE
router.get("/", adminController.dashBoard);

// admin products

router.get("/chartGraph", adminController.chartGraph);
router.get("/products", verifyAdmin, adminController.productPage);

//ADD products
router.get("/add-product", verifyAdmin, adminController.addProductGet);

router.post(
  "/add-product",
  verifyAdmin,
  upload.array("image"),
  adminController.addProductPost
);

// edit products
router.get("/edit-product/:id", verifyAdmin, adminController.editProductGet);
router.post(
  "/edit-product/:id",
  upload.array("image"),
  adminController.editProductPost
);

// Delete products
router.get("/delete-product/:id", verifyAdmin, adminController.deleteProduct);

// USER Management
// user view
router.get("/users", verifyAdmin, adminController.userManagement);

router.get("/block-user/:id", verifyAdmin, adminController.blockUserGet);

router.get("/unblock-user/:id", verifyAdmin, adminController.unblockUserGet);

//CATEGORY MANAGEMENT

router.get("/category", verifyAdmin, adminController.category);
// add caegory
router.get("/add-category", verifyAdmin, adminController.addCategoryGet);

router.post("/add-category", verifyAdmin, adminController.addCategoryPost);

// edit catogory

router.get("/edit-category/:id", verifyAdmin, adminController.editCategoryGet);

router.post(
  "/edit-category/:id",
  verifyAdmin,
  adminController.editCategoryPost
);

// delete catogory
router.get("/delete-category/:id", verifyAdmin, adminController.deleteCategory);

router.get("/orders", verifyAdmin, adminController.getOrderDetails);

router.get("/view-more/:id", verifyAdmin, adminController.viewMore);

router.put(
  "/shippingStatus",
  verifyAdmin,
  adminController.changeShippingStatus
);

router.get("/sales-report", verifyAdmin, adminController.salesreport);

router.get("/generateExcel", adminController.getExceldata);

router.get("/banner-management", verifyAdmin, adminController.bannerManagement);
router.get("/mainBanner", verifyAdmin, adminController.mainBanner);

router.get("/add-bannerMain", verifyAdmin, adminController.mainBannerget);
router.post(
  "/add-bannerMain",
  verifyAdmin,
  upload2.array("image"),
  adminController.mainBannerpost
);

router.get(
  "/delete-mainBanner/:id",
  verifyAdmin,
  adminController.deleteMainBanner
);

router.get("/catabanner", verifyAdmin, adminController.cataBannerget);
router.get("/addCataBanner", verifyAdmin, adminController.addCataBanner);
router.post(
  "/add-cataBanner",
  verifyAdmin,
  upload2.array("image"),
  adminController.addCataBannerPost
);

router.get(
  "/delete-cataBanner/:id",
  verifyAdmin,
  adminController.deleteCataBanner
);

router.get("/coupon", verifyAdmin, adminController.getallcoupon);

router.get("/add-coupon", verifyAdmin, adminController.addCoupon);

router.post("/add-coupon", verifyAdmin, adminController.addcoupon);
router.get(
  "/generate-coupon-code",
  verifyAdmin,
  adminController.generateCoupon
);

router.get("/delete-coupon/:id", verifyAdmin, adminController.deleteCoupon);

module.exports = router;
