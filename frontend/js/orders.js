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

const ordersStatus =
  document.getElementById("ordersStatus");

const ordersList =
  document.getElementById("ordersList");


// =========================
// LOAD ORDERS
// =========================

async function loadOrders() {

  ordersStatus.textContent =
    "Loading your orders...";

  ordersList.innerHTML = "";


  try {

    const response = await fetch(
      "http://localhost:8080/api/orders?studentEmail=" +
      encodeURIComponent(user.email)
    );


    if (!response.ok) {
      throw new Error("Unable to load orders.");
    }


    const orders = await response.json();

    renderOrders(orders);


  } catch (error) {

    console.error(error);

    ordersStatus.textContent =
      "Unable to connect to the order service.";

  }

}


// =========================
// RENDER ORDERS
// =========================

function renderOrders(orders) {

  ordersList.innerHTML = "";


  if (orders.length === 0) {

    ordersStatus.textContent = "";

    ordersList.innerHTML = `

      <div class="empty-orders">

        <div class="empty-icon">
          📦
        </div>

        <h2>No orders yet</h2>

        <p>
          Your completed checkouts will appear here.
        </p>

        <a href="dashboard.html#todayMenu">
          Browse Today's Menu
        </a>

      </div>

    `;

    return;
  }


  ordersStatus.textContent =
    orders.length +
    (orders.length === 1 ? " order" : " orders") +
    " found";


  orders.forEach(order => {

    const card = document.createElement("div");

    card.className = "order-card";


    let itemsHtml = "";


    order.items.forEach(item => {

      const subtotal =
        Number(item.price) *
        Number(item.quantity);


      itemsHtml += `

        <div class="order-item">

          <div>

            <span class="item-name">
              ${escapeHtml(item.foodName)}
            </span>

            <span class="item-quantity">
              × ${item.quantity}
            </span>

          </div>

          <span class="item-price">
            ₹${subtotal.toFixed(2)}
          </span>

        </div>

      `;

    });


    const qrAvailable =
      order.qrActive && order.qrToken;


    card.innerHTML = `

      <div class="order-top">

        <div>

          <div class="order-number">
            ${escapeHtml(order.orderCode)}
          </div>

          <div class="order-time">
            ${formatDate(order.orderTime)}
          </div>

        </div>


        <span class="order-status">
          ${escapeHtml(order.status)}
        </span>

      </div>


      <div class="order-items">

        ${itemsHtml}

      </div>


      <div class="order-bottom">

        <div class="payment">

          Payment:
          <strong>
            ${escapeHtml(order.paymentMethod)}
          </strong>

        </div>


        <div class="total">

          ₹${Number(order.totalAmount).toFixed(2)}

        </div>

      </div>


      <div class="qr-section">

        ${
          qrAvailable

          ? `

            <button
              class="qr-btn"
              type="button"
            >
              📱 Show Pickup QR
            </button>

            <div class="qr-container">

              <div class="qr-title">
                Pickup QR
              </div>

              <div class="qr-box"></div>

              <div class="qr-order">
                ${escapeHtml(order.orderCode)}
              </div>

              <div class="qr-amount">
                ₹${Number(order.totalAmount).toFixed(2)}
              </div>

              <p class="qr-help">
                Show this QR to the canteen counter
                when collecting your order.
              </p>

              <button
                class="qr-close"
                type="button"
              >
                Hide QR
              </button>

            </div>

          `

          : `

            <div class="qr-disabled">

              <span>✓</span>

              <div>

                <strong>
                  Order delivered
                </strong>

                <small>
                  Pickup QR is no longer valid.
                </small>

              </div>

            </div>

          `
        }

      </div>

    `;


    ordersList.appendChild(card);


    if (qrAvailable) {

      const qrButton =
        card.querySelector(".qr-btn");

      const container =
        card.querySelector(".qr-container");

      const qrBox =
        card.querySelector(".qr-box");

      const closeButton =
        card.querySelector(".qr-close");


      qrButton.addEventListener("click", () => {

        showOrderQR(
          order,
          qrButton,
          container,
          qrBox
        );

      });


      closeButton.addEventListener("click", () => {

        container.classList.remove("show");

        qrButton.textContent =
          "📱 Show Pickup QR";

      });

    }

  });

}


// =========================
// SHOW QR
// =========================

function showOrderQR(
  order,
  button,
  container,
  qrBox
) {

  qrBox.innerHTML = "";


  const qrData = JSON.stringify({
    token: order.qrToken
  });


  new QRCode(qrBox, {

    text: qrData,

    width: 250,
    height: 250,

    colorDark: "#171717",
    colorLight: "#ffffff",

    correctLevel:
      QRCode.CorrectLevel.H

  });


  container.classList.add("show");

  button.textContent =
    "✓ QR Displayed";

}


// =========================
// FORMAT DATE
// =========================

function formatDate(value) {

  if (!value) {
    return "--";
  }


  const date = new Date(value);


  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  );

}


// =========================
// ESCAPE HTML
// =========================

function escapeHtml(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value ?? "";

  return div.innerHTML;

}


// =========================
// START
// =========================

loadOrders();