const user = require('../controllers/UserControllers/userController')
const cart = require('../controllers/UserControllers/userCart')
const order = require('../controllers/UserControllers/orderController')
const Router = require('express').Router()
const auth = require('../middleware/auth')


Router.post('/register', function(req, res){
    user.register(req, res);
})

Router.post('/login' ,function(req, res){
    user.login(req, res);
})

Router.delete('/logout', auth, function(req, res){
    user.logout(req, res);
})

Router.put('/update/:id', auth, function(req, res){
    user.update(req, res);
})

Router.delete('/delete/:id', auth, function(req, res){
    user.deleteUser(req, res);
})

Router.get('/products', auth, function(req, res){
    user.viewProducts(req, res)
})

Router.get('/products/:id', auth, function(req, res){
    user.viewProduct(req, res)
})

Router.post('/products/:id', auth, function(req, res){
    user.reviewProduct(req, res)
})

Router.get('/cart', auth, function(req, res){
    cart.viewCart(req, res)
})

Router.post('/addToCart', auth, function(req, res){
    cart.addToCart(req, res)
})

Router.delete('/removeFromCart/:id', auth, function(req, res){
    cart.removeFromCart(req, res)
})


Router.post('/order', auth, function(req, res){
    order.placeOrder(req, res)
})


module.exports = Router;