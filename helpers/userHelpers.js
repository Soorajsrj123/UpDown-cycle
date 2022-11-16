const { user, product } = require('../config/connection')
var bcrypt = require('bcrypt')
var db = require('../config/connection')
const { getProductDetails } = require('./productHelpers')
const { response } = require('../app')
const { ObjectId } = require('mongodb')

module.exports = {

    doLogin: (userData) => {

        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.user.findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status && user.status) {
                        response.user = user
                        response.status = true
                        resolve(response)
                    }
                    else {
                        console.log("password failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("failed no exist user");
                resolve({ status: false })
            }
        })
    },



    doSignUp: (userData) => {
        return new Promise(async (resolve, reject) => {
            db.user.find({ email: userData.email }).then(async (data) => {
                let response = {}
                if (data.length != 0) {
                    resolve({ status: false })
                } else {
                    userData.password = await bcrypt.hash(userData.password, 10)
                    console.log(userData.password);
                    let data = db.user(userData)
                    data.save()
                    response.value = userData
                    response.status = true
                    response.data = data.insertedId
                    resolve(response)
                }
            })
        })
    }
    ,
    addToCart: (proId, userId) => {
        prodObj = {
            item: proId,
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.cart.findOne({ user: userId })
            if (userCart) {
                let proExist = userCart.products.findIndex(products => products.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.cart.updateOne({ user: userId, 'products.item': proId },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()
                    })
                } else {
                    db.cart.updateOne({ user: userId },
                        {
                            $push: { products: prodObj }
                        }
                    ).then((response) => {
                        resolve()
                    })
                }
            }

            else {
                cartObj = {
                    user: userId,
                    products: [prodObj]
                }

                console.log(cartObj);
                let data = await db.cart(cartObj)
                data.save((err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        resolve(data)
                    }
                })
                console.log(data);
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise((resolve, reject) => {
            db.cart.aggregate([
                {
                    $match: { user: userId }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'productInfo',

                    }
                },
                {
                    $project: { item: 1, quantity: 1, products: { $arrayElemAt: ['$productInfo', 0] } }
                }

            ]).then((product) => {
                resolve(product)
            })
        })
    },
    getCartCount: (userId) => {
        let count = 0

        return new Promise(async (resolve, reject) => {
            let cart = await db.cart.findOne({ user: userId })
            if (cart) {
                for (i = 0; i < cart.products.length; i++) {
                    count += cart.products[i].quantity
                }


            }
            console.log(count);
            count = parseInt(count)
            resolve(count)
        })
    },

    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.cart.updateOne({ _id: details.cart },
                    {
                        $pull: { products: { item: details.product } }
                    }
                ).then((response) => {
                    console.log(response);
                    resolve({ removeProduct: true })
                })
            }
            else {
                db.cart.updateOne({ _id: details.cart, 'products.item': details.product },
                    {
                        $inc: { 'products.$.quantity': details.count }
                    }
                ).then((response) => {
                    console.log(response);

                    resolve({ status: true })
                })
            }
        })
    },
    removeProductFromCart: (details) => {
        return new Promise((resolve, reject) => {
            db.cart.updateOne({ _id: details.cart },
                {
                    $pull: { products: { item: details.product } }
                }
            ).then((response) => {
                resolve(response)
            })
        })
    },
    getTotalAmmount: (userId) => {

        return new Promise(async (resolve, reject) => {
            let total = await db.cart.aggregate([
                {
                    $match: { user: userId }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'productInfo',

                    }
                },
                {
                    $project: { item: 1, quantity: 1, products: { $arrayElemAt: ['$productInfo', 0] } }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$products.price'] } }
                    }
                }


            ])

            resolve(total[0]?.total)
        })
    },

    placeOrder: (order, total) => {

        return new Promise(async (resolve, reject) => {
            let components = await db.cart.aggregate([
                {
                    $match: { user: order.userId }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'cartItemsResult'
                    }
                },
                {
                    $unwind: '$cartItemsResult'
                },
                {
                    $set: { 'cartItemsResult': { status: true } }
                },
                {
                    $project: {
                        _id: '$cartItemsResult._id',
                        quantity: 1,
                        productsName: '$cartItemsResult.name',
                        productprice: '$cartItemsResult.price',
                        status: '$cartItemsResult.status'

                    }
                },

            ])

            let Address = {
                firstname: order.firstname,
                lastname: order.lastname,
                country: order.country,
                street: order.street,
                city: order.city,
                state: order.state,
                pincode: order.pincode,
                phone: order.phone,
                email: order.email,
               
            }

            let addressObj = {
                user: order.userId,
                address:Address
            }

            let addr= await db.address.findOne({user:order.userId})

            if(addr){

                db.address.find({'address.phone':order.phone}).then((res)=>{
                    if(res.length==0)
                    {
                        db.address.updateOne({user:order.userId},
                            {
                                $push:{
                                    address:Address
                                }
                            }
                            ).then((res)=>{
                                resolve()

                            })
                    }
                })
            }else{

            db.address.find({ 'address.phone': order.phone }).then((res) => {
                if (res.length == 0) {
                    db.address(addressObj).save()
                }
            })
        }

            let orderAddress = {
                street: order.street,
                city: order.city,
                state: order.state,
                pincode: order.pincode,
                phone: order.phone,
                email: order.email
            }



            let orderObj = {
                userId: order.userId,
                firstname: order.firstname,
                lastname: order.lastname,
                phone: order.phone,
                paymentMethod: order.payment,
                productDetails: components,
                totalPrice: total,
                shippingAddress: orderAddress
            }
            db.order(orderObj).save()

            db.cart.deleteMany({}).then(() => {

                resolve({ status: 'success' })
            })

        })

    },
    getorders: (userId) => {
        return new Promise((resolve, reject) => {

            db.order.find({ userId: userId }).then((orderitems) => {
                resolve(orderitems)
            })
        })
    },

    cancelOrder: (data) => {

        return new Promise(async (resolve, reject) => {
            let orderDetails = await db.order.findOne({ _id: data.orderId })
            console.log("orderDetails =>",orderDetails);
            

            if(orderDetails)
            {
               
                let indexOfProduct= orderDetails.productDetails.findIndex(product=>product._id==data.productId)
               

                db.order.updateOne(
                    {
                        _id:data.orderId
                    },
                    {
                        $set:{
                            ['productDetails.'+indexOfProduct+'.status']:false
                        }
                    }
                ).then((res)=>{
                    console.log(res);
                    resolve({status:true})
                })
            }

        })

    },
    getaddress:(userId)=>{
       
        return new Promise(async(resolve, reject) => {
           let address= await db.address.findOne({user:userId})
       
           resolve(address)
        })
    },
    filladress:(userId,addressId)=>{

        return new Promise((resolve, reject) => {
        //    console.log('user'.userId,'_id',addressId)
           db.address.aggregate([
            {

                $match:{user:userId}
            },
            {
                $unwind:'$address'
            },
            {
            $match:{'address._id':ObjectId(addressId)}
            }
           ]).then((data)=>{
resolve(data)
           })
        })

    }
  



}    