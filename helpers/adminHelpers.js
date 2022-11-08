var db = require('../config/connection')
var adminData = require('../config/admin-connection')
const bcrypt=require('bcrypt');

let data=adminData.adminId
module.exports = {


    getUserDetails: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db.user.find({})

            resolve(user)


        })
    },
    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let update = await db.user.updateOne({ _id: userId }, {
                $set: {
                    status:false
                }
            });
            resolve(update)

        })
    },unBlockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let update = await db.user.updateOne({ _id: userId }, {
                $set: {
                    status:true
                }
            });
            resolve(update)

        })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve, reject) => {
         console.log(userData);

           if(data.email == userData.email){
              bcrypt.compare(userData.password, data.password).then((loginTrue)=>{
               
                 let response={}
                 if(loginTrue){
                    console.log('login successful');
                    response.admin=data;
                    response.status=true;
                    resolve(response);
                 }else{
                    console.log("login failed");
                    resolve({status:false});
                 }
              })
           }else{
              console.log('Login failed email');
               resolve({status:false});
           }
           
        })
   }
}