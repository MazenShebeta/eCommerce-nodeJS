const orderModel = require('../../models/orderModel')
const cartModel = require('../../models/cartModel')
const productsModel = require('../../models/productsModel')
const { model } = require('mongoose')

class orders{
    static async placeOrder(req, res){
        try{
            let total = 0;
            const cart = await cartModel.findOne({usedID: req.user.id}).populate({
                path:'products.productID',
                select:'quantity price'
            })
            cart.products.forEach(element => {
                total+= element.quantity * element.productID.price
                console.log(total)
                if(element.quantity > element.productID.quantity){
                    res.status(400).send("invalid quantity")
                }
            });
    
            const order = await new orderModel({
                userID: req.user.id,
                country: req.body.country,
                city: req.body.city,
                address: req.body.address,
                phone: req.body.phone,
                products: cart.products,
                total: total
            })

            cart.products.forEach( async element => {
                console.log(element.quantity)
                let OriginalProduct = await productsModel.findById(element.productID)
                console.log(OriginalProduct)
                console.log(OriginalProduct.quantity - element.quantity)
                OriginalProduct.quantity = OriginalProduct.quantity - element.quantity
                await OriginalProduct.save()
            })
    
            await cartModel.findByIdAndDelete(cart.id)  
            res.send(order)
        }

        catch(err){
            res.status(400).send(err.message)
        }
    }
    
}

module.exports = orders