import React, { useContext, useEffect } from 'react'
import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import Products from '../Products/Products';
import './Category.css';
import { Context } from '../../context/AppContext';

const Category = () => {

    const { setstate } = useContext(Context);

    const { id } = useParams();
    const { data } = useFetch(
        `/api/products?populate=*&[filters][categories][id]=${id}`
    );
    console.log("categroy",data);
        
    
 useEffect(() => {
    setstate((prev) => ({ ...prev, products: data }));
 }, [data, setstate])

    return (
        <div className='category-main-content'>
            <div className='category-layout'>
                <div className='category-title'>{data?.data?.[0]?.attributes?.categories?.data?.[0]?.attributes?.title}</div>
                <Products innerPage={true} /> 
            </div>
        </div>
    )
}

export default Category
