const mongoose= require('mongoose');
const productSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    price:{
        type:Number,
        required:true,
    },
    category:String,
    image:String,
},{
    timestamps:true
});
module.exports=mongoose.model('Product',productSchema);