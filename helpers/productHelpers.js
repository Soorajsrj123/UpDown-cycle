const { response } = require("../app");
const { product, categories } = require("../config/connection");
var db = require("../config/connection");

module.exports = {
  addProducts: (product) => {
  

    return new Promise(async (resolve, reject) => {
      try {
        let data = await db.product(product).save();
        // console.log(data,'this is my data');
        resolve(data);
      } catch (error) {
        console.log(error);
      }
    });
  },
  getAllproducts: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let products = await db.product.find({});
        // console.log("prod=>",products);
        resolve(products);
      } catch (error) {
        console.log(error);
      }
    });
  },
  getProductDetails: (proId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.product.findOne({ _id: proId }).then((product) => {
          resolve(product);
        });
      } catch (error) {
        console.log(error);
      }
    });
  },
  editProduct: (data, prodId) => {
    return new Promise(async (resolve, reject) => {
      try {
        db.product
          .updateOne(
            { _id: prodId },
            {
              name: data.name,
              catogory: data.catogory,
              price: data.price,
              description: data.description,
              stock: data.stock,
              img: data.img,
              offerpercentage:data.offerpercentage,
              offerprice:data.offerprice
            }
          )
          .then((data) => {
            console.log(data, "soorya");
            resolve(data);
          });
      } catch (error) {
        console.log(error);
      }
    });
  },
  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      try {
        db.product.deleteOne({ _id: proId }).then(() => {
          resolve();
        });
      } catch (error) {
        console.log(error);
      }
    });
  },
  addCategory: (category) => {
    return new Promise(async (resolve, reject) => {
      try {
        category.name = await category.name.toLowerCase();
        db.categories.find({ name: category.name }).then(async (data) => {
          let response = {};
          if (data.length == 0) {
            // category.name =await category.name.toLowerCase()
            let cata = db.categories(category);
            cata.save();
            response.data = cata;
            response.status = true;
            resolve(response);
          } else {
            resolve({ status: false });
          }
        });
      } catch (error) {
        console.log(error);
      }
    });
  },
  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = db.categories.find({});
      resolve(category);
    });
  },
  updateCategory: (cateId, cateDetails) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.categories.updateOne(
          { _id: cateId },
          {
            $set: {
              name: cateDetails.name,
            },
          }
        );
        resolve();
      } catch (error) {
        console.log(error);
      }
    });
  },
  getCategoryDetails: (cateId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.categories.findOne({ _id: cateId }).then((categories) => {
          resolve(categories);
        });
      } catch (error) {
        console.log(error);
      }
    });
  },
  deleteCategory: (cateId) => {
    return new Promise((resolve, reject) => {
      try {
        db.categories.deleteOne({ _id: cateId }).then(() => {
          resolve();
        });
      } catch (error) {
        console.log(error);
      }
    });
  },
  getOrderDetails: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db.order.aggregate([
          {
            $unwind: "$orders",
          },
        ]);
        resolve(orders);
      } catch (error) {
        console.log(error);
      }
    });
  },

  addbanner: (details) => {
    return new Promise(async (resolve, reject) => {
      let data = await db.banner(details);
      data.save();
      resolve(data);
    });
  },
  getBanner: () => {
    return new Promise(async(resolve, reject) => {
      try {

        let data =await db.banner.find({});
        resolve(data);

      } catch (error) {
        console.log(error);
      }
    });
  },
  deleteMainBanner:(dataId)=>{

    return new Promise((resolve,reject)=>{

      try{
        db.banner.deleteOne({_id:dataId}).then((res)=>{
          resolve()
        })
      }catch(error){
        console.log(error);
      }
    })
  },
  addwishlist:(userId,proId)=>{
    return new Promise(async(resolve, reject) => {
      try{
        let prodObj={
          item:proId,
        }
        
       let userWishlist=await db.wishlist.findOne({user:userId})
//checking if user have wish list or not
        if(userWishlist){
          let proExist=userWishlist.products.findIndex((i)=>i.item==proId)
           console.log(proExist,"pro index");
               //checking if the pro is already exist
             if(proExist==-1){
                  db.wishlist.updateOne(
                    {
                      user:userId
                    },
                    {
                        $push:{products:prodObj}
                    }
                    ).then(()=>{
                        resolve({status:"success"})
                    })
                    console.log("sec if");
             }else{
              console.log("sec else");
              resolve({status:"failed"})
             }
             console.log("main if");
        }else{
          let wishlistObj={
            user:userId,
            products:[prodObj]
          }
         let data= await db.wishlist(wishlistObj)
          await data.save()
          resolve({status:"success"})
          console.log("main else");
        }

         
      }catch(err){
        console.log(err);
      }
    })
  }
};
