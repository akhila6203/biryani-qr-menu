import { useMemo, useState } from "react";
import {
  Minus,
  Plus,
  ShoppingBag,
  X,
  CreditCard,
  UtensilsCrossed,
} from "lucide-react";

/* =========================================================
   DUMMY MENU DATA

   Later ee data admin panel API nundi vastundi.
   Each row = one separate product/variant.
========================================================= */

const menuData = [
  {
    id: 1,
    name: "Chicken Dum Biryani",
    size: "Single",
    price: 120,
  },
  {
    id: 2,
    name: "Chicken Dum Biryani",
    size: "Double",
    price: 210,
  },
  {
    id: 3,
    name: "Chicken Dum Biryani",
    size: "Full",
    price: 390,
  },

  {
    id: 4,
    name: "Mutton Dum Biryani",
    size: "Single",
    price: 180,
  },
  {
    id: 5,
    name: "Mutton Dum Biryani",
    size: "Double",
    price: 320,
  },
  {
    id: 6,
    name: "Mutton Dum Biryani",
    size: "Full",
    price: 480,
  },

  {
    id: 7,
    name: "Chicken 65 Biryani",
    size: "Single",
    price: 150,
  },
  {
    id: 8,
    name: "Chicken 65 Biryani",
    size: "Double",
    price: 260,
  },
  {
    id: 9,
    name: "Chicken 65 Biryani",
    size: "Full",
    price: 420,
  },

  {
    id: 10,
    name: "Egg Biryani",
    size: "Single",
    price: 100,
  },
  {
    id: 11,
    name: "Egg Biryani",
    size: "Double",
    price: 180,
  },
  {
    id: 12,
    name: "Egg Biryani",
    size: "Full",
    price: 290,
  },

  {
    id: 13,
    name: "Veg Dum Biryani",
    size: "Single",
    price: 110,
  },
  {
    id: 14,
    name: "Veg Dum Biryani",
    size: "Double",
    price: 190,
  },
  {
    id: 15,
    name: "Veg Dum Biryani",
    size: "Full",
    price: 300,
  },
];

/* =========================================================
   HOME
========================================================= */

export default function Home() {
  const [quantities, setQuantities] = useState({});

  const [showCheckout, setShowCheckout] =
    useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    mobile: "",
  });

  /* =======================================================
     INCREASE QUANTITY
  ======================================================= */

  const increaseQuantity = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  /* =======================================================
     DECREASE QUANTITY
  ======================================================= */

  const decreaseQuantity = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(
        0,
        (prev[id] || 0) - 1
      ),
    }));
  };

  /* =======================================================
     SELECTED ITEMS
  ======================================================= */

  const selectedItems = useMemo(() => {
    return menuData
      .filter(
        (item) =>
          (quantities[item.id] || 0) > 0
      )
      .map((item) => ({
        ...item,

        quantity:
          quantities[item.id] || 0,

        total:
          item.price *
          (quantities[item.id] || 0),
      }));
  }, [quantities]);

  /* =======================================================
     TOTAL ITEMS
  ======================================================= */

  const totalQuantity = useMemo(() => {
    return selectedItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }, [selectedItems]);

  /* =======================================================
     TOTAL AMOUNT
  ======================================================= */

  const totalAmount = useMemo(() => {
    return selectedItems.reduce(
      (total, item) =>
        total + item.total,
      0
    );
  }, [selectedItems]);

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart = () => {
    if (totalQuantity === 0) {
      alert(
        "Please select at least one item."
      );

      return;
    }

    setShowCheckout(true);
  };

  /* =======================================================
     PAY NOW - DUMMY
  ======================================================= */

  const handlePayNow = (e) => {
    e.preventDefault();

    if (!customer.name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (
      !/^[6-9]\d{9}$/.test(
        customer.mobile
      )
    ) {
      alert(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    console.log({
      customer,
      selectedItems,
      totalQuantity,
      totalAmount,
    });

    alert(
      `Payment gateway will open here.\nTotal Amount: ₹${totalAmount}`
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f4ef] pb-28">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="sticky top-0 z-40 border-b border-[#eadbd4] bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

          {/* LOGO */}

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7c1114] text-white">
              <UtensilsCrossed size={21} />
            </div>

            <div>
              <h1 className="text-[17px] font-extrabold leading-tight text-[#7c1114] sm:text-xl">
                Biryani House
              </h1>

              <p className="mt-0.5 text-[9px] font-semibold tracking-[0.16em] text-[#9b6c57]">
                AUTHENTIC DUM BIRYANI
              </p>
            </div>

          </div>

          {/* CART */}

          <div className="flex items-center gap-2 rounded-full bg-[#f8eeee] px-3 py-2 text-[#7c1114]">

            <ShoppingBag size={17} />

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

          <p className="text-[12px] font-extrabold uppercase tracking-[0.25em] text-[#a66043]">
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

          <div className="hidden grid-cols-[minmax(250px,1fr)_130px_120px_170px] items-center border-b-2 border-[#7c1114] px-2 py-3 text-sm font-bold text-[#7c1114] sm:grid">

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

          </div>

          {/* ================================================
              ROWS
          ================================================ */}

          {menuData.map((item, index) => {
            const quantity =
              quantities[item.id] || 0;

            return (
              <div
                key={item.id}
                className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4 sm:grid-cols-[minmax(250px,1fr)_130px_120px_170px] ${
                  index !== menuData.length - 1
                    ? "border-b border-[#e5d6cf]"
                    : ""
                }`}
              >

                {/* ==========================================
                    NAME
                ========================================== */}

                <div className="min-w-0">

                  <h3 className="truncate text-[14px] font-bold text-[#351715] sm:text-[15px]">
                    {item.name}
                  </h3>

                  {/* MOBILE PORTION + PRICE */}

                  <div className="mt-1.5 flex items-center gap-2 sm:hidden">

                    <span className="rounded-md bg-[#f8eeee] px-2 py-1 text-[11px] font-semibold text-[#7c1114]">
                      {item.size}
                    </span>

                    <span className="text-[14px] font-extrabold text-[#7c1114]">
                      ₹{item.price}
                    </span>

                  </div>

                </div>

                {/* ==========================================
                    DESKTOP SIZE
                ========================================== */}

                <div className="hidden sm:block">

                  <span className="text-sm font-semibold text-[#62483f]">
                    {item.size}
                  </span>

                </div>

                {/* ==========================================
                    DESKTOP PRICE
                ========================================== */}

                <div className="hidden sm:block">

                  <span className="text-[15px] font-extrabold text-[#7c1114]">
                    ₹{item.price}
                  </span>

                </div>

                {/* ==========================================
                    QUANTITY
                ========================================== */}

                <div className="flex justify-end sm:justify-center">

                  <div className="flex items-center rounded-lg border border-[#dfcbc3] bg-white p-1">

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
                      className="flex h-8 w-8 items-center justify-center rounded-md text-[#7c1114] transition hover:bg-[#f9eeee] disabled:opacity-30"
                    >
                      <Minus size={15} />
                    </button>

                    {/* NUMBER */}

                    <span className="w-8 text-center text-[14px] font-black text-[#351715]">
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
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-[#7c1114] text-white transition hover:bg-[#5f0e10]"
                    >
                      <Plus size={15} />
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

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
              totalQuantity === 0
            }
            onClick={
              handleAddToCart
            }
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#7c1114] px-4 text-sm font-bold text-white shadow-md transition hover:bg-[#5f0e10] disabled:cursor-not-allowed disabled:bg-[#bc8d8e]"
          >

            <ShoppingBag size={18} />

            Add to Cart

          </button>

        </div>

      </div>

      {/* ==================================================
          CHECKOUT POPUP
      ================================================== */}

      {showCheckout && (

        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() =>
            setShowCheckout(false)
          }
        >

          <div
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-[26px] bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-[24px] sm:p-6"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MOBILE LINE */}

            <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[#e4d3cc] sm:hidden" />

            {/* HEADER */}

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a66043]">
                  Checkout
                </p>

                <h2 className="mt-1 text-xl font-black text-[#351715] sm:text-2xl">
                  Complete Your Order
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCheckout(false)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f8eeee] text-[#7c1114]"
              >

                <X size={18} />

              </button>

            </div>

            {/* ==============================================
                ORDER SUMMARY
            ============================================== */}

            <div className="mt-5 rounded-2xl bg-[#faf5f2] p-4">

              <p className="mb-3 text-sm font-bold text-[#351715]">
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

                        <p className="text-sm font-semibold text-[#4b2a25]">
                          {item.name}
                        </p>

                        <p className="mt-0.5 text-xs text-[#92766c]">
                          {item.size} ×{" "}
                          {item.quantity}
                        </p>

                      </div>

                      <p className="text-sm font-bold text-[#7c1114]">
                        ₹{item.total}
                      </p>

                    </div>

                  )
                )}

              </div>

              {/* TOTAL */}

              <div className="mt-4 flex items-center justify-between border-t border-[#e8d8d1] pt-3">

                <span className="font-bold text-[#351715]">
                  Total
                </span>

                <span className="text-xl font-black text-[#7c1114]">
                  ₹{totalAmount}
                </span>

              </div>

            </div>

            {/* ==============================================
                FORM
            ============================================== */}

            <form
              onSubmit={handlePayNow}
              className="mt-5 space-y-4"
            >

              {/* NAME */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-[#4a2c27]">
                  Your Name
                </label>

                <input
                  type="text"
                  value={
                    customer.name
                  }
                  onChange={(e) =>
                    setCustomer({
                      ...customer,

                      name:
                        e.target.value,
                    })
                  }
                  placeholder="Enter your name"
                  className="h-12 w-full rounded-xl border border-[#ddccc5] px-4 text-sm outline-none transition focus:border-[#7c1114] focus:ring-2 focus:ring-[#7c1114]/10"
                />

              </div>

              {/* MOBILE */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-[#4a2c27]">
                  Mobile Number
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={
                    customer.mobile
                  }
                  onChange={(e) =>
                    setCustomer({
                      ...customer,

                      mobile:
                        e.target.value.replace(
                          /\D/g,
                          ""
                        ),
                    })
                  }
                  placeholder="Enter 10-digit mobile number"
                  className="h-12 w-full rounded-xl border border-[#ddccc5] px-4 text-sm outline-none transition focus:border-[#7c1114] focus:ring-2 focus:ring-[#7c1114]/10"
                />

              </div>

              {/* PAY NOW */}

              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7c1114] font-bold text-white shadow-md transition hover:bg-[#5f0e10]"
              >

                <CreditCard size={18} />

                Pay Now ₹{totalAmount}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}