const express= require ('express');
const connectDB = require ('./config/db');
const cors=require('cors');
require('dotenv').config();

const productRoutes=require('./routes/productRoutes');
const orderRoutes=require('./routes/orderRoutes');
const razorpayRoutes=require('./routes/razorpayRoutes');
const authRoutes=require('./routes/auth');
const app = express();

app.use(cors(
    {
        origin:["https://1dreamscape-creation.vercel.app",
           "http://localhost:3000"],

        methods:["GET","POST","PUT","DELETE"],
        credentials:true
    }
));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/api/products',productRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api/payment',razorpayRoutes);
app.use('/api/auth',authRoutes);
const PORT=5000;
app.get('/',(req,res)=>{
    res.send('Dreamscape api is running');

});
connectDB();
app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
});
