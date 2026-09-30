import axiosClient from "./axiosClient";


/* =========================================
   SAVE CART
========================================= */

export const createCartApi = (
  data
) => {
  return axiosClient.post(
    "/cart",
    data
  );
};


/* =========================================
   GET CART
========================================= */

export const getCartApi = (
  cartId
) => {
  return axiosClient.get(
    `/cart/${cartId}`
  );
};