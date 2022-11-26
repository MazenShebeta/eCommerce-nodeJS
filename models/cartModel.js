const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

    products: [{
        productID: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'products',
            unique: true
        },
        sizesArray:{
            type: [{
                size:{
                    type: String,
                    required: true,
                    unique: true
                },
                quantity:{
                    type:Number,
                    default: 1,

                    required: true
                },
                price:{
                    type: Number
                }
            }],
            required: true
        },
    }],

    total:{
        type:Number
    },

    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        unique: true
    }
    
});

// cartSchema.post('save',async function(){
//     //get total price of cart
//     const cart = this
//     let total = 0;
//     cart.products.forEach(element => {
//         //get price for element
//         let price = element.productID.price
//         console.log(price)
//         element.sizesArray.forEach(size => {
//             size.price = size.quantity * price
//             total += size.price
//         });
//     });
//     cart.total = total
//     await cart.save()
// })

//export
module.exports = mongoose.model('cart', cartSchema);