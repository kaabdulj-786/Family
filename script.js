// Navigation
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// Firebase Config (YOUR REAL CONFIG ADDED)
const firebaseConfig = {
  apiKey: "AIzaSyB4KiyI-vapW5rvY-VNKTHELfmkO3H4D0M",
  authDomain: "family-6889b.firebaseapp.com",
  databaseURL: "https://family-6889b-default-rtdb.firebaseio.com",
  projectId: "family-6889b",
  storageBucket: "family-6889b.firebasestorage.app",
  messagingSenderId: "1180678547658",
  appId: "1:1180678547658:web:ad4d7d536d0a1599790bdd",
  measurementId: "G-L51S9464TL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ------------------ MOWLID ------------------

function saveMowlid() {
   console.log("clicked");
  const name = document.getElementById("mowlidName").value;
  const days = parseInt(document.getElementById("mowlidDays").value);
  const start = document.getElementById("mowlidStart").value;

  if (!name || !days || !start) {
    alert("Please fill all fields");
    return;
  }

  db.ref("mowlid").set({
    name,
    days,
    start
  });

  generateTabarruk(days, start);

  alert("Mowlid saved successfully");
}

// ------------------ TABARRUK ------------------

function generateTabarruk(days, start) {
  const table = document.getElementById("tabarrukTable");
  table.innerHTML = "";

  let startDate = new Date(start);

  for (let i = 0; i < days; i++) {
    let d = new Date(startDate);
    d.setDate(d.getDate() + i);

    let formattedDate = d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    table.innerHTML += `
      <div style="margin-bottom:15px; padding:10px; border:1px solid #ddd; border-radius:8px;">
        <strong>Day ${i + 1} - ${formattedDate}</strong><br>
        <input placeholder="Name" id="name${i}">
        <input placeholder="Remarks" id="remarks${i}">
      </div>
    `;
  }
}

function saveTabarruk() {
  const container = document.getElementById("tabarrukTable").children;
  let data = {};

  for (let i = 0; i < container.length; i++) {
    let name = document.getElementById(`name${i}`).value;
    let remarks = document.getElementById(`remarks${i}`).value;

    data["day" + (i + 1)] = {
      name,
      remarks
    };
  }

  db.ref("tabarruk").set(data);

  alert("Tabarruk saved successfully");
}

// ------------------ BIRTHDAYS ------------------

function addBirthday() {
  const name = document.getElementById("bName").value;
  const date = document.getElementById("bDate").value;

  if (!name || !date) {
    alert("Enter name and date");
    return;
  }

  const id = Date.now();

  db.ref("birthdays/" + id).set({
    name,
    dob: date
  });

  alert("Birthday added");
}

// ------------------ ANNOUNCEMENTS ------------------

function addAnnouncement() {
  const title = document.getElementById("aTitle").value;
  const desc = document.getElementById("aDesc").value;
  const from = document.getElementById("aFrom").value;
  const to = document.getElementById("aTo").value;

  if (!title || !from || !to) {
    alert("Fill required fields");
    return;
  }

  const id = Date.now();

  db.ref("announcements/" + id).set({
    title,
    desc,
    from,
    to
  });

  alert("Announcement added");
}

// ------------------ FAMILY TREE (BASIC START) ------------------

function addPerson() {
  const name = document.getElementById("personName").value;
  const father = document.getElementById("fatherSelect").value;
  const spouse = document.getElementById("spouseSelect").value;

  if (!name) {
    alert("Enter name");
    return;
  }

  const id = Date.now();

  db.ref("people/" + id).set({
    name,
    father,
    spouse
  });

  alert("Person added");
}
