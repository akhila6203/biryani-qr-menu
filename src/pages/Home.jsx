import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Minus,
  Plus,
   ShoppingCart,
  X,
  CreditCard,
} from "lucide-react";

import {
  getMenuApi,
} from "../api/menuApi";

import {
  createCartApi,
} from "../api/cartApi";

import {
  createPaymentOrderApi,
  verifyPaymentApi,
} from "../api/orderApi";

import {
  loadRazorpay,
} from "../utils/loadRazorpay";


/* =========================================================
   HOME
========================================================= */

export default function Home() {

  /* =======================================================
     STATES
  ======================================================= */

  const [
    menuData,
    setMenuData,
  ] = useState([]);

  const [
    quantities,
    setQuantities,
  ] = useState({});

  const [
    showCheckout,
    setShowCheckout,
  ] = useState(false);

  const [
    customer,
    setCustomer,
  ] = useState({
    name: "",
    mobile: "",
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    menuError,
    setMenuError,
  ] = useState("");

  const [
    cartLoading,
    setCartLoading,
  ] = useState(false);

  const [
    paymentLoading,
    setPaymentLoading,
  ] = useState(false);

  const [
    cartId,
    setCartId,
  ] = useState(null);

const [
  successOrder,
  setSuccessOrder,
] = useState(null);
  /* =======================================================
     LOAD MENU FROM BACKEND
  ======================================================= */

  const loadMenu =
    useCallback(async () => {

      try {

        setLoading(true);
        setMenuError("");

        const response =
          await getMenuApi();

        const data =
          response?.data?.data;

        setMenuData(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Menu fetch error:",
          error
        );

        setMenuError(
          error?.response
            ?.data
            ?.message ||
          "Unable to load menu."
        );

      } finally {

        setLoading(false);

      }

    }, []);


  useEffect(() => {

    loadMenu();

  }, [loadMenu]);


  /* =======================================================
     INCREASE QUANTITY
  ======================================================= */

  const increaseQuantity =
    useCallback((id) => {

      setQuantities(
        (previous) => ({
          ...previous,

          [id]:
            (
              previous[id] ||
              0
            ) + 1,
        })
      );

    }, []);


  /* =======================================================
     DECREASE QUANTITY
  ======================================================= */

  const decreaseQuantity =
    useCallback((id) => {

      setQuantities(
        (previous) => {

          const current =
            previous[id] ||
            0;

          if (current <= 1) {

            const updated = {
              ...previous,
            };

            delete updated[id];

            return updated;
          }

          return {
            ...previous,

            [id]:
              current - 1,
          };
        }
      );

    }, []);


  /* =======================================================
     SELECTED ITEMS
  ======================================================= */

  const selectedItems =
    useMemo(() => {

      return menuData

        .filter(
          (item) =>
            (
              quantities[
                item.id
              ] || 0
            ) > 0
        )

        .map((item) => {

          const quantity =
            quantities[
              item.id
            ] || 0;

          const price =
            Number(
              item.amount ||
              0
            );

          return {
            ...item,

            /* UI compatibility */

            // size:
            //   item.portion,

            price,

            quantity,

            total:
              price *
              quantity,
          };

        });

    }, [
      menuData,
      quantities,
    ]);


  /* =======================================================
     TOTAL ITEMS
  ======================================================= */

  const totalQuantity =
    useMemo(() => {

      return selectedItems.reduce(
        (
          total,
          item
        ) =>
          total +
          item.quantity,
        0
      );

    }, [selectedItems]);


  /* =======================================================
     TOTAL AMOUNT
  ======================================================= */

  const totalAmount =
    useMemo(() => {

      return selectedItems.reduce(
        (
          total,
          item
        ) =>
          total +
          item.total,
        0
      );

    }, [selectedItems]);


  /* =======================================================
     ADD TO CART

     IMPORTANT:
     Button click ->
     POST /api/cart ->
     database save ->
     then checkout popup opens
  ======================================================= */

  const handleAddToCart =
    async () => {

      if (
        totalQuantity === 0
      ) {
        alert(
          "Please select at least one item."
        );

        return;
      }

      if (cartLoading) {
        return;
      }


      try {

        setCartLoading(true);


        /* =====================================
           SEND ONLY MENU ID + QUANTITY

           Amount frontend nundi trust cheyyamu.
           Backend database nundi actual
           amount calculate chesthundi.
        ===================================== */

        const items =
          selectedItems.map(
            (item) => ({
              menuItemId:
                Number(item.id),

              quantity:
                Number(
                  item.quantity
                ),
            })
          );


        /* =====================================
           SAVE CART IN DATABASE
        ===================================== */

        const response =
          await createCartApi({
            items,
          });


        const savedCart =
          response?.data?.data;


        if (!savedCart?.cartId) {

          throw new Error(
            "Cart was not saved."
          );

        }


        /* =====================================
           SAVE CART ID IN REACT STATE
        ===================================== */

        setCartId(
          savedCart.cartId
        );


        /* =====================================
           OPEN EXISTING CHECKOUT POPUP
        ===================================== */

        setShowCheckout(true);


      } catch (error) {

        console.error(
          "Add cart error:",
          error
        );

        alert(
          error?.response
            ?.data
            ?.message ||
          error?.message ||
          "Unable to add items to cart."
        );

      } finally {

        setCartLoading(false);

      }

    };


  /* =======================================================
     PAY NOW
  ======================================================= */

  const handlePayNow =
    async (event) => {

      event.preventDefault();


      if (paymentLoading) {
        return;
      }


      /* =====================================
         NAME
      ===================================== */

      const customerName =
        customer.name.trim();


      if (!customerName) {

        alert(
          "Please enter your name."
        );

        return;
      }


      /* =====================================
         MOBILE
      ===================================== */

      const mobile =
        customer.mobile.trim();


      if (
        !/^[6-9]\d{9}$/.test(
          mobile
        )
      ) {

        alert(
          "Please enter a valid 10-digit mobile number."
        );

        return;
      }


      /* =====================================
         CART
      ===================================== */

      if (
        selectedItems.length ===
        0
      ) {

        alert(
          "Your cart is empty."
        );

        return;
      }


      if (!cartId) {

        alert(
          "Cart not found. Please add the items to cart again."
        );

        return;
      }


      try {

        setPaymentLoading(
          true
        );


        /* =====================================
           LOAD RAZORPAY SCRIPT
        ===================================== */

        const razorpayLoaded =
          await loadRazorpay();


        if (!razorpayLoaded) {

          throw new Error(
            "Unable to load Razorpay."
          );

        }


        /* =====================================
           PAYMENT ITEMS

           Again:
           frontend amount send cheyyatledu.

           Backend menu_items table
           nundi amount calculate chesthundi.
        ===================================== */

        const items =
          selectedItems.map(
            (item) => ({
              menuItemId:
                Number(item.id),

              quantity:
                Number(
                  item.quantity
                ),
            })
          );


        /* =====================================
           CREATE RAZORPAY ORDER

           Current backend already:
           1. creates Razorpay order
           2. inserts orders
           3. inserts order_items
           4. status = pending
        ===================================== */

        const response =
  await createPaymentOrderApi({
    customer_name: customerName,
    mobile: mobile,
    cart_id: cartId,
  });


        const paymentData =
          response?.data?.data;


        if (
  !paymentData?.razorpay_order_id ||
  !paymentData?.key_id ||
  !paymentData?.amount ||
  !paymentData?.order_id
) {
  console.error(
    "Invalid payment response:",
    paymentData
  );

  throw new Error(
    "Invalid payment response."
  );
}


        /* =====================================
           RAZORPAY OPTIONS
        ===================================== */

        const options = {
  key: paymentData.key_id,

  amount: paymentData.amount,

  currency:
    paymentData.currency || "INR",

  name: "Biryani House",

  description:
    "Biryani Order Payment",

  order_id:
    paymentData.razorpay_order_id,


          /* =================================
             PAYMENT SUCCESS
          ================================= */

          handler:
            async function (
              razorpayResponse
            ) {

              try {

               const verifyResponse =
  await verifyPaymentApi({
    order_id:
      paymentData.order_id,

    cart_id:
      cartId,

    razorpay_order_id:
      razorpayResponse.razorpay_order_id,

    razorpay_payment_id:
      razorpayResponse.razorpay_payment_id,

    razorpay_signature:
      razorpayResponse.razorpay_signature,
  });


                if (
  verifyResponse
    ?.data
    ?.success
) {

  const verifiedData =
    verifyResponse
      ?.data
      ?.data || {};


  /* =================================
     SUCCESS PAGE DATA
  ================================= */

  setSuccessOrder({
  orderId:
    verifiedData.order_id,

  paymentId:
    verifiedData.razorpay_payment_id,

  paymentMethod:
    verifiedData.payment_method ||
    "Razorpay",

  customerName:
    verifiedData.customer_name ||
    customerName,

  mobile:
    verifiedData.mobile ||
    mobile,

  totalAmount:
    Number(
      verifiedData.total_amount ||
      totalAmount
    ),
});


  /* =================================
     CLEAR CURRENT CART UI
  ================================= */

  setQuantities({});


  setCustomer({
    name: "",
    mobile: "",
  });


  setCartId(null);


  setShowCheckout(false);



                } else {

                  alert(
                    "Payment verification failed."
                  );

                }

              } catch (
                verifyError
              ) {

                console.error(
                  "Payment verify error:",
                  verifyError
                );

                alert(
                  verifyError
                    ?.response
                    ?.data
                    ?.message ||
                  "Payment verification failed."
                );

              } finally {

                setPaymentLoading(
                  false
                );

              }

            },


          /* =================================
             CUSTOMER DETAILS
          ================================= */

          prefill: {

            name:
              customerName,

            contact:
              mobile,

          },


          /* =================================
             THEME
          ================================= */

          theme: {

            color:
              "#7c1114",

          },


          /* =================================
             USER CLOSES PAYMENT POPUP
          ================================= */

          modal: {

            ondismiss:
              function () {

                setPaymentLoading(
                  false
                );

              },

          },

        };


        /* =====================================
           OPEN RAZORPAY
        ===================================== */

        const razorpay =
          new window.Razorpay(
            options
          );


        /* =====================================
           PAYMENT FAILED
        ===================================== */

        razorpay.on(
          "payment.failed",

          function (response) {

            console.error(
              "Razorpay payment failed:",
              response.error
            );

            alert(
              response
                ?.error
                ?.description ||
              "Payment failed. Please try again."
            );

            setPaymentLoading(
              false
            );

          }
        );


        razorpay.open();


      } catch (error) {

        console.error(
          "Payment error:",
          error
        );

        alert(
          error?.response
            ?.data
            ?.message ||
          error?.message ||
          "Unable to start payment."
        );

        setPaymentLoading(
          false
        );

      }

    };



    /* =======================================================
   PAYMENT SUCCESS PAGE
======================================================= */

if (successOrder) {

  return (

    <main className="flex min-h-screen items-center justify-center bg-[#faf6f1] px-4">

      <div className="w-full max-w-md rounded-[24px] border border-[#eadbd3] bg-white p-7 text-center shadow-xl">

        {/* SUCCESS ICON */}

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">

          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12.5l4 4L19 7"
            />

          </svg>

        </div>


        {/* HEADING */}

        <h1 className="mt-5 text-2xl font-black text-[#351b17]">

          Payment Successful

        </h1>


        <p className="mt-2 text-sm leading-6 text-[#806c66]">

          Your order has been placed successfully.
          Thank you for ordering from Biryani House.

        </p>


        {/* ORDER DETAILS */}

        <div className="mt-6 rounded-2xl bg-[#faf6f1] p-5 text-left">

          <div className="flex items-center justify-between border-b border-[#eadbd3] pb-3">

            <span className="text-sm text-[#806c66]">
              Order ID
            </span>

            <span className="text-sm font-bold text-[#351b17]">

              #
              {
                successOrder
                  .orderId
              }

            </span>

          </div>


          <div className="flex items-center justify-between border-b border-[#eadbd3] py-3">

            <span className="text-sm text-[#806c66]">
              Payment Method
            </span>

            <span className="text-sm font-bold capitalize text-[#351b17]">

              {
                successOrder
                  .paymentMethod
              }

            </span>

          </div>


          <div className="flex items-center justify-between pt-3">

            <span className="text-sm font-semibold text-[#351b17]">
              Amount Paid
            </span>

            <span className="text-lg font-black text-[#8f1115]">

              ₹
              {
                Number(
                  successOrder
                    .totalAmount ||
                  0
                ).toLocaleString(
                  "en-IN"
                )
              }

            </span>

          </div>

        </div>


        {/* BUTTON */}

        <button
          type="button"
          onClick={() => {

            setSuccessOrder(null);

          }}
          className="mt-6 w-full rounded-xl bg-[#bf0000] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#a50000]"
          // className="mt-6 w-full rounded-xl bg-[#8f1115] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#741014]"
        >

          Order More

        </button>

      </div>

    </main>

  );

}

  return (

    // <div className="min-h-screen bg-[#f8f4ef] pb-28">
    <div className="min-h-screen bg-[#fffafa] pb-28">

      {/* ==================================================
          HEADER
      ================================================== */}

      {/* <header className="sticky top-0 z-40 border-b border-[#eadbd4] bg-white"> */}
          <header className="sticky top-0 z-40 border-b border-[#bf0000]/10 bg-white shadow-sm">

        {/* <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"> */}
            <div className="mx-auto flex min-h-[78px] max-w-6xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">

          {/* LOGO */}
          <div className="flex items-center">
            <img
              src="/vaibhavi.png"
              alt="Vaibhavi"
              className="h-[62px] w-auto max-w-[200px] object-contain sm:h-[68px] sm:max-w-[220px]"
            />
          </div>
          {/* <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7c1114] text-white">

              <UtensilsCrossed
                size={21}
              />

            </div>


            <div>

              <h1 className="text-[17px] font-extrabold leading-tight text-[#7c1114] sm:text-xl">
                Biryani House
              </h1>

              <p className="mt-0.5 text-[9px] font-semibold tracking-[0.16em] text-[#9b6c57]">
                AUTHENTIC DUM BIRYANI
              </p>

            </div>

          </div> */}


          {/* CART */}

          {/* <div className="flex items-center gap-2 rounded-full bg-[#f8eeee] px-3 py-2 text-[#7c1114]"> */}
              <div className="flex items-center gap-2 rounded-full bg-[#bf0000]/10 px-3 py-2 text-[#bf0000]">
            <ShoppingCart
              size={17}
            />

            <span className="text-sm font-bold">
              {totalQuantity}
            </span>

          </div>

        </div>

      </header>


      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="mx-auto max-w-6xl px-3 pb-8 pt-5 sm:px-6 sm:pt-7 lg:px-8">


        {/* MENU HEADING */}

        <div className="mb-4">

          <p className="text-[12px] font-extrabold uppercase tracking-[0.25em] text-[#bf0000]">
          {/* <p className="text-[12px] font-extrabold uppercase tracking-[0.25em] text-[#a66043]"> */}
            Our Menu
          </p>

        </div>


        {/* ==================================================
            TABLE
        ================================================== */}

        <div className="w-full">


          {/* ================================================
              DESKTOP / TABLET HEADER
          ================================================ */}
          <div 
            className="hidden grid-cols-[minmax(250px,1fr)_140px_150px] items-center border-b-2 border-[#bf0000] px-2 py-3 text-sm font-bold text-[#bf0000] sm:grid"
          >
            <div>
              Biryani
            </div>

            <div>
              Price
            </div>

            <div className="text-center">
              Quantity
            </div>
          </div>
          {/* <div 
           className="hidden grid-cols-[minmax(250px,1fr)_130px_120px_170px] items-center border-b-2 border-[#bf0000] px-2 py-3 text-sm font-bold text-[#bf0000] sm:grid">
            <div>
              Biryani
            </div>

            <div>
              Portion
            </div>

            <div>
              Price
            </div>

            <div className="text-center">
              Quantity
            </div>

          </div> */}


          {/* ================================================
              LOADING
          ================================================ */}

          {loading && (

            <div className="py-12 text-center">

              <p className="text-sm font-semibold text-[#92766c]">
                Loading menu...
              </p>

            </div>

          )}


          {!loading &&
            menuError && (

            <div className="py-12 text-center">

              <p className="text-sm font-semibold text-red-600">
                {menuError}
              </p>

              <button
                type="button"
                onClick={loadMenu}
                className="mt-3 text-sm font-bold text-[#7c1114]"
              >
                Try Again
              </button>

            </div>

          )}


          {!loading &&
            !menuError &&
            menuData.length ===
              0 && (

            <div className="py-12 text-center">

              <p className="text-sm font-semibold text-[#92766c]">
                No menu items available.
              </p>

            </div>

          )}


          {!loading &&
            !menuError &&
            menuData.map(
              (
                item,
                index
              ) => {

                const quantity =
                  quantities[
                    item.id
                  ] || 0;

                return (

                  // <div
                  //   key={item.id}
                  //   className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4 sm:grid-cols-[minmax(250px,1fr)_130px_120px_170px] ${
                  //     index !==
                  //     menuData.length -
                  //       1
                  //       ? "border-b border-[#e5d6cf]"
                  //       : ""
                  //   }`}
                  // >

                  //   <div className="min-w-0">

                  //     <h3 className="truncate text-[14px] font-bold text-[#351715] sm:text-[15px]">
                  //       {item.name}
                  //     </h3>


                  //     <div className="mt-1.5 flex items-center gap-2 sm:hidden">

                  //       <span className="rounded-md bg-[#bf0000]/10 px-2 py-1 text-[11px] font-semibold text-[#bf0000]">
                  //       {/* <span className="rounded-md bg-[#f8eeee] px-2 py-1 text-[11px] font-semibold text-[#7c1114]"> */}
                  //         {item.portion}
                  //       </span>


                  //       <span className="text-[14px] font-extrabold text-[#bf0000]">
                  //         ₹
                  //         {Number(
                  //           item.amount
                  //         )}
                  //       </span>

                  //     </div>

                  //   </div>

                  //   <div className="hidden sm:block">

                  //     <span className="text-sm font-semibold text-[#62483f]">
                  //       {item.portion}
                  //     </span>

                  //   </div>

                  //   <div className="hidden sm:block">

                  //     <span 
                  //     className="text-[15px] font-extrabold text-[#bf0000]">
                  //       ₹
                  //       {Number(
                  //         item.amount
                  //       )}
                  //     </span>

                  //   </div>


                  //   <div className="flex justify-end sm:justify-center">

                  //     <div 
                  //     className="flex items-center rounded-lg border border-[#bf0000]/20 bg-white p-1">


                  //       {/* MINUS */}

                  //       <button
                  //         type="button"
                  //         disabled={
                  //           quantity ===
                  //           0
                  //         }
                  //         onClick={() =>
                  //           decreaseQuantity(
                  //             item.id
                  //           )
                  //         }
                  //         className="flex h-8 w-8 items-center justify-center rounded-md text-[#bf0000] transition hover:bg-[#bf0000]/10 disabled:opacity-30"
                  //         // className="flex h-8 w-8 items-center justify-center rounded-md text-[#7c1114] transition hover:bg-[#f9eeee] disabled:opacity-30"
                  //       >

                  //         <Minus
                  //           size={15}
                  //         />

                  //       </button>


                  //       {/* NUMBER */}

                  //       <span className="w-8 text-center text-[14px] font-black text-[#351715]">
                  //         {quantity}
                  //       </span>


                  //       {/* PLUS */}

                  //       <button
                  //         type="button"
                  //         onClick={() =>
                  //           increaseQuantity(
                  //             item.id
                  //           )
                  //         }
                  //         className="flex h-8 w-8 items-center justify-center rounded-md bg-[#bf0000] text-white transition hover:bg-[#a50000]"
                  //         // className="flex h-8 w-8 items-center justify-center rounded-md bg-[#7c1114] text-white transition hover:bg-[#5f0e10]"
                  //       >

                  //         <Plus
                  //           size={15}
                  //         />

                  //       </button>

                  //     </div>

                  //   </div>

                  // </div>
                  <div
  key={item.id}
  className={`grid grid-cols-[minmax(0,1fr)_70px_104px] items-center gap-2 py-4 sm:grid-cols-[minmax(250px,1fr)_140px_150px] sm:gap-3 ${
    index !==
    menuData.length - 1
      ? "border-b border-[#e5d6cf]"
      : ""
  }`}
>

  {/* =====================================
      MENU NAME
  ===================================== */}

  <div className="min-w-0">

    <h3 className="truncate text-[13px] font-bold text-[#351715] sm:text-[15px]">
      {item.name}
    </h3>

  </div>


  {/* =====================================
      AMOUNT

      Mobile + Tablet + Desktop
  ===================================== */}

  <div>

    <span className="whitespace-nowrap text-[13px] font-extrabold text-[#bf0000] sm:text-[15px]">

      ₹
      {Number(
        item.amount
      ).toLocaleString(
        "en-IN"
      )}

    </span>

  </div>


  {/* =====================================
      QUANTITY
  ===================================== */}

  <div className="flex justify-end sm:justify-center">

    <div className="flex items-center rounded-lg border border-[#bf0000]/20 bg-white p-[3px]">

      {/* MINUS */}

      <button
        type="button"
        disabled={
          quantity === 0
        }
        onClick={() =>
          decreaseQuantity(
            item.id
          )
        }
        className="flex h-7 w-7 items-center justify-center rounded-md text-[#bf0000] transition hover:bg-[#bf0000]/10 disabled:opacity-30 sm:h-8 sm:w-8"
      >

        <Minus
          size={14}
        />

      </button>


      {/* QUANTITY NUMBER */}

      <span className="w-6 text-center text-[13px] font-black text-[#351715] sm:w-8 sm:text-[14px]">

        {quantity}

      </span>


      {/* PLUS */}

      <button
        type="button"
        onClick={() =>
          increaseQuantity(
            item.id
          )
        }
        className="flex h-7 w-7 items-center justify-center rounded-md bg-[#bf0000] text-white transition hover:bg-[#a50000] sm:h-8 sm:w-8"
      >

        <Plus
          size={14}
        />

      </button>

    </div>

  </div>

</div>

                );

              }
            )}

        </div>

      </main>


      {/* ==================================================
          BOTTOM CART
      ================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#eadbd4] bg-white px-3 py-3 shadow-[0_-5px_20px_rgba(60,20,15,0.08)] sm:px-6">

        <div className="mx-auto flex max-w-6xl items-center gap-3">

          <div className="min-w-[72px]">

            <p className="text-[10px] text-[#91776e]">

              {totalQuantity}{" "}

              {totalQuantity === 1
                ? "item"
                : "items"}

            </p>

            <p className="text-xl font-black leading-tight text-[#351715]">
              ₹{totalAmount}
            </p>

          </div>


          <button
            type="button"
            disabled={
              totalQuantity === 0 ||
              cartLoading
            }
            onClick={
              handleAddToCart
            }
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#bf0000] px-4 text-sm font-bold text-white shadow-md transition hover:bg-[#a50000] disabled:cursor-not-allowed disabled:bg-[#d99a9a]"
            // className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#7c1114] px-4 text-sm font-bold text-white shadow-md transition hover:bg-[#5f0e10] disabled:cursor-not-allowed disabled:bg-[#bc8d8e]"
          >

            <ShoppingCart
              size={18}
            />

            {cartLoading
              ? "Adding..."
              : "Add to Cart"}

          </button>

        </div>

      </div>


      {/* ==================================================
          CHECKOUT POPUP
      ================================================== */}

      {showCheckout && (

        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() => {

            if (
              !paymentLoading
            ) {
              setShowCheckout(
                false
              );
            }

          }}
        >

          <div
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-[26px] bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-[24px] sm:p-6"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            {/* MOBILE LINE */}

            <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[#e4d3cc] sm:hidden" />


            {/* HEADER */}

            <div className="flex items-start justify-between gap-4">

              <div>

                {/* <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a66043]">
                  Checkout
                </p> */}
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#bf0000]">
                  Checkout
                </p>

                {/* <h2 className="mt-1 text-xl font-black text-[#351715] sm:text-2xl"> */}
                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  Complete Your Order
                </h2>

              </div>


              <button
                type="button"
                disabled={
                  paymentLoading
                }
                onClick={() =>
                  setShowCheckout(
                    false
                  )
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#bf0000]/10 text-[#bf0000] transition hover:bg-[#bf0000]/15 disabled:opacity-50"
                // className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f8eeee] text-[#7c1114] disabled:opacity-50"
              >

                <X size={18} />

              </button>

            </div>


            {/* ==============================================
                ORDER SUMMARY
            ============================================== */}

            <div 
            // className="mt-5 rounded-2xl bg-[#faf5f2] p-4"
            className="mt-5 rounded-2xl border border-[#bf0000]/10 bg-[#fff8f8] p-4">

              {/* <p className="mb-3 text-sm font-bold text-[#351715]"> */}
              <p className="mb-3 text-sm font-bold text-slate-900">
                Order Summary
              </p>


              <div className="space-y-3">

                {selectedItems.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3"
                    >

                      <div>

                        <p className="text-sm font-semibold text-slate-800">
                          {item.name}
                        </p>

                        {/* <p className="mt-0.5 text-xs text-slate-500">
                          {item.portion}
                          {" × "}
                          {item.quantity}
                        </p> */}
                        <p className="mt-0.5 text-xs text-slate-500">
                          Qty: {item.quantity}
                        </p>

                      </div>


                      {/* <p className="text-sm font-bold text-[#7c1114]"> */}
                      <p className="text-sm font-bold text-[#bf0000]">
                        ₹{item.total}
                      </p>

                    </div>

                  )
                )}

              </div>


              {/* TOTAL */}

              {/* <div className="mt-4 flex items-center justify-between border-t border-[#e8d8d1] pt-3"> */}
              <div className="mt-4 flex items-center justify-between border-t border-[#bf0000]/15 pt-3">

                {/* <span className="font-bold text-[#351715]"> */}
                <span className="font-bold text-slate-900">
                  Total
                </span>

                {/* <span className="text-xl font-black text-[#7c1114]"> */}
                <span className="text-xl font-black text-[#bf0000]">
                  ₹{totalAmount}
                </span>

              </div>

            </div>


            {/* ==============================================
                FORM
            ============================================== */}

            <form
              onSubmit={
                handlePayNow
              }
              className="mt-5 space-y-4"
            >


              {/* NAME */}

              <div>

                {/* <label className="mb-1.5 block text-sm font-semibold text-[#4a2c27]"> */}
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Your Name
                </label>

                <input
                  type="text"
                  value={
                    customer.name
                  }
                  disabled={
                    paymentLoading
                  }
                  onChange={(
                    event
                  ) =>
                    setCustomer(
                      (
                        previous
                      ) => ({
                        ...previous,

                        name:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Enter your name"
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-800 outline-none transition focus:border-[#bf0000] focus:ring-2 focus:ring-[#bf0000]/10 disabled:bg-slate-50"
                  // className="h-12 w-full rounded-xl border border-[#ddccc5] px-4 text-sm outline-none transition focus:border-[#7c1114] focus:ring-2 focus:ring-[#7c1114]/10 disabled:bg-slate-50"
                />

              </div>


              {/* MOBILE */}

              <div>

                {/* <label className="mb-1.5 block text-sm font-semibold text-[#4a2c27]"> */}
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Mobile Number
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={
                    customer.mobile
                  }
                  disabled={
                    paymentLoading
                  }
                  onChange={(
                    event
                  ) =>
                    setCustomer(
                      (
                        previous
                      ) => ({
                        ...previous,

                        mobile:
                          event
                            .target
                            .value
                            .replace(
                              /\D/g,
                              ""
                            ),
                      })
                    )
                  }
                  placeholder="Enter 10-digit mobile number"
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-800 outline-none transition focus:border-[#bf0000] focus:ring-2 focus:ring-[#bf0000]/10 disabled:bg-slate-50"
                  // className="h-12 w-full rounded-xl border border-[#ddccc5] px-4 text-sm outline-none transition focus:border-[#7c1114] focus:ring-2 focus:ring-[#7c1114]/10 disabled:bg-slate-50"
                />

              </div>


              {/* PAY NOW */}

              <button
                type="submit"
                disabled={
                  paymentLoading
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#bf0000] font-bold text-white shadow-md transition hover:bg-[#a50000] disabled:cursor-not-allowed disabled:opacity-60"
                // className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7c1114] font-bold text-white shadow-md transition hover:bg-[#5f0e10] disabled:cursor-not-allowed disabled:opacity-60"
              >

                <CreditCard
                  size={18}
                />

                {paymentLoading
                  ? "Please wait..."
                  : `Pay Now ₹${totalAmount}`}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}



