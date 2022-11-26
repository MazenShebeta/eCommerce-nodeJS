const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },

    country:{
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true        
    },

    address: {
        type: String,
        required: true
    },

    phone:{
        type: String,
        required: true
    },

    products: [{
        productID: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'products',
            unique: true
        },

        size:{
            type: String,
            required: true
        },

        quantity: {
            type: Number,
            default: 1,
            required: true
        }
    }],

    total: {
        type: Number,
        required: true
    },

    
});



//export
module.exports = mongoose.model('orders', orderSchema);