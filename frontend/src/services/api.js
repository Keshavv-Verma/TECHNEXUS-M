import axios from "axios";

const params = {    
    headers: {
        Authorization: "bearers " + process.env.REACT_APP_STRIPE_APP_KEY,
    },

};



export const fetchDataFromApi = async (url) => {
    try{
        const { data } = await axios.get(process.env.REACT_APP_API_URL + url, params);
        console.log("data type", data);
        return data;
    } catch ( error ) {
        console.log(error)
        return error;
    }; 
};

export const makePaymentRequest = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        Authorization: "bearers " + process.env.REACT_APP_STRIPE_APP_KEY,
    },
})



