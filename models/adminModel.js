const mongoose = require('mongoose');
const validator = require('validator')
const { passwordStrength } = require('check-password-strength')
const bcrypt = require('bcrypt')



const adminSchema = new mongoose.Schema({
    name: {type : String, required: true, unique: true},
    
    email: {
        type: String,
        required: true, 
        unique: true, 
        lowerCase: true,
        
        validate(val){
        if(!validator.isEmail(val)){
            throw new Error("invalid E-mail")
        }

    }},

    password: {
        type: String,

        validate(val){
        if(passwordStrength(val).value !="Strong")
        {
            
            throw new Error("try a stronger password")}
    }},

    age: {
        type: Number 
    },

    isAdmin: {
        type: Boolean,
        default: true
    },

    tokens: {
        type: [{
        token: {
            type: String,
        },
    }],
    validate: tokenValidation
}


});

function tokenValidation(val){
    if(val.length>5){
        throw new Error('exceeded number of logins')
    }
}


adminSchema.pre('save', async function(){
    if(this.isModified("password"))
        this.password = await bcrypt.hash(this.password, 9)

})


adminSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

//export
module.exports = mongoose.model('admins', adminSchema);