let allOrders = [];

const tabs =
    document.querySelectorAll(".order-tab");

const ordersTitle =
    document.getElementById("ordersTitle");

const ordersMessage =
    document.getElementById("ordersMessage");

const ordersList =
    document.getElementById("ordersList");

const pendingCount =
    document.getElementById("pendingCount");

const completedCount =
    document.getElementById("completedCount");

const overallCount =
    document.getElementById("overallCount");


// =========================
// LOAD ORDERS
// =========================

async function loadOrders() {

    ordersMessage.textContent =
        "Loading orders...";

    ordersList.innerHTML = "";

    try {

        const response = await fetch(
            "http://localhost:8080/api/orders/owner"
        );

        if (!response.ok) {
            throw new Error("Unable to load orders.");
        }

        allOrders = await response.json();

        updateCounts();

        showOrders("pending");

    } catch (error) {

        console.error(error);

        ordersMessage.textContent =
            "Unable to load orders.";

    }
}


// =========================
// COUNTS
// =========================

function updateCounts() {

    const today =
        new Date().toISOString().split("T")[0];

    const todayOrders =
        allOrders.filter(order =>
            order.orderTime &&
            order.orderTime.startsWith(today)
        );

    const pending =
        todayOrders.filter(order =>
            order.status !== "COMPLETED"
        );

    const completed =
        todayOrders.filter(order =>
            order.status === "COMPLETED"
        );

    pendingCount.textContent =
        pending.length;

    completedCount.textContent =
        completed.length;

    overallCount.textContent =
        allOrders.length;
}


// =========================
// SHOW ORDERS
// =========================

function showOrders(view) {

    ordersList.innerHTML = "";

    const today =
        new Date().toISOString().split("T")[0];

    let orders = [];

    if (view === "pending") {

        ordersTitle.textContent =
            "Today's Pending Orders";

        orders = allOrders.filter(order =>
            order.orderTime &&
            order.orderTime.startsWith(today) &&
            order.status !== "COMPLETED"
        );

    }

    else if (view === "completed") {

        ordersTitle.textContent =
            "Today's Completed Orders";

        orders = allOrders.filter(order =>
            order.orderTime &&
            order.orderTime.startsWith(today) &&
            order.status === "COMPLETED"
        );

    }

    else {

        ordersTitle.textContent =
            "Overall Orders";

        orders = allOrders;

    }


    if (orders.length === 0) {

        ordersMessage.textContent = "";

        ordersList.innerHTML = `
            <div class="empty-orders">

                <div class="empty-orders-icon">
                    📦
                </div>

                <h3>No orders found</h3>

                <p>
                    There are no orders in this section.
                </p>

            </div>
        `;

        return;
    }


    ordersMessage.textContent =
        orders.length +
        (orders.length === 1
            ? " order"
            : " orders");


    orders.forEach(order => {

        ordersList.appendChild(
            createOrderCard(order)
        );

    });

}


// =========================
// ORDER CARD
// =========================

function createOrderCard(order) {

    const card =
        document.createElement("div");

    card.className = "order-card";

    const completed =
        order.status === "COMPLETED";

    const items =
        order.items || [];

    const itemHTML =
        items.map(item => `
            <div class="order-item">

                <span>
                    ${escapeHtml(item.foodName)}
                    × ${item.quantity}
                </span>

                <strong>
                    ₹${Number(
                        item.price * item.quantity
                    ).toFixed(2)}
                </strong>

            </div>
        `).join("");


    const time =
        order.orderTime
            ? new Date(order.orderTime)
                .toLocaleString()
            : "--";


    card.innerHTML = `

        <div class="order-card-header">

            <div>

                <div class="order-code">
                    ${escapeHtml(order.orderCode)}
                </div>

                <div class="order-time">
                    ${time}
                </div>

            </div>

            <span class="order-status ${
                completed
                    ? "completed"
                    : "pending"
            }">

                ${
                    completed
                        ? "COMPLETED"
                        : order.status
                }

            </span>

        </div>


        <div class="order-student">

            <strong>
                👤 ${
                    escapeHtml(
                        order.studentName || "Student"
                    )
                }
            </strong>

            <span>
                ${
                    escapeHtml(
                        order.studentEmail || ""
                    )
                }
            </span>

        </div>


        <div class="order-items">

            ${itemHTML}

        </div>


        <div class="order-footer">

            <span class="${
                order.paymentMethod === "ONLINE"
                    ? "payment-online"
                    : "payment-cash"
            }">

                ${
                    order.paymentMethod === "ONLINE"
                        ? "💳 ONLINE"
                        : "💵 CASH ON PICKUP"
                }

            </span>

            <strong class="order-total">
                ₹${Number(
                    order.totalAmount
                ).toFixed(2)}
            </strong>

        </div>

    `;

    return card;
}


// =========================
// TABS
// =========================

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(item =>
            item.classList.remove("active")
        );

        tab.classList.add("active");

        showOrders(
            tab.dataset.view
        );

    });

});


// =========================
// REFRESH
// =========================

document
    .getElementById("refreshOrders")
    .addEventListener(
        "click",
        loadOrders
    );


// =========================
// LOGOUT
// =========================

document
    .getElementById("logout")
    .addEventListener("click", () => {

        localStorage.removeItem(
            "campusByteUser"
        );

        window.location.href =
            "index.html";

    });


// =========================
// HELPER
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