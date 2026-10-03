const user = JSON.parse(
  localStorage.getItem("campusByteUser") || "null"
);


// =========================
// PROTECT PAGE
// =========================

if (!user) {

  window.location.href = "index.html";

}


// =========================
// ELEMENTS
// =========================

const cartItems =
  document.getElementById("cartItems");

const cartStatus =
  document.getElementById("cartStatus");

const summaryItems =
  document.getElementById("summaryItems");

const summarySubtotal =
  document.getElementById("summarySubtotal");

const summaryTotal =
  document.getElementById("summaryTotal");

const checkoutBtn =
  document.getElementById("checkoutBtn");


// =========================
// LOAD CART
// =========================

async function loadCart() {

  cartStatus.textContent =
    "Loading your cart...";

  cartItems.innerHTML = "";


  try {

    const response = await fetch(
      "http://localhost:8080/api/cart?studentEmail=" +
      encodeURIComponent(user.email)
    );


    if (!response.ok) {

      throw new Error(
        "Unable to load cart."
      );

    }


    const cart = await response.json();


    renderCart(cart);


  } catch (error) {

    console.error(error);

    cartStatus.textContent =
      "Unable to connect to the cart service.";

  }

}


// =========================
// RENDER CART
// =========================

function renderCart(cart) {

  cartItems.innerHTML = "";


  if (cart.length === 0) {

    cartStatus.textContent = "";

    cartItems.innerHTML = `

      <div class="empty-cart">

        <div class="empty-cart-icon">
          🛒
        </div>

        <h2>
          Your cart is empty
        </h2>

        <p>
          Add something delicious from today's menu.
        </p>

        <a href="dashboard.html#todayMenu">
          Browse Today's Menu
        </a>

      </div>

    `;

    updateSummary([]);

    return;
  }


  cartStatus.textContent =
    cart.length +
    (cart.length === 1 ? " item" : " items") +
    " in your cart";


  cart.forEach(item => {

    const element =
      document.createElement("div");

    element.className = "cart-item";


    element.innerHTML = `

      <div class="cart-icon">
        🍛
      </div>


      <div class="cart-info">

        <h3>
          ${escapeHtml(item.name)}
        </h3>

        <p>
          ${escapeHtml(
      item.category || "Food"
    )}
        </p>

        <div class="cart-price">
          ₹${Number(item.price).toFixed(2)}
        </div>

      </div>


      <div class="quantity-control">

        <button
          class="decrease-btn"
        >
          −
        </button>

        <span class="quantity-value">
          ${item.quantity}
        </span>

        <button
          class="increase-btn"
        >
          +
        </button>

      </div>


      <div class="item-subtotal">

        ₹${Number(item.subtotal).toFixed(2)}

      </div>


      <button
        class="remove-btn"
        title="Remove"
      >
        ✕
      </button>

    `;


    element
      .querySelector(".decrease-btn")
      .addEventListener("click", () => {

        updateQuantity(
          item.id,
          item.quantity - 1
        );

      });


    element
      .querySelector(".increase-btn")
      .addEventListener("click", () => {

        updateQuantity(
          item.id,
          item.quantity + 1
        );

      });


    element
      .querySelector(".remove-btn")
      .addEventListener("click", () => {

        removeItem(item.id);

      });


    cartItems.appendChild(element);

  });


  updateSummary(cart);

}


// =========================
// UPDATE QUANTITY
// =========================

async function updateQuantity(
  cartItemId,
  quantity
) {

  if (quantity < 1) {

    removeItem(cartItemId);

    return;

  }


  try {

    const response = await fetch(
      "http://localhost:8080/api/cart/" +
      cartItemId +
      "?studentEmail=" +
      encodeURIComponent(user.email),
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          quantity: quantity
        })
      }
    );


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.message || "Unable to update quantity."
      );

    }


    loadCart();


  } catch (error) {

    alert(error.message);

  }

}


// =========================
// REMOVE ITEM
// =========================

async function removeItem(cartItemId) {

  try {

    const response = await fetch(
      "http://localhost:8080/api/cart/" +
      cartItemId +
      "?studentEmail=" +
      encodeURIComponent(user.email),
      {
        method: "DELETE"
      }
    );


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.message || "Unable to remove item."
      );

    }


    loadCart();


  } catch (error) {

    alert(error.message);

  }

}


// =========================
// SUMMARY
// =========================

function updateSummary(cart) {

  const totalItems =
    cart.reduce(
      (total, item) =>
        total + Number(item.quantity),
      0
    );


  const subtotal =
    cart.reduce(
      (total, item) =>
        total + Number(item.subtotal),
      0
    );


  summaryItems.textContent =
    totalItems;


  summarySubtotal.textContent =
    "₹" + subtotal.toFixed(2);


  summaryTotal.textContent =
    "₹" + subtotal.toFixed(2);


  checkoutBtn.disabled =
    cart.length === 0;

}


// =========================
// CHECKOUT
// =========================

checkoutBtn.addEventListener(
  "click",
  async () => {

    if (checkoutBtn.disabled) {
      return;
    }

    const selectedPayment =
      document.querySelector(
        'input[name="paymentMethod"]:checked'
      );

    if (!selectedPayment) {
      alert("Please select a payment method.");
      return;
    }

    const paymentMethod =
      selectedPayment.value;

    const originalText =
      checkoutBtn.textContent;

    checkoutBtn.disabled = true;
    checkoutBtn.textContent =
      "Placing Order...";

    try {

      const response = await fetch(
        "http://localhost:8080/api/orders/checkout" +
        "?studentEmail=" +
        encodeURIComponent(user.email) +
        "&paymentMethod=" +
        encodeURIComponent(paymentMethod),
        {
          method: "POST"
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to place order."
        );

      }

      alert(
        "Order placed successfully!\n\n" +
        "Order ID: " +
        data.orderCode +
        "\nTotal: ₹" +
        Number(data.totalAmount).toFixed(2)
      );

      window.location.href =
        "dashboard.html";

    } catch (error) {

      console.error(error);

      alert(error.message);

      checkoutBtn.disabled = false;
      checkoutBtn.textContent =
        originalText;

    }

  }
);


// =========================
// HELPER
// =========================

function escapeHtml(value) {

  const div =
    document.createElement("div");

  div.textContent = value;

  return div.innerHTML;

}


// =========================
// START
// =========================

loadCart();