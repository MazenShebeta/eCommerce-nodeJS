const admin = require('../controllers/adminController')
const Router = require('express').Router()
const express = require('express')
const auth = require('../middleware/auth')


Router.post('/register', function(req, res){
    admin.register(req, res);
})

Router.post('/login' ,function(req, res){
    admin.login(req, res);
})

Router.get('/logout', auth, function(req, res){
    admin.logout(req, res);
})

Router.get('/users', auth, function(req,res){
    admin.viewUsers(req, res);
})

Router.get('/users/:id', auth, function(req,res){
    admin.viewUser(req, res);
})

Router.put('/update/:id', auth, function(req, res){
    admin.updateUser(req, res);
})

Router.delete('/delete/:id', auth, function(req, res){
    admin.deleteUser(req, res);
})

Router.get('/products', auth, function(req, res){
    admin.viewProducts(req, res)
})

Router.get('/products/:id', auth, function(req, res){
    admin.viewProduct(req, res)
})

Router.post('/addProduct', auth, function(req, res){
    admin.addProduct(req, res)
})

Router.put('/updateProduct/:id', auth, function(req, res){
    admin.updateProduct(req, res)
})

Router.delete('/deleteProduct/:id', auth, function(req, res){
    admin.deleteProduct(req, res)
})





module.exports = Router;