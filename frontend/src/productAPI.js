import api from "./api";

export const getProducts = async (url) => {
  try {
    const response = await api.post("/get-price", { url }); 
    return response.data;
  } catch (error) {
    console.error("Error fetching product price:", error);
    throw error;
  }
};

export const comparePrices = async (productName, url) => {
  try {
    const response = await api.post("/compare-prices", { productName, url });
    return response.data;
  } catch (error) {
    console.error("Error comparing prices:", error);
    throw error;
  }
};
