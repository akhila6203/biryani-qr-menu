import axiosClient from "./axiosClient";

/* =========================================
   CREATE RAZORPAY ORDER
========================================= */

export const createPaymentOrderApi = (data) => {
  return axiosClient.post(
    "/payments/create-order",
    data
  );
};


/* =========================================
   VERIFY RAZORPAY PAYMENT
========================================= */

export const verifyPaymentApi = (data) => {
  return axiosClient.post(
    "/payments/verify",
    data
  );
};