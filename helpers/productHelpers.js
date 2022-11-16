const { response } = require('../app');
const { product, categories } = require('../config/connection')
var db = require('../config/connection')


module.exports = {

  addProducts: (product) => {
    return new Promise(async (resolve, reject) => {
      console.log(product);
      let data = await db.product(product)
      data.save()
      resolve(data._id)
    })
  },
  getAllproducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db.product.find({})
      resolve(products)
    })
  },
  getProductDetails: (proId) => {
    return new Promise(async (resolve, reject) => {
      await db.product.findOne({ _id: proId }).then((product) => {
        resolve(product)
      })
    })
  },
  editProduct: (proId, data) => {
    return new Promise(async (resolve, reject) => {
      await db.product.updateOne({ _id: proId }, {
        name: data.name,
        catogory: data.catogory,
        price: data.price,
        description: data.description
      })
      resolve(data)
    })
  },
  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      db.product.deleteOne({ _id: proId }).then(() => {
        resolve()
      })
    })
  },
  addCategory: (category) => {

    return new Promise(async (resolve, reject) => {
      db.categories.find({ name: category.name }).then((data) => {
        let response = {}

        if (data.length == 0) {
          let cata = db.categories(category)
          cata.save()
          response.data = cata
          response.status = true
          resolve(response)
        }
        else {
          resolve({ status: false })
        }
      })
    })
  },
  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = db.categories.find({})
      resolve(category)
    })
  },
  updateCategory: (cateId, cateDetails) => {
    return new Promise(async (resolve, reject) => {
      await db.categories.updateOne({ _id: cateId }, {
        $set: {
          name: cateDetails.name
        }
      })
      resolve()
    })
  },
  getCategoryDetails: (cateId) => {
    return new Promise(async (resolve, reject) => {
      await db.categories.findOne({ _id: cateId }).then((categories) => {
        resolve(categories)
      })
    })
  },
  deleteCategory: (cateId) => {
    return new Promise((resolve, reject) => {
      db.categories.deleteOne({ _id: cateId }).then(() => {
        resolve()
      })
    })
  },
  getOrderDetails:()=>{

    return new Promise((resolve, reject) => {
        db.order.find({}).then((res)=>{
            resolve(res)
        })
    })
}
}
