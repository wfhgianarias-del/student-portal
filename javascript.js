const authPage = document.getElementById("authPage");
const dashboardPage = document.getElementById("dashboardPage");
const registerView = document.getElementById("registerView");
const loginView = document.getElementById("loginView");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const registerMessage = document.getElementById("registerMessage");
const loginMessage = document.getElementById("loginMessage");

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("dashboardYear").textContent = new Date().getFullYear();

function message(element, text, type) {
  element.textContent = text;
  element.className = "message " + type;
}

function getAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem("studentPortalAccounts") || "[]");
    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts) {
  localStorage.setItem("studentPortalAccounts", JSON.stringify(accounts));
}

// Demo-only password hashing. Real websites must hash passwords on a server.
async function hashPassword(password) {
  if (!window.crypto?.subtle) {
    throw new Error("Please run this project with VS Code Live Server or localhost.");
  }
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, "0")).join("");
}

document.getElementById("showLogin").addEventListener("click", () => {
  registerView.hidden = true;
  loginView.hidden = false;
  registerMessage.textContent = "";
  loginMessage.textContent = "";
});

document.getElementById("showRegister").addEventListener("click", () => {
  loginView.hidden = true;
  registerView.hidden = false;
  registerMessage.textContent = "";
  loginMessage.textContent = "";
});

registerForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button = registerForm.querySelector('button[type="submit"]');
  button.disabled = true;

  try {
    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("newUsername").value.trim();
    const password = document.getElementById("newPassword").value;
    const course = document.getElementById("course").value;
    const yearLevel = document.getElementById("yearLevel").value;
    const agreement = document.getElementById("agreement").checked;

    if (!fullname || !email || !username || !password || !course || !yearLevel || !agreement) {
      message(registerMessage, "Please complete all required fields.", "error");
      return;
    }

    const accounts = getAccounts();
    const exists = accounts.some(account =>
      account.username.toLowerCase() === username.toLowerCase() ||
      account.email.toLowerCase() === email.toLowerCase()
    );

    if (exists) {
      message(registerMessage, "That username or email is already registered.", "error");
      return;
    }

    const passwordHash = await hashPassword(password);
    const student = {
      fullname,
      email,
      username,
      passwordHash,
      course,
      yearLevel,
      studentId: "ST-" + Date.now().toString().slice(-8),
      registrationDate: new Date().toLocaleDateString("en-PH", {
        year: "numeric", month: "long", day: "numeric"
      })
    };

    accounts.push(student);
    saveAccounts(accounts);
    registerForm.reset();

    registerView.hidden = true;
    loginView.hidden = false;
    document.getElementById("loginUsername").value = username;
    document.getElementById("loginPassword").value = "";

    message(loginMessage, "Account created successfully! Please log in with your username and password.", "success");
  } catch (error) {
    message(registerMessage, error.message || "Could not create account. Please try again.", "error");
  } finally {
    button.disabled = false;
  }
});

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button = loginForm.querySelector('button[type="submit"]');
  button.disabled = true;

  try {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;
    const account = getAccounts().find(item =>
      item.username.toLowerCase() === username.toLowerCase()
    );

    if (!account) {
      message(loginMessage, "Account not found. Please create an account first.", "error");
      return;
    }

    const passwordHash = await hashPassword(password);
    if (passwordHash !== account.passwordHash) {
      message(loginMessage, "Incorrect password. Please try again.", "error");
      return;
    }

    loginForm.reset();
    showDashboard(account);
  } catch (error) {
    message(loginMessage, error.message || "Login failed. Please try again.", "error");
  } finally {
    button.disabled = false;
  }
});

function setText(id, value) {
  document.getElementById(id).textContent = value || "—";
}

function showDashboard(student) {
  setText("welcomeName", student.fullname);
  setText("topbarName", student.fullname);
  setText("avatar", student.fullname.charAt(0).toUpperCase());
  setText("statCourse", student.course);
  setText("statYear", student.yearLevel);
  setText("detailName", student.fullname);
  setText("detailEmail", student.email);
  setText("detailUsername", student.username);
  setText("detailId", student.studentId);
  setText("detailCourse", student.course);
  setText("detailYear", student.yearLevel);
  setText("detailDate", student.registrationDate);

  authPage.hidden = true;
  document.getElementById("authFooter").hidden = true;
  dashboardPage.hidden = false;
  showView("overview");
  window.scrollTo(0, 0);
}

function showView(view) {
  const stats = document.getElementById("statsGrid");
  const details = document.getElementById("detailGrid");
  const secondary = document.getElementById("secondaryPanel");
  const heading = document.getElementById("pageHeading");
  const info = details.querySelector(".information-card");
  const quick = details.querySelector(".quick-card");

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  info.hidden = false;
  quick.hidden = false;
  stats.hidden = false;
  secondary.hidden = false;

  if (view === "profile") {
    heading.textContent = "My Profile";
    stats.hidden = true;
    quick.hidden = true;
    secondary.hidden = true;
  } else if (view === "course") {
    heading.textContent = "My Course";
    info.hidden = true;
    secondary.hidden = true;
  } else if (view === "enrollment") {
    heading.textContent = "Enrollment";
    quick.hidden = true;
  } else {
    heading.textContent = "Dashboard";
  }
  window.scrollTo(0, 0);
}

document.querySelectorAll(".nav-item, .quick-link").forEach(button => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  dashboardPage.hidden = true;
  authPage.hidden = false;
  document.getElementById("authFooter").hidden = false;
  loginView.hidden = false;
  registerView.hidden = true;
  loginForm.reset();
  loginMessage.textContent = "";
  registerMessage.textContent = "";
  window.scrollTo(0, 0);
});
