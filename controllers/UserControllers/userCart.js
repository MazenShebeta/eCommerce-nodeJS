const mongoose = require('mongoose');
const User = require('../../models/userModel');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Products = require('../../models/productsModel');
const Cart = require('../../models/cartModel');

class userCart{
    static async checkItem(OriginalProduct,sizesArray){
        
        try{
        sizesArray.forEach(element => {
            console.log(element)
            //get size element from original product
            
            const matchedSize = OriginalProduct.sizesArray.find(sizeArrayItem => element.size == sizeArrayItem.size)
            if(matchedSize){
                if(element.quantity > matchedSize.quantity){
                    throw new Error("quantity exceeds available quantity")
                }
            }
            else{
                throw new Error("size not available")
            }
        });
        return true
        }
        catch(err){
            return err;
        }

    }


    static async viewCart(req, res){
        const id = req.user.id
        //check if cart exists
        try{
            const cart = await Cart.findOne({userID: id}).populate({
                path: 'products.productID',
                select: 'title price image rating color quantity'
            })
            if(cart){
                //check if cart quantity exceeds product quantity for each product in cart
                cart.products.forEach(async (product)=>{
                    const originalProduct = await Products.findOne({_id: product.productID}).select('sizesArray')

                    product.sizesArray.forEach((diffSize)=>{
                        const matchedSize = originalProduct.sizesArray.find(sizeArrayItem => diffSize.size == sizeArrayItem.size)
                        if(matchedSize){
                            if(matchedSize.quantity < diffSize.quantity){
                                console.log("here")
                                diffSize.quantity = matchedSize.quantity
                            }
                        }
                    })

                }, cart.save())
                res.status(200).json({
                    cart
                })
            }
            else{
                res.status(404).json("cart empty")
            }
        }
        catch(err){
            res.status(500).json({error: err.message})
        }
    }

    static async addToCart(req, res){
        try{
            //populate proudctID
            const OriginalProduct = await Products.findOne({_id: req.body.productID}).select('price sizesArray')

            //check if product exists
            if(!OriginalProduct){
                throw new Error()
            }

            //check if cart exists
            let cart = await Cart.findOne({userID: req.user.id})
            if(cart){
                    const checkedItem = await userCart.checkItem(OriginalProduct, req.body.sizesArray)
                    console.log(checkedItem)
                    if(checkedItem != true){
                        throw new Error(checkedItem)
                    }
                    else{
                    //add product to cart
                    let product = cart.products.find(product => product.productID == req.body.productID)
                    //check if product exists in cart
                    if(product){
                        product.sizesArray = req.body.sizesArray
                        product.quantity = req.body.quantity
                    }
                    else{
                        cart.products.push({
                            productID: req.body.productID,
                            sizesArray: req.body.sizesArray,
                            quantity: req.body.quantity
                        })
                    }
                    await cart.save()
                    }
            }

            //create new cart
            else{
                //if checkItem returns error
                const checkedItem = await userCart.checkItem(OriginalProduct, req.body.sizesArray)
                if(checkedItem != true){
                    throw new Error(checkedItem)
                }
                else{
                    cart = new Cart({
                        userID: req.user.id,
                        products: [{productID: req.body.productID, sizesArray: req.body.sizesArray}]
                    })
                    await cart.save()
                }

            }
            res.send(cart)
        }
        catch(err){
            res.status(400).send(err.message)
        }
        
    }

    static async removeFromCart(req, res){
        try{
            const cart = await Cart.findOne({userID: req.user.id})
            if(cart){
                cart.products = cart.products.filter(product => product.productID != req.params.id)
                if(cart.products.length == 0){
                    await Cart.findByIdAndDelete(cart.id)
                    res.send("cart empty")
                }
                else{
                    await cart.save()
                    res.send(cart)
                }
                
            }
            else{
                res.status(404).send("cart empty")
            }
        }
        catch(err){
            res.status(400).send(err.message)
        }
    }

    static async emptyCart(req, res){
        try{
            let cart = await Cart.find({UserID: req.user.id})
            cart = cart[0]
            if(cart){
                await Cart.findByIdAndDelete(cart.id)
                res.send("cart empty")
            }
            else{
                res.send("cart is already empty")
            }
        }
        catch(err){
            res.status(400).send(err.message)
        }
    }


}

module.exports = userCart;

