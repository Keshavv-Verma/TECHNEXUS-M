import { useContext, useEffect } from "react";
import "./RelatedProducts.css"
import useFetch from "../../../hooks/useFetch"
import Products from "../../Products/Products"
import { Context } from "../../../context/AppContext";
function RelatedProduct({productId, categoryId}) {
 
     const {data} = useFetch(`/api/products?populate=*&filters[id][$ne]=${productId}&filters[categories][id]=${categoryId}&pagination[start]=0&pagination[limit]=4`)
      console.log("hurryyyyy",data);

      const { setstate } = useContext(Context)

      useEffect(() => {
        setstate((prev) => ({ ...prev, products: data }));
     }, [data, setstate]);

  return (
    <div className='related-products'>
      <Products headingText="Related Products" />
    </div>
  )
}

export default RelatedProduct
