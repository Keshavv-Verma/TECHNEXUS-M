import React,{useContext} from 'react'
import Product from './Product/Product'
import './Products.css'
import { Context } from '../../context/AppContext'

const Products = ({ innerPage, headingText }) => {

    

    const { state } = useContext(Context);

    // console.log("products", state.products);


    return (
        <div className='product-container'>
            {!innerPage && <div className='sec-heading'>{headingText}</div>}
            <div className='products'>
                {state?.products?.data?.map((item) => (

                    
                    <Product 
                        key={item.id} 
                        id={item.id} 
                        data={item.attributes} 
                    />
                 ))}
            </div>
        </div>
    )
}

export default Products;
