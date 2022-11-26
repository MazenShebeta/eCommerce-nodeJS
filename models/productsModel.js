const mongoose = require('mongoose');


const productsSchema = new mongoose.Schema({
    title: {
        type : String,
        required: true,
    },

    price: {
        type: Number,
        required: true
    },

    color: {
        type: String,
    },

    description: {
        type: String
    },

    category: {
        type: [String],
        required: true
    },

    isAvailable:{
        type: Boolean,
        required:true,
        default: true
    },

    sizesArray:{
        type: [{
            size:{
                type: String,
                required: true,
                unique: true
            },
            quantity:{
                type: Number,
                required: true
            }
        }],
        required: true
    },

    image: {
        type: String,
    },

    rating: {
        type: Number
    },

    reviews: {
        type: [{
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                min:1,
                max:5,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }]
    }

});


productsSchema.post('save', async function(){
    const product = this;
    if(product.reviews.length == 0){
        product.rating = 0;
    }
    else{
        const rating = product.rating
        const avgRating = (rating*(product.reviews.length-1) + product.reviews[product.reviews.length-1].rating)/product.reviews.length
        product.rating = avgRating;
    }
    //add all quantities of sizes
    let total = 0
    product.sizesArray.forEach(size => {
        total += size.quantity;
    });

    if(total == 0 ){
        product.isAvailable = false;
    }

    await product.save();
});



module.exports = mongoose.model('products', productsSchema);