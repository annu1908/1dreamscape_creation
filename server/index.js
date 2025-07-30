const express= require ('express');
const connectDB = require ('./config/db');
const cors=require('cors');
require('dotenv').config();

const productRoutes=require('./routes/productRoutes');
const orderRoutes=require('./routes/orderRoutes');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/products',productRoutes);
app.use('/api/orders',orderRoutes);
const PORT=5000;
app.get('/',(req,res)=>{
    res.send('Dreamscape api is running');

});
connectDB();
app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
});
