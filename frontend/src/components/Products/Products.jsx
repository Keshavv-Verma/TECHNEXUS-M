import React,{useContext} from 'react'
import Product from './Product/Product'
import './Products.css'
import { Context } from '../../context/AppContext'

const Products = ({ innerPage, headingText, productsData }) => {

    const { state } = useContext(Context);

    const dataList = productsData?.data || state?.products?.data || [];

    return (
        <div className='product-container'>
            {!innerPage && <div className='sec-heading'>{headingText}</div>}
            <div className='products'>
                {dataList.map((item) => (

                    
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
