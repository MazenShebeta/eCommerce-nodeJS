const User = require('../../models/userModel');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Products = require('../../models/productsModel');


require('../../models/connections');


class user{

    static async getIDFromToken(token){
        try{
            const decoded = jwt.verify(token, 'secretkey')
            return decoded.id
        }
        catch(err){
            throw new Error(err.message)
        }
    }

    // craete one user
    static async save(name, email, password, age, favoriteFoods){
        await bcrypt.hash(password, 9, (err, hash)=>{
            if(err) return console.error(err);
            let user = new User({
                name: name,
                email: email,
                password: hash,
                age: age,
            });
            user.save((err, data)=>{
                if(err) return console.error(err);
                console.log(data);
            });
        });
    }

    //create multiple people
    static async create(arrayOfPeople){
        await User.create(arrayOfPeople, (err, data)=>{
            if(err) return console.error(err);
            console.log(data);
        });
    }
    //find a user by name
    static async searchForUser(userName){
        try{
            let data = await User.find({name: userName});
            console.log(data)
        }
        catch(err){
            console.error(err)
        }
        
    }
    //find a user by favorite food
    static async findOne(favoriteFood){
        await User.findOne({favoriteFoods: favoriteFood}, (err, data)=>{
            if(err) return console.error(err);
            console.log(data);
        });
    }
    //find a user by id
    static async findById(userId){
        await User.findById(userId, (err, data)=>{
                if(err) return console.error(err);
                console.log(data);
            }
        );
    }
    //find a user by id and update
    static async findOneAndUpdate(userId, userName){
        await User.findById(userId, (err, data)=>{
            if(err) return console.error(err);
            data.name = userName;
            data.save((err, data)=>{
                if(err) return console.error(err);
                console.log(data);
            });
        });
    }

    //find a user by id and delete
    static async findByIdAndRemove(userId){
        await User.findByIdAndRemove(userId, (err, data)=>{
            if(err) return console.error(err);
            console.log(data);
        }
    );
    }
    //find people and delete
    static async remove(arrayOfPeople){
        await User.remove({name: arrayOfPeople}, (err, data)=>{
            if(err) return console.error(err);
            console.log(data);
        });
    }
    static async chainSearchQuery(){
        let chain = await User.find({favoriteFoods:"pizza"}).sort({name:1}).limit(2).select('name favoriteFoods')
        console.log(chain)
    }
    static async checkCredentials(email, password){
        //return id of user
        let user = await User.findOne({email: email})
        console.log("user: " + user)
        if(user){
            let match = await bcrypt.compare(password, user.password)
            console.log("match: " + match)
            if(match){
                return user._id
            }
            else{
                return console.error("password does not match")
            }
        }
        else{
            return console.error("user not found")
        }
    }

    static verifyToken(req, res, next){
        const bearerHeader = req.headers['authorization']
        if(typeof bearerHeader !== 'undefined'){
            const bearer = bearerHeader.split(' ')
            const bearerToken = bearer[1]
            req.token = bearerToken
            next()
        }
        else{
            res.sendStatus(403)
        }
    }

    static async showAccount(req, res){
        const id = req.user.id
        let user = await User.findById(id, (err, data)=>{
            if(err) return console.error(err);
            console.log(data);
        });
    }

    static async register(req, res){
        try{
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                age: req.body.age,
            })
            await user.save()
            res.send(user)
            
        }
        catch(err){
            res.status(500).json({error: err.message})
        }
    }

    static async login(req, res){
        try{
            const userID = await user.checkCredentials(req.body.email, req.body.password)
            //get isAdmin value for user
            const currentUser = await User.findOne({_id: userID})
            const userPrivilege = currentUser.isAdmin
            console.log('userPrivilege: ' + userPrivilege)
            console.log("login userID"+userID)
            let token = jwt.sign({id:userID, isAdmin:userPrivilege}, 'secretkey')
            try{
                let response = await user.addTokenToDatabase(userID, token)
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
            const token = req.headers.authorization.split(' ')[1]
            console.log(token)
            //delete token from database
            const response = await user.deleteTokenFromDatabase(token)
            res.send(response)
        }
        catch(err){
            res.status(400).send(err.message)
        }
    }

    static async deleteTokenFromDatabase(token){
        try{
            const user = await User.findOne({_id: req.user.id})
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



    static async addTokenToDatabase(id, token){
        try{
            const user = await User.findOne({_id:id})
            console.log(user)
            if(user){
                user.tokens = await user.tokens.concat({token})
                await user.save()
                return user
            }
            else{
                return("user not found")
            }
        }
        catch(err){
            console.log(err.message)
        }
        
    }

    static async getAll(req, res){
        try{
            const users = await User.find({})
            res.send(users)
        }
        catch(err){
            res.send(err.message)
        }
    }

    static async update(req, res){
        //get id from token
        const id = req.user.id
        //find and update user
        if(req.body.password)
            req.body.password = await bcrypt.hash(req.body.password, 9)
        if(req.params.id === id){
            try{
                const user = await User.findOneAndUpdate({_id: id}, req.body, {new: true, runValidators: true})
                if(!user){
                    return res.status(404).send("user not found")
                }
                res.send(user)
            }
            catch(err){
                res.status(400).send(err.message)
            }
        }
        else{
            res.status(401).send("you are not authorized to update this user.")
        }
      
    }

    static async deleteUser(req, res){
        const token = req.headers.token.split(' ')[1]
        const id = jwt.verify(token, 'secretkey').id
        if(req.params.id === id){
            try{
            
                if(!user){
                    return res.status(404).send("user not found")
                }
                res.send("user deleted")
            }
            catch(err){
                res.status(400),send(err.message)
            }
        }
        else{
            res.status(401).send("you are not authorized to delete this user.")
        }
    }

    static async viewProducts(req, res){
        const qCategory = req.query.category
        try{
            let products = await Products.find({})
            if(qCategory){
                products = await Products.find({category: qCategory})
            }
            res.send(products)
        }
        catch(err){

            res.status(400).send(err.message)
        }
    }

    static async reviewProduct(req, res){
        const id = req.user.id
        const productID = req.params.id
        const user = await User.findOne({_id: id})
        const name = user.name
        console.log(name)
        const rating = req.body.rating
        const comment = req.body.comment
        try{
            const product = await Products.findOne({_id: productID})
            if(product){
                product.reviews = product.reviews.concat({name, rating, comment})
                await product.save()
                res.send(product)
            }
            else{
                res.status(404).send("user not found")
            }
        }
        catch(err){
            res.status(400).send(err.message)
        }
    }
}





// //add a user
// user.save('Shebeta',"mazen@mail.com","PrettyStrongPassword4321*", 23, ['Spagetti', 'Molokhya']);
// // add multiple people
// user.create([{name: 'Jake', age: 27, favoriteFoods: ['pizza', 'burger']}, {name: 'Jane', age: 30, favoriteFoods: ['pizza', 'burger']}]);
// //find a user by name
// user.searchForUser('John');
// //find a user by favorite food
// user.findOne('pizza');
// //find a user by id
// user.findById('635abf72e92865dc8e19a53e');
// //find a user by id and update
// user.findOneAndUpdate('635abf72e92865dc8e19a53e', 'John Doe');
// //find a user by id and delete
// user.findByIdAndRemove('635abf72e92865dc8e19a53e');
// //find people and delete
// user.remove(['Jake', 'Jane']);
// user.chainSearchQuery();
// user.login('mazen@mail.com', 'PrettyStrongPassword4321*')



//export logIn

module.exports = user;

