const jwt = require('jsonwebtoken')


const verifyToken = (req, res, next)=>{
    const bearerHeader = req.headers.token;
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ')[1]
        jwt.verify(bearer, 'secretkey', (err, authData)=>{
            if(err){
                res.status(403).json("invalid Token!")
            }
            else{
                //authData is user id and isAdmin value
                req.user = authData
                next()
            }
        })
    }
    else{
        res.status(401).json("You are not authorized to access this page!")
    }
}

module.exports = verifyToken