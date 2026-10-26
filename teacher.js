// TEACHER DASHBOARD — FRONT-END DEMO ONLY
// This demo stores records in localStorage. It is not secure or shared across devices.
// For a real school portal, use a database and server-side teacher authentication.

const DEMO_TEACHER_PASSWORD = "teacher2026";
const ACCOUNT_STORAGE_KEY = "studentPortalAccounts";

const teacherLoginPanel = document.getElementById("teacherLoginPanel");
const teacherDashboard = document.getElementById("teacherDashboard");
const teacherLoginForm = document.getElementById("teacherLoginForm");
const teacherLoginMessage = document.getElementById("teacherLoginMessage");
const studentRows = document.getElementById("studentRows");
const studentSearch = document.getElementById("studentSearch");

teacherLoginForm.addEventListener("submit", event => {
  event.preventDefault();
  const enteredPassword = document.getElementById("teacherPassword").value;

  if (enteredPassword !== DEMO_TEACHER_PASSWORD) {
    teacherLoginMessage.textContent = "Incorrect teacher password.";
    return;
  }

  teacherLoginMessage.textContent = "";
  document.getElementById("teacherPassword").value = "";
  teacherLoginPanel.hidden = true;
  teacherDashboard.hidden = false;
  renderStudents();
});

document.getElementById("teacherLogout").addEventListener("click", () => {
  teacherDashboard.hidden = true;
  teacherLoginPanel.hidden = false;
  studentRows.innerHTML = '<tr><td colspan="9" class="empty-state">Log in to view student accounts.</td></tr>';
  studentSearch.value = "";
});

document.getElementById("refreshStudents").addEventListener("click", renderStudents);
studentSearch.addEventListener("input", renderStudents);

// Listen for changes made in another tab of the same browser/origin.
window.addEventListener("storage", event => {
  if (event.key === ACCOUNT_STORAGE_KEY && !teacherDashboard.hidden) renderStudents();
});

function readStudents() {
  try {
    const records = JSON.parse(localStorage.getItem(ACCOUNT_STORAGE_KEY) || "[]");
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

function saveStudents(students) {
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(students));
}

function safeCell(value) {
  const td = document.createElement("td");
  td.textContent = value || "—";
  return td;
}

function renderStudents() {
  const students = readStudents();
  const search = studentSearch.value.trim().toLowerCase();
  const activeCount = students.filter(student => (student.status || "Active") === "Active").length;
  const droppedCount = students.filter(student => student.status === "Dropped").length;
  const filtered = students.filter(student => [
    student.studentId, student.fullname, student.username, student.email,
    student.course, student.yearLevel, student.registrationDate, student.status || "Active"
  ].some(value => String(value || "").toLowerCase().includes(search)));

  document.getElementById("totalStudents").textContent = students.length;
  document.getElementById("activeStudents").textContent = activeCount;
  document.getElementById("droppedStudents").textContent = droppedCount;
  studentRows.replaceChildren();

  if (filtered.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 9;
    cell.className = "empty-state";
    cell.textContent = students.length
      ? "No students match your search."
      : "No student accounts found yet. Register a student in this same browser first.";
    row.appendChild(cell);
    studentRows.appendChild(row);
  } else {
    filtered.forEach(student => {
      const row = document.createElement("tr");
      [
        student.studentId, student.fullname, student.username, student.email,
        student.course, student.yearLevel
      ].forEach(value => row.appendChild(safeCell(value)));

      const statusCell = document.createElement("td");
      const status = student.status || "Active";
      const statusBadge = document.createElement("span");
      statusBadge.className = `status-pill ${status.toLowerCase()}`;
      statusBadge.textContent = status;
      statusCell.appendChild(statusBadge);
      row.appendChild(statusCell);

      row.appendChild(safeCell(student.registrationDate));

      const actions = document.createElement("td");
      actions.className = "action-cell";

      const statusButton = document.createElement("button");
      statusButton.className = "action-button " + (status === "Dropped" ? "restore-button" : "drop-button");
      statusButton.textContent = status === "Dropped" ? "Restore Active" : "Mark Dropped";
      statusButton.addEventListener("click", () => changeStudentStatus(student.studentId, status === "Dropped" ? "Active" : "Dropped"));
      actions.appendChild(statusButton);

      const deleteButton = document.createElement("button");
      deleteButton.className = "action-button delete-button";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteStudent(student.studentId, student.fullname || student.username || "this student"));
      actions.appendChild(deleteButton);

      row.appendChild(actions);
      studentRows.appendChild(row);
    });
  }

  document.getElementById("listMessage").textContent =
    `Showing ${filtered.length} of ${students.length} student account(s).`;
}

function changeStudentStatus(studentId, newStatus) {
  const students = readStudents();
  const student = students.find(item => item.studentId === studentId);
  if (!student) {
    alert("Student record not found. Refresh the list and try again.");
    return;
  }

  student.status = newStatus;
  saveStudents(students);
  renderStudents();
}

function deleteStudent(studentId, displayName) {
  const confirmed = confirm(`Permanently delete ${displayName}'s student account from this browser? This cannot be undone.`);
  if (!confirmed) return;

  const students = readStudents();
  const remaining = students.filter(student => student.studentId !== studentId);
  saveStudents(remaining);
  renderStudents();
}
