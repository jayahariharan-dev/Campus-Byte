const user = JSON.parse(
  localStorage.getItem("campusByteUser") || "null"
);

if (!user) {
  window.location.href = "index.html";
}


document.getElementById("logoutBtn").addEventListener("click", () => {

  localStorage.removeItem("campusByteUser");

  window.location.href = "index.html";

});


const grid = document.getElementById("menuGrid");
const message = document.getElementById("message");


async function loadMenu() {

  try {

    const response = await fetch(
      `${API_BASE_URL}/menu/today`
    );

    if (!response.ok) {
      throw new Error("Could not load today's menu.");
    }

    const items = await response.json();


    if (items.length === 0) {

      message.textContent =
        "No menu has been published for today yet.";

      grid.innerHTML = `
        <div class="empty">

          <h2>No menu yet 🍽️</h2>

          <p>
            The canteen has not published today's food.
          </p>

        </div>
      `;

      return;
    }


    message.textContent =
      `${items.length} item${items.length === 1 ? "" : "s"} available today.`;


    grid.innerHTML = items.map(item => `

      <article class="food-card">

        <div class="food-icon">
          ${getFoodIcon(item.category)}
        </div>

        <span class="category">
          ${escapeHtml(item.category || "Food")}
        </span>

        <h2>
          ${escapeHtml(item.name)}
        </h2>

        <p>
          ${escapeHtml(
            item.description ||
            "Freshly prepared campus food."
          )}
        </p>

        <div class="bottom">

          <span class="price">
            ₹${Number(item.price).toFixed(2)}
          </span>

          <span class="status">
            Available
          </span>

        </div>

      </article>

    `).join("");


  } catch (error) {

    message.textContent = error.message;

  }
}


function getFoodIcon(category) {

  const value = (category || "").toLowerCase();

  if (value.includes("drink")) {
    return "🥤";
  }

  if (value.includes("snack")) {
    return "🥪";
  }

  if (
    value.includes("rice") ||
    value.includes("meal")
  ) {
    return "🍚";
  }

  return "🍛";
}


function escapeHtml(value) {

  const element = document.createElement("div");

  element.textContent = value;

  return element.innerHTML;
}


loadMenu();