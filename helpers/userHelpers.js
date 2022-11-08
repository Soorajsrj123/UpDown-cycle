const { user } = require('../config/connection')
var bcrypt = require('bcrypt')
var db = require('../config/connection')

module.exports = {

    doLogin: (userData) => {
        
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.user.findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status&&user.status) {
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
}