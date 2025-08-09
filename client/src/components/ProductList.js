import React, { useEffect, useState } from 'react';

import ProductCard from './ProductCard';
import './ProductList.css';
import API from '../api';

const ProductList = ({onAddToCart}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   const [filtered, setFiltered] = useState([]);
    const [category, setCategory] = useState('all');

  useEffect(() => {
    // Fetch products from backend
    API.get('/api/products/')
      .then((res) =>{
        const allProducts=res.data;
        setProducts(allProducts);
       setFiltered(allProducts);
        
        setLoading(false);
        
        
      })
      .catch((err) =>{
     setError('Failed to load products');
     setLoading(false);
  });
},[]);
if(loading)return<p>Loading Products...</p>;
if(error)return<p style={{color:'red'}}>{error}</p>
const handleFilter=(cat)=>{

  setCategory(cat);
  if (cat==='all'){
    setFiltered(products);
  }else{
    const filteredList=products.filter((p)=>
      p.category?.toLowerCase().trim()===cat.toLowerCase().trim()
  );
    setFiltered(filteredList);
  }
  };


  return (
    <div  id="product-section"className='product-list'>
      <h2>Our Products</h2>
    <p>Total Products:{products?.length}</p>
    <div className="filter-buttons">
      <button onClick={()=>handleFilter('all')}className={category==='all'? 'active': ''}>All</button>
      <button onClick={()=>handleFilter('resin')}className={category==='resin'? 'active': ''}>Resin</button>
      <button onClick={()=>handleFilter('embroidery')}className={category==='embroidery'? 'active': ''}>Embroidery</button>
      <button onClick={()=>handleFilter('sketch')}className={category==='sketch'? 'active': ''}>Sketch</button>
      <button onClick={()=>handleFilter('crochet')}className={category==='crochet'? 'active': ''}>Crochet</button>
    </div>

      <div className="grid">  
        {filtered.length>0?(
          filtered.map((product)=>(<ProductCard key={product._id} product={product} onAddToCart={onAddToCart}/>

          ))
        ):(
          <p style={{textAlign:'center'}}>No products found for "{category}</p>
        
        )}
        
      
          </div>
    
      </div>
    
  );
};

export default ProductList;