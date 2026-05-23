import { useEffect, useState } from "react";
import { fetchDataFromApi } from "../services/api";



const useFetch = (endpoint) => {

    const [data, setData] = useState();

    useEffect(() => {
        const makeApiCall = async () => {
            const res = await fetchDataFromApi(endpoint);
            setData(res);
        };

        makeApiCall();
    }, [endpoint]);

    return { data };
};

export default useFetch;
