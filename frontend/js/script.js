const authForm = document.getElementById("authForm");
const tabs = document.querySelectorAll(".tab");
const tabsContainer = document.querySelector(".tabs");
const nameField = document.getElementById("nameField");
const enrollField = document.getElementById("enrollField");
const collegeField = document.getElementById("collegeField");
const nameInput = document.getElementById("name");
const enrollInput = document.getElementById("enrollNo");
const collegeInput = document.getElementById("college");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const nameError = document.getElementById("nameError");
const enrollError = document.getElementById("enrollError");
const collegeError = document.getElementById("collegeError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const passwordToggle = document.getElementById("passwordToggle");
const passwordStrength = document.getElementById("passwordStrength");
const strengthText = document.getElementById("strengthText");
const loginOptions = document.getElementById("loginOptions");
const terms = document.getElementById("terms");
const termsCheck = document.getElementById("termsCheck");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const welcomeText = document.getElementById("welcomeText");
const submitText = document.getElementById("submitText");
const switchText = document.getElementById("switchText");
const successMessage = document.getElementById("successMessage");
const successText = document.getElementById("successText");
const forgotPassword = document.getElementById("forgotPassword");
const serverMessage = document.getElementById("serverMessage");

let currentMode = "login";

function setMode(mode) {
  currentMode = mode;
  const isSignup = mode === "signup";

  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.mode === mode));
  tabsContainer.classList.toggle("signup", isSignup);
  nameField.classList.toggle("hidden", !isSignup);
  enrollField.classList.toggle("hidden", !isSignup);
  collegeField.classList.toggle("hidden", !isSignup);
  passwordStrength.classList.toggle("hidden", !isSignup);
  loginOptions.classList.toggle("hidden", isSignup);
  terms.classList.toggle("hidden", !isSignup);

  if (isSignup) {
    formTitle.textContent = "Create your account";
    formSubtitle.textContent = "Join your campus food community today.";
    welcomeText.textContent = "WELCOME TO CAMPUS BYTE";
    submitText.textContent = "Create account";
    switchText.innerHTML = `Already have an account? <button type="button" id="switchBtn">Login instead</button>`;
  } else {
    formTitle.textContent = "Login to your account";
    formSubtitle.textContent = "Your next meal is just a few taps away.";
    welcomeText.textContent = "WELCOME BACK";
    submitText.textContent = "Login";
    switchText.innerHTML = `New to Campus Byte? <button type="button" id="switchBtn">Create an account</button>`;
  }

  document.getElementById("switchBtn").addEventListener("click", () => setMode(isSignup ? "login" : "signup"));
  clearErrors();
  hideSuccess();
  hideServerMessage();
}

tabs.forEach(tab => tab.addEventListener("click", () => setMode(tab.dataset.mode)));

passwordToggle.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  passwordToggle.textContent = isPassword ? "Hide" : "Show";
});

passwordInput.addEventListener("input", () => {
  if (currentMode !== "signup") return;
  const password = passwordInput.value;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  passwordStrength.dataset.level = score;
  strengthText.textContent = ({ 0: "Enter a password", 1: "Weak password", 2: "Fair password", 3: "Good password", 4: "Strong password" })[score];
});

function showError(input, errorElement, message) {
  input.parentElement.classList.add("invalid");
  errorElement.textContent = message;
}

function clearFieldError(input, errorElement) {
  input.parentElement.classList.remove("invalid");
  errorElement.textContent = "";
}

function clearErrors() {
  clearFieldError(nameInput, nameError);
  clearFieldError(enrollInput, enrollError);
  clearFieldError(collegeInput, collegeError);
  clearFieldError(emailInput, emailError);
  clearFieldError(passwordInput, passwordError);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
  let valid = true;
  clearErrors();

  if (currentMode === "signup") {
    if (nameInput.value.trim().length < 2) {
      showError(nameInput, nameError, "Please enter your name.");
      valid = false;
    }
    if (enrollInput.value.trim().length < 3) {
      showError(enrollInput, enrollError, "Enter a valid enrollment number.");
      valid = false;
    }
    if (!collegeInput.value) {
      showError(collegeInput, collegeError, "Please select your college.");
      valid = false;
    }
  }

  const email = emailInput.value.trim();
  if (!email) {
    showError(emailInput, emailError, "Email is required.");
    valid = false;
  } else if (!isValidEmail(email)) {
    showError(emailInput, emailError, "Enter a valid college email.");
    valid = false;
  }

  const password = passwordInput.value;
  if (!password) {
    showError(passwordInput, passwordError, "Password is required.");
    valid = false;
  } else if (currentMode === "signup" && password.length < 8) {
    showError(passwordInput, passwordError, "Password must be at least 8 characters.");
    valid = false;
  }

  if (currentMode === "signup" && !termsCheck.checked) {
    showError(passwordInput, passwordError, "Please accept the terms to continue.");
    valid = false;
  }

  return valid;
}

async function submitAuth() {
  const payload = currentMode === "signup"
    ? {
      name: nameInput.value.trim(),
      enrollmentNumber: enrollInput.value.trim(),
      college: collegeInput.value,
      email: emailInput.value.trim(),
      password: passwordInput.value
    }
    : {
      email: emailInput.value.trim(),
      password: passwordInput.value
    };

  const endpoint = currentMode === "signup" ? "/auth/signup" : "/auth/login";

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || data.message || "Something went wrong. Please try again.");
    }

    localStorage.setItem("campusByteUser", JSON.stringify(data));

    if (currentMode === "signup") {
      successText.textContent = "Account created! Redirecting to your dashboard...";
      successMessage.classList.remove("hidden");
      setTimeout(() => window.location.href = "dashboard.html", 700);
    } else {
      window.location.href =
        data.role === "CANTEEN_OWNER"
          ? "owner/index.html"
          : "dashboard.html";
    }
  } catch (error) {
    serverMessage.textContent = error.message || "Could not connect to the Campus Byte server.";
    serverMessage.classList.remove("hidden");
  }
}

authForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!validateForm()) return;

  const submitButton = document.getElementById("submitBtn");
  submitButton.disabled = true;
  submitText.textContent = currentMode === "login" ? "Signing in..." : "Creating...";
  hideServerMessage();

  await submitAuth();

  submitButton.disabled = false;
  submitText.textContent = currentMode === "login" ? "Login" : "Create account";
});

forgotPassword.addEventListener("click", event => {
  event.preventDefault();
  successText.textContent = "Password reset will be added in a later phase.";
  successMessage.classList.remove("hidden");
});

[nameInput, enrollInput, emailInput, passwordInput].forEach(input => input.addEventListener("input", () => {
  const map = {
    name: nameError,
    enrollNo: enrollError,
    email: emailError,
    password: passwordError
  };
  clearFieldError(input, map[input.id]);
  hideServerMessage();
}));
collegeInput.addEventListener("change", () => clearFieldError(collegeInput, collegeError));

function hideSuccess() { successMessage.classList.add("hidden"); }
function hideServerMessage() { serverMessage.classList.add("hidden"); }

setMode("login");
