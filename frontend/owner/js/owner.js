const user = JSON.parse(
  localStorage.getItem("campusByteUser") || "null"
);

if (!user || user.role !== "CANTEEN_OWNER") {
  window.location.href = "../index.html";
}


document.getElementById("ownerName").textContent =
  user.name || "Canteen Owner";


document.getElementById("logout").onclick = () => {

  localStorage.removeItem("campusByteUser");

  window.location.href = "../index.html";

};


const foodSelect =
  document.getElementById("foodSelect");

const foodMessage =
  document.getElementById("foodMessage");

const menuMessage =
  document.getElementById("menuMessage");


// =========================
// LOAD FOOD
// =========================

async function loadFood() {

  try {

    const response = await fetch(
      `${API_BASE_URL}/menu/food?ownerEmail=${encodeURIComponent(user.email)}`
    );

    if (!response.ok) {
      throw new Error("Could not load food items.");
    }

    const items = await response.json();

    foodSelect.innerHTML =
      '<option value="">Choose food</option>' +

      items.map(item => `
        <option value="${item.id}">
          ${escapeHtml(item.name)}
        </option>
      `).join("");

  } catch (error) {

    foodMessage.textContent =
      error.message;

  }
}


// =========================
// LOAD PUBLISHED MENU
// =========================

async function loadPublished() {

  const box =
    document.getElementById("published");

  try {

    const response = await fetch(
      `${API_BASE_URL}/menu/today/manage?ownerEmail=${encodeURIComponent(user.email)}`
    );

    if (!response.ok) {
      throw new Error("Could not load today's menu.");
    }

    const items = await response.json();


    if (!items.length) {

      box.innerHTML =
        '<p class="message">Nothing published for today yet.</p>';

      return;
    }


    box.innerHTML = items.map(item => `

      <div class="item">

        <span class="badge">
          ${item.available ? "AVAILABLE" : "HIDDEN"}
        </span>

        <h3>
          ${escapeHtml(item.foodItem.name)}
        </h3>

        <p>
          ${escapeHtml(
      item.foodItem.category || "Food"
    )}
        </p>

        <strong>
          ₹${Number(item.price).toFixed(2)}
        </strong>

      </div>

    `).join("");


  } catch (error) {

    box.innerHTML =
      `<p class="message">${error.message}</p>`;

  }
}


// =========================
// ADD FOOD
// =========================

document
  .getElementById("foodForm")
  .addEventListener("submit", async event => {

    event.preventDefault();

    foodMessage.textContent = "Adding...";


    try {

      const response = await fetch(
        `${API_BASE_URL}/menu/food?ownerEmail=${encodeURIComponent(user.email)}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            name: document
              .getElementById("foodName")
              .value
              .trim(),

            category:
              document.getElementById("category").value,

            description:
              document.getElementById("description")
                .value
                .trim()

          })
        }
      );


      const data =
        await response.json().catch(() => ({}));


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Could not add food item."
        );

      }


      foodMessage.textContent =
        "Food item added ✓";


      event.target.reset();

      await loadFood();


    } catch (error) {

      foodMessage.textContent =
        error.message;

    }

  });


// =========================
// PUBLISH MENU
// =========================

document
  .getElementById("menuForm")
  .addEventListener("submit", async event => {

    event.preventDefault();

    menuMessage.textContent = "Publishing...";


    try {

      const response = await fetch(
        `${API_BASE_URL}/menu/today?ownerEmail=${encodeURIComponent(user.email)}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            foodItemId:
              Number(foodSelect.value),

            price:
              Number(
                document.getElementById("price").value
              ),

            available: true,

            availableQuantity:
              document.getElementById("quantity").value
                ? Number(
                  document.getElementById("quantity").value
                )
                : null,

            orderingDeadline:
              document.getElementById("deadline").value ||
              null,

            pickupStart:
              document.getElementById("pickupStart").value ||
              null,

            pickupEnd:
              document.getElementById("pickupEnd").value ||
              null

          })
        }
      );


      const data =
        await response.json().catch(() => ({}));


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Could not publish menu item."
        );

      }


      menuMessage.textContent =
        "Published to today's menu ✓";


      await loadPublished();


    } catch (error) {

      menuMessage.textContent =
        error.message;

    }

  });


// =========================
// REFRESH MENU
// =========================

document
  .getElementById("refresh")
  .onclick = loadPublished;







// =========================
// HELPERS
// =========================

function formatOrderTime(time) {

  if (!time) {
    return "--";
  }

  const date =
    new Date(time);

  if (isNaN(date.getTime())) {
    return time;
  }

  return date.toLocaleString();
}


function escapeHtml(value) {

  const element =
    document.createElement("div");

  element.textContent =
    value ?? "";

  return element.innerHTML;
}


// =========================
// QR SCANNER
// =========================

async function startQrScanner() {

  if (scannerRunning) {
    return;
  }

  scannerMessage.textContent =
    "Starting camera...";

  startScannerBtn.disabled = true;

  try {

    qrScanner = new Html5Qrcode("qr-reader");

    await qrScanner.start(
      { facingMode: "environment" },

      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250
        }
      },

      async (decodedText) => {

        await handleScannedQr(decodedText);

      },

      () => {
        // Ignore frames where no QR is detected
      }
    );

    scannerRunning = true;

    document
      .getElementById("qr-reader")
      .classList.add("scanner-active");

    // =========================
    // UPDATE SCANNER BUTTONS
    // =========================

    startScannerBtn.style.display = "none";
    startScannerBtn.disabled = false;

    stopScannerBtn.style.display = "inline-block";

    scannerMessage.textContent =
      "Camera ready. Scan a pickup QR.";

  } catch (error) {

    console.error(error);

    scannerMessage.textContent =
      "Unable to access camera. Please allow camera permission.";

    startScannerBtn.style.display = "inline-block";
    startScannerBtn.disabled = false;

    stopScannerBtn.style.display = "none";
  }

}


// =========================
// HANDLE SCANNED QR
// =========================

async function handleScannedQr(decodedText) {

  if (!scannerRunning) {
    return;
  }

  scannerMessage.textContent =
    "QR detected. Verifying...";


  try {

    const qrData =
      JSON.parse(decodedText);


    if (!qrData.token) {

      throw new Error(
        "Invalid Campus Byte QR code."
      );

    }


    // Stop scanning while verifying
    await stopQrScanner();


    const response = await fetch(
      `${API_BASE_URL}/owner/orders/verify-qr?ownerEmail=${encodeURIComponent(user.email)}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          qrToken: qrData.token
        })
      }
    );


    const data =
      await response.json().catch(() => ({}));


    if (!response.ok) {

      throw new Error(
        data.message ||
        "QR verification failed."
      );

    }


    showVerifiedOrder(data);


  } catch (error) {

    console.error(error);

    scannerMessage.textContent =
      error.message;

    prepareScanAgain(error.message);

  }

}


// =========================
// SHOW VERIFIED ORDER
// =========================

function showVerifiedOrder(order) {

  scannerMessage.textContent =
    "✓ QR verified. Review the order before completing pickup.";


  const itemsHtml =
    order.items.map(item => `
      <div class="verified-item">

        <div class="verified-item-info">
          <span class="verified-food-name">
            ${escapeHtml(item.foodName)}
          </span>

          <span class="verified-food-qty">
            × ${item.quantity}
          </span>
        </div>

        <strong>
          ₹${(
        Number(item.price) *
        Number(item.quantity)
      ).toFixed(2)}
        </strong>

      </div>
    `).join("");


  scanResult.style.display = "block";

  scanResult.innerHTML = `

    <div class="verified-order">

      <div class="verified-success-banner">

        <div class="verified-check">
          ✓
        </div>

        <div>
          <strong>
            QR Verified
          </strong>

          <span>
            Valid pickup code
          </span>
        </div>

      </div>


      <div class="verified-header">

        <div>

          <small>
            ORDER
          </small>

          <h3>
            ${escapeHtml(order.orderCode)}
          </h3>

        </div>

        <span class="verified-badge">
          VALID
        </span>

      </div>


      <div class="verified-student">

        <span class="verified-label">
          STUDENT
        </span>

        <strong>
          👤 ${escapeHtml(order.studentName)}
        </strong>

        <span>
          ${escapeHtml(order.studentEmail)}
        </span>

      </div>

      <div class="verified-payment">

  <span>
    💳 Payment
  </span>

  <strong class="${order.paymentMethod === "ONLINE"
      ? "payment-online"
      : "payment-cash"
    }">
  ${order.paymentMethod === "ONLINE"
      ? "✓ PAID ONLINE"
      : "💵 CASH ON PICKUP"
    }
</strong>

</div>


      <div class="verified-items">

        <div class="verified-items-title">
          ORDER ITEMS
        </div>

        ${itemsHtml}

      </div>


      <div class="verified-total">

        <span>
          Total Amount
        </span>

        <strong>
          ₹${Number(order.totalAmount).toFixed(2)}
        </strong>

      </div>


      <button
        class="complete-order-btn"
        id="completeOrderBtn"
        data-order-id="${order.id}"
      >

        <span>✓</span>
        Complete Order

      </button>


      <p class="complete-warning">
        Completing this order will permanently disable its pickup QR.
      </p>

    </div>

  `;


  document
    .getElementById("completeOrderBtn")
    .addEventListener(
      "click",
      () => completeOrder(order.id)
    );
}


// =========================
// COMPLETE ORDER
// =========================

async function completeOrder(orderId) {

  const button =
    document.getElementById("completeOrderBtn");


  button.disabled = true;

  button.textContent =
    "Completing...";


  try {

    const response = await fetch(
      `${API_BASE_URL}/owner/orders/complete?ownerEmail=${encodeURIComponent(user.email)}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          orderId: orderId
        })
      }
    );


    const data =
      await response.json().catch(() => ({}));


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Could not complete order."
      );

    }


    scanResult.innerHTML = `

  <div class="scan-success">

    <div class="success-icon">
      ✓
    </div>

    <h3>
      Order Completed
    </h3>

    <p>
      ${escapeHtml(data.orderCode)}
    </p>

    <small>
      Pickup QR has been permanently disabled.
    </small>

  </div>

`;

    document
      .getElementById("scanAgainBtn")
      .addEventListener(
        "click",
        () => {

          scanResult.style.display = "none";

          startQrScanner();

        }
      );



  } catch (error) {

    console.error(error);

    button.disabled = false;

    button.textContent =
      "✓ Complete Order";

    scannerMessage.textContent =
      error.message;

  }

}


// =========================
// STOP QR SCANNER
// =========================

async function stopQrScanner() {

  if (!qrScanner || !scannerRunning) {
    return;
  }

  try {

    await qrScanner.stop();

    qrScanner.clear();

  } catch (error) {

    console.error(
      "Could not stop QR scanner:",
      error
    );

  }

  scannerRunning = false;

  document
    .getElementById("qr-reader")
    .classList.remove("scanner-active");

  startScannerBtn.style.display = "inline-block";
  startScannerBtn.disabled = false;

  stopScannerBtn.style.display = "none";
}


function prepareScanAgain(message) {

  scanResult.innerHTML = `

    <div class="scan-error">
      ❌ ${escapeHtml(message)}
    </div>

  `;

  scanResult.style.display = "block";

  startScannerBtn.style.display = "inline-block";
  startScannerBtn.disabled = false;
}


// =========================
// SCANNER BUTTONS
// =========================

startScannerBtn.onclick = () => {
  startQrScanner();
};

stopScannerBtn.onclick = async () => {
  await stopQrScanner();

  scannerMessage.textContent =
    "Scanner is currently off.";
};


// =========================
// START
// =========================

loadFood();
loadPublished();