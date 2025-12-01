const USERNAME = "KATHIRI";
const PASSWORD = "Kathiri@786";

function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    if (user === USERNAME && pass === PASSWORD) {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
    } else {
        document.getElementById("login-error").innerText = "Incorrect credentials!";
    }
}

function logout() {
    location.reload();
}

// MOWILID DURATION
function saveDuration() {
    const name = document.getElementById("mowlidName").value;
    const days = document.getElementById("durationDays").value;
    localStorage.setItem("mowlidName", name);
    localStorage.setItem("durationDays", days);
    displayDuration();
}

function displayDuration() {
    document.getElementById("currentMowlid").innerText = localStorage.getItem("mowlidName") || "None";
    document.getElementById("durationDisplay").innerText = localStorage.getItem("durationDays") || "0";
}
displayDuration();

// MOWILID STATUS
function toggleStatus() {
    let current = localStorage.getItem("mowlidStatus") === "Started" ? "Not Started" : "Started";
    localStorage.setItem("mowlidStatus", current);
    document.getElementById("statusDisplay").innerText = current;
}
document.getElementById("statusDisplay").innerText = localStorage.getItem("mowlidStatus") || "Not Started";

// BIRTHDAYS
let birthdays = JSON.parse(localStorage.getItem("birthdays")) || [];
function addBirthday() {
    const name = document.getElementById("bdayName").value;
    const date = document.getElementById("bdayDate").value;
    birthdays.push({ name, date });
    localStorage.setItem("birthdays", JSON.stringify(birthdays));
    displayBirthdayHistory();
}
function displayBirthdayHistory() {
    const list = document.getElementById("bdayHistory");
    list.innerHTML = birthdays.map(b => `<li>${b.name} - ${b.date}</li>`).join("");
}
displayBirthdayHistory();

// ANNOUNCEMENTS
let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
function saveAnnouncement() {
    const text = document.getElementById("announcementText").value;
    announcements.unshift(text);
    localStorage.setItem("announcements", JSON.stringify(announcements));
    displayAnnouncementHistory();
}
function displayAnnouncementHistory() {
    const list = document.getElementById("announceHistory");
    list.innerHTML = announcements.map(a => `<li>${a}</li>`).join("");
}
displayAnnouncementHistory();

// FAMILY TREE
let family = JSON.parse(localStorage.getItem("family")) || [];
function addMember() {
    const name = document.getElementById("memberName").value;
    const parent = document.getElementById("parentName").value;
    family.push({ name, parent });
    localStorage.setItem("family", JSON.stringify(family));
    displayTree();
}
function displayTree() {
    const container = document.getElementById("familyTree");
    container.innerHTML = family.map(m => `<div><strong>${m.name}</strong> (Child of: ${m.parent || "None"})</div>`).join("");
}
displayTree();
