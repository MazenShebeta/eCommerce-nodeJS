const adminModel = require('../models/adminModel');
const userModel = require('../models/userModel');
const Products = require('../models/productsModel');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

class admin{
    static async register(req, res){
        try{
            const admin = new adminModel({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                isAdmin: true
            })
            await admin.save()
            res.send(admin)
        }
        catch(err){
            res.status(500).json({error: err.message})
        }
    }

    static async login(req, res){
        try{
            const adminID = await admin.checkCredentials(req.body.email, req.body.password)
            //get isAdmin value for admin
            const currentadminModel = await adminModel.findOne({_id: adminID})
            const adminPrivilege = currentadminModel.isAdmin
            console.log('adminPrivilege: ' + adminPrivilege)
            console.log("login adminID"+adminID)
            let token = jwt.sign({id:adminID, isAdmin:adminPrivilege}, 'secretkey')
            try{
                let response = await admin.addTokenToDatabase(adminID, token)
                res.send(response)
                
            }
            catch(err){
                res.send(err.message)
            }
        }

        catch(err){
            res.send(err.message)
        }
    
    }

    static async logout(req, res){
        try{
            let response = await admin.removeTokenFromDatabase(req.adminID)
            res.send(response)
        }
        catch(err){
            res.send(err.message)
        }
    }

    static async deleteTokenFromDatabase(admin, token){
        try{
            const user = await User.findOne({_id: userID})
            user.tokens = user.tokens.filter((tokenObj)=>{
                return tokenObj.token !== token
            })
            await user.save()
            return "token deleted"
        }
        catch(err){
            return err.message
        }
    }
    static async checkCredentials(email, password){
        const admin = await adminModel.findOne({email: email})
        if(!admin){
            throw new Error("invalid login")
        }
        const isMatch = await bcrypt.compare(password, admin.password)
        if(!isMatch){
            throw new Error("invalid login")
        }
        return admin._id
    }

    static async addTokenToDatabase(adminID, token){
        const admin = await adminModel.findOne({_id: adminID})
        admin.tokens = admin.tokens.concat({token: token})
        await admin.save()
        return token
    }

    static async logout(req, res){
        try{
            const token = req.headers.authorization.split(' ')[1]
            console.log(token)
            //delete token from database
            const response = await admin.deleteTokenFromDatabase(token)
            res.send(response)
        }
        catch(err){
            res.status(400).send(err.message)
        }
    }

    static async deleteTokenFromDatabase(token){
        try{
            const admin = await adminModel.findOne({_id: req.user.id})
            admin.tokens = admin.tokens.filter((tokenObj)=>{
                return tokenObj.token !== token
            })
            await admin.save()
            return "token deleted"
        }
        catch(err){
            return err.message
        }
    }

    static async logoutAll(req, res){
        try{
            const adminID = req.user.id
            await adminModel.findByIdAndUpdate(adminID, {$set: {tokens: []}})
            res.send("logged out of all devices")
        }
        catch(err){
            res.status(400).send(err.message)
        }
    }

    static async updateUser(req, res){
        if(req.user.isAdmin){
            try{
                if(req.body.password){
                    req.body.password = await bcrypt.hash(req.body.password, 9)
                }
                const user = await userModel.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
                res.send(user)
            }
            catch(err){
                res.status(400).send(err.message)
            }
        }
        else{
            res.status(400).send("You are not an admin")
        }
    }

    static async deleteUser(req, res){
        if(req.user.isAdmin){
            try{
                const userId = req.params.id
                const user = await userModel.findByIdAndDelete(userId)
                res.send(user)
            }
            catch(err){
                res.status(400).send(err.message)
            }
        }
        else{
            res.status(400).send("You are not an admin")
        }
    }


    static async viewProducts(req, res){
        try{
            const products = await Products.find({})
            res.send(products)
        }
        catch(err){
            res.status(400).send(err.message)
        }
    }

    static async viewProduct(req, res){
        try{
            const productId = req.params.id
            const product = await Products.findById(productId)
            res.send(product)
        }
        catch(err){
            res.status(400).send(err.message)
        }
    }

    static async addProduct(req, res){
        if(req.user.isAdmin){
            try{
                const product = new Products({
                    title: req.body.title,
                    price: req.body.price,
                    color: req.body.color,
                    description: req.body.description,
                    isAvailable: req.body.isAvailable,
                    sizesArray: req.body.sizesArray,
                    category: req.body.category,
                    image: req.body.image
                    
                })
                await product.save()
                res.send(product)
        
            }
            catch(err){
                res.status(400).json({error: err.message})
            }
        }
        else{
            res.status(400).json({error: "You are not an admin"})
        }
    }

    static async deleteProduct(req, res){
        if(req.user.isAdmin){
            try{
                const product = await Products.findOneAndDelete({_id: req.params.id})
                res.send(product)
            }
            catch(err){
                res.status(400).json({error: err.message})
            }
        }
        else{
            res.status(400).json({error: "You are not an admin"})
        }
    }

    static async updateProduct(req, res){
        if(req.user.isAdmin){
            try{
                let total = 0;
                req.body.sizesArray.forEach(size => {
                    total += size.quantity
                });
                if(total == 0){
                    req.body.isAvailable = false
                }
                else{
                    req.body.isAvailable = true
                }
                const product = await Products.findOneAndUpdate({_id: req.params.id}, req.body, {new: true})
                res.send(product)
            }
            catch(err){
                res.status(400).json({error: err.message})
            }
        }
        else{
            res.status(400).json({error: "You are not an admin"})
        }
    }

    static async viewUsers(req, res){
        if(req.user.isAdmin){
            try{
                const users = await userModel.find({})
                res.send(users)
            }
            catch(err){
                res.status(400).json({error: err.message})
            }
        }
        else{
            res.status(400).json({error: "You are not an admin"})
        }
    }

    static async viewUser(req, res){
        if(req.user.isAdmin){
            try{
                const user = await userModel.findOne({_id: req.params.id})
                res.send(user)
            }
            catch(err){
                res.status(400).json({error: err.message})
            }
        }
        else{
            res.status(400).json({error: "You are not an admin"})
        }
    }

    static async viewOrders(req, res){
        if(req.user.isAdmin){
            try{
                const orders = await orderModel.find({})
                res.send(orders)
            }
            catch(err){
                res.status(400).json({error: err.message})
            }
        }
        else{
            res.status(400).json({error: "You are not an admin"})
        }
    }

}

module.exports = admin;