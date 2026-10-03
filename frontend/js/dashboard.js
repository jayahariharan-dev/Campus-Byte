const user = JSON.parse(
  localStorage.getItem("campusByteUser") || "null"
);


// =========================
// PROTECT DASHBOARD
// =========================

if (!user) {
  window.location.href = "index.html";
}


// =========================
// USER DETAILS
// =========================

const firstName = user.name
  ? user.name.split(" ")[0]
  : "Student";

document.getElementById("welcomeName").textContent =
  user.name || "Student";

document.getElementById("heroName").textContent =
  firstName;

document.getElementById("userAvatar").textContent =
  firstName.charAt(0).toUpperCase();


// =========================
// LOGOUT
// =========================

document.getElementById("logoutBtn").addEventListener("click", () => {

  localStorage.removeItem("campusByteUser");

  window.location.href = "index.html";

});


// =========================
// TODAY'S MENU
// =========================

const menuGrid = document.getElementById("menuGrid");
const menuStatus = document.getElementById("menuStatus");
const menuCount = document.getElementById("menuCount");


// Load today's menu
async function loadTodayMenu() {

  menuStatus.textContent = "Loading today's menu...";
  menuGrid.innerHTML = "";

  try {

    const response = await fetch(
      "http://localhost:8080/api/menu/today"
    );

    if (!response.ok) {
      throw new Error("Unable to load menu");
    }

    const menu = await response.json();

    menuCount.textContent =
      menu.length +
      (menu.length === 1 ? " Item" : " Items");


    if (menu.length === 0) {

      menuStatus.textContent =
        "No food has been published for today yet.";

      return;
    }


    menuStatus.textContent =
      menu.length +
      " food item" +
      (menu.length === 1 ? "" : "s") +
      " available today";


    menu.forEach(item => {

      const card = document.createElement("div");

      card.className = "menu-card";


      const available =
        item.availableQuantity == null ||
        item.availableQuantity > 0;


      card.innerHTML = `
        <div class="menu-card-top">

          <div class="menu-food-icon">
            🍛
          </div>

          <span class="menu-category">
            ${escapeHtml(item.category || "Food")}
          </span>

        </div>

        <h3>
          ${escapeHtml(item.name)}
        </h3>

        <p class="menu-description">
          ${escapeHtml(
            item.description ||
            "Freshly prepared for campus."
          )}
        </p>

        <div class="menu-price">
          ₹${Number(item.price).toFixed(2)}
        </div>

        <div class="menu-details">

          <span>
            📦 ${
              item.availableQuantity == null
                ? "Available"
                : item.availableQuantity + " available"
            }
          </span>

          <span>
            ⏰ Pickup:
            ${formatTime(item.pickupStart)}
            -
            ${formatTime(item.pickupEnd)}
          </span>

        </div>

        <div class="menu-footer">

          <span class="${available ? "available" : "sold-out"}">
            ${available ? "● Available" : "● Sold Out"}
          </span>

          <button
            class="add-cart-btn"
            ${available ? "" : "disabled"}
            data-menu-id="${item.id}"
          >
            ${available ? "Add to Cart" : "Unavailable"}
          </button>

        </div>
      `;


      const addButton =
        card.querySelector(".add-cart-btn");


      if (addButton && available) {

        addButton.addEventListener("click", () => {

          addToCart(
            item.id,
            addButton
          );

        });

      }


      menuGrid.appendChild(card);

    });

  } catch (error) {

    console.error(error);

    menuCount.textContent = "Unavailable";

    menuStatus.textContent =
      "Unable to connect to the menu service.";

  }

}


// =========================
// ADD TO CART
// =========================

async function addToCart(menuId, button) {

  button.disabled = true;
  button.textContent = "Adding...";


  try {

    const response = await fetch(
      "http://localhost:8080/api/cart?studentEmail=" +
      encodeURIComponent(user.email),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          dailyMenuId: menuId,
          quantity: 1
        })
      }
    );


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.message || "Could not add item."
      );

    }


    button.textContent = "✓ Added";

    await loadCartCount();


    setTimeout(() => {

      button.disabled = false;
      button.textContent = "Add to Cart";

    }, 1200);


  } catch (error) {

    console.error(error);

    alert(error.message);

    button.disabled = false;
    button.textContent = "Add to Cart";

  }

}


// =========================
// CART COUNT
// =========================

async function loadCartCount() {

  const cartStat =
    document.querySelector(
      ".stats-grid .stat-card:nth-child(2) strong"
    );


  try {

    const response = await fetch(
      "http://localhost:8080/api/cart?studentEmail=" +
      encodeURIComponent(user.email)
    );


    if (!response.ok) {
      throw new Error("Unable to load cart");
    }


    const cart = await response.json();


    const totalQuantity =
      cart.reduce(
        (total, item) =>
          total + Number(item.quantity),
        0
      );


    if (cartStat) {

      cartStat.textContent =
        totalQuantity +
        (totalQuantity === 1 ? " Item" : " Items");

    }

  } catch (error) {

    console.error(error);

  }

}


// =========================
// HELPERS
// =========================

function formatTime(time) {

  if (!time) {
    return "--";
  }

  return time.substring(0, 5);
}


function escapeHtml(value) {

  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
}


// =========================
// MENU NAVIGATION
// =========================

document.getElementById("menuBtn").addEventListener("click", () => {

  document.getElementById("todayMenu").scrollIntoView({
    behavior: "smooth"
  });

});


document.getElementById("menuAction").addEventListener("click", () => {

  document.getElementById("todayMenu").scrollIntoView({
    behavior: "smooth"
  });

});


document.getElementById("refreshMenuBtn").addEventListener("click", () => {

  loadTodayMenu();
  loadCartCount();

});


// =========================
// MY CART
// =========================

const cartAction =
  document.querySelector(
    ".action-grid .action-card:nth-child(2)"
  );


if (cartAction) {

  cartAction.classList.remove("coming-soon");

  cartAction.addEventListener("click", () => {

    window.location.href = "cart.html";

  });

}


// =========================
// OTHER COMING SOON FEATURES
// =========================

document.querySelectorAll(".coming-soon").forEach((element) => {

  element.addEventListener("click", (event) => {

    event.preventDefault();

    alert(
      "This feature will be available in the next phase."
    );

  });

});


// =========================
// MY ORDERS
// =========================

const ordersAction =
  document.getElementById("ordersAction");

if (ordersAction) {

  ordersAction.addEventListener("click", () => {

    window.location.href = "orders.html";

  });

}


// =========================
// MY ORDERS / PICKUP QR
// =========================

const pickupQrAction = document.getElementById("pickupQrAction");

if (pickupQrAction) {
    pickupQrAction.addEventListener("click", () => {
        window.location.href = "orders.html";
    });
}


// =========================
// START
// =========================

loadTodayMenu();
loadCartCount();