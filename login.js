// ========================================
// NEXUS STOCK ANALYZER LOGIN
// ========================================

// Default account
// This account is NEVER stored in stockUsers.

const DEFAULT_USER = {
  name: "Administrator",
  username: "admin",
  password: "admin123",
  type: "user"
};


// ========================================
// GET ELEMENTS
// ========================================

const loginForm = document.getElementById("loginForm");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const guestBtn = document.getElementById("guestBtn");
const createAccountBtn = document.getElementById("createAccountBtn");

const loginMessage = document.getElementById("loginMessage");

const registerModal = document.getElementById("registerModal");
const closeRegister = document.getElementById("closeRegister");

const newName = document.getElementById("newName");
const newUsername = document.getElementById("newUsername");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");

const registerBtn = document.getElementById("registerBtn");
const registerMessage = document.getElementById("registerMessage");


// ========================================
// GET CREATED USERS
// ========================================

function getUsers() {

  const data = localStorage.getItem("stockUsers");

  if (!data) {
    return [];
  }

  try {
    const users = JSON.parse(data);

    if (Array.isArray(users)) {
      return users;
    }

    return [];

  } catch (error) {

    return [];
  }
}


// ========================================
// SAVE CREATED USERS
// ========================================

function saveUsers(users) {

  localStorage.setItem(
    "stockUsers",
    JSON.stringify(users)
  );
}


// ========================================
// SHOW LOGIN MESSAGE
// ========================================

function showLoginMessage(text, type) {

  loginMessage.textContent = text;

  loginMessage.className =
    "message " + type;
}


// ========================================
// LOGIN
// ========================================

function login() {

  const username =
    usernameInput.value.trim();

  const password =
    passwordInput.value;


  if (!username || !password) {

    showLoginMessage(
      "ENTER USERNAME AND PASSWORD",
      "error"
    );

    return;
  }


  // ------------------------------------
  // CHECK DEFAULT ADMIN
  // ------------------------------------

  if (
    username.toLowerCase() === "admin" &&
    password === "admin123"
  ) {

    localStorage.setItem(
      "loggedInUser",
      JSON.stringify(DEFAULT_USER)
    );

    localStorage.setItem(
      "userMode",
      "user"
    );

    window.location.href =
      "dashboard.html";

    return;
  }


  // ------------------------------------
  // CHECK CREATED USERS
  // ------------------------------------

  const users = getUsers();

  const foundUser = users.find(function(user) {

    return (
      user.username.toLowerCase() ===
      username.toLowerCase() &&
      user.password === password
    );

  });


  if (foundUser) {

    localStorage.setItem(
      "loggedInUser",
      JSON.stringify(foundUser)
    );

    localStorage.setItem(
      "userMode",
      "user"
    );

    window.location.href =
      "dashboard.html";

    return;
  }


  // ------------------------------------
  // LOGIN FAILED
  // ------------------------------------

  showLoginMessage(
    "INVALID USERNAME OR PASSWORD",
    "error"
  );

  passwordInput.value = "";
}


// ========================================
// GUEST LOGIN
// ========================================

function guestLogin() {

  const guestUser = {

    name: "Guest",
    username: "guest",
    type: "guest"

  };


  localStorage.setItem(
    "loggedInUser",
    JSON.stringify(guestUser)
  );

  localStorage.setItem(
    "userMode",
    "guest"
  );


  window.location.href =
    "dashboard.html";
}


// ========================================
// OPEN CREATE ACCOUNT
// ========================================

function openRegister() {

  registerModal.classList.remove("hidden");

  newName.focus();
}


// ========================================
// CLOSE CREATE ACCOUNT
// ========================================

function closeRegisterModal() {

  registerModal.classList.add("hidden");

  newName.value = "";
  newUsername.value = "";
  newPassword.value = "";
  confirmPassword.value = "";

  registerMessage.textContent = "";
}


// ========================================
// CREATE ACCOUNT
// ========================================

function createAccount() {

  const name =
    newName.value.trim();

  const username =
    newUsername.value.trim();

  const password =
    newPassword.value;

  const confirm =
    confirmPassword.value;


  // Name
  if (!name) {

    registerMessage.textContent =
      "ENTER YOUR NAME";

    registerMessage.className =
      "message error";

    return;
  }


  // Username
  if (!username) {

    registerMessage.textContent =
      "ENTER A USERNAME";

    registerMessage.className =
      "message error";

    return;
  }


  // Username length
  if (username.length < 3) {

    registerMessage.textContent =
      "USERNAME MUST BE AT LEAST 3 CHARACTERS";

    registerMessage.className =
      "message error";

    return;
  }


  // Admin is reserved
  if (
    username.toLowerCase() === "admin"
  ) {

    registerMessage.textContent =
      "ADMIN USERNAME IS RESERVED";

    registerMessage.className =
      "message error";

    return;
  }


  // Password
  if (password.length < 4) {

    registerMessage.textContent =
      "PASSWORD MUST BE AT LEAST 4 CHARACTERS";

    registerMessage.className =
      "message error";

    return;
  }


  // Confirm password
  if (password !== confirm) {

    registerMessage.textContent =
      "PASSWORDS DO NOT MATCH";

    registerMessage.className =
      "message error";

    return;
  }


  // Get existing users
  const users = getUsers();


  // Check duplicate username
  const exists = users.some(function(user) {

    return (
      user.username.toLowerCase() ===
      username.toLowerCase()
    );

  });


  if (exists) {

    registerMessage.textContent =
      "USERNAME ALREADY EXISTS";

    registerMessage.className =
      "message error";

    return;
  }


  // Create user
  const newUser = {

    name: name,
    username: username,
    password: password,
    type: "user"

  };


  users.push(newUser);

  saveUsers(users);


  // Success
  registerMessage.textContent =
    "ACCOUNT CREATED SUCCESSFULLY";

  registerMessage.className =
    "message success";


  setTimeout(function() {

    closeRegisterModal();

    usernameInput.value =
      username;

    passwordInput.value =
      password;

    showLoginMessage(
      "ACCOUNT CREATED. YOU CAN NOW LOGIN.",
      "success"
    );

  }, 800);
}


// ========================================
// EVENTS
// ========================================

loginForm.addEventListener(
  "submit",
  function(event) {

    event.preventDefault();

    login();

  }
);


guestBtn.addEventListener(
  "click",
  guestLogin
);


createAccountBtn.addEventListener(
  "click",
  openRegister
);


closeRegister.addEventListener(
  "click",
  closeRegisterModal
);


registerBtn.addEventListener(
  "click",
  createAccount
);


// ========================================
// CLOSE MODAL OUTSIDE CLICK
// ========================================

registerModal.addEventListener(
  "click",
  function(event) {

    if (event.target === registerModal) {

      closeRegisterModal();

    }

  }
);


console.log(
  "NEXUS LOGIN SYSTEM READY"
);