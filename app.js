const express = require('express');
const app = express();
const userRoutes = require('./router/userRouter');
const adminRoutes = require('./router/adminRouter');
const cors = require('cors');

app.use(cors()); app.use(express.json()); 
app.use(express.urlencoded({ extended : true}));
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);





app.listen(3000, ()=>{
    console.log(`listening on 3000`);
})
