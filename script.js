/***********************************************
 * KATHIRI ILLAM - Family Dashboard (Firebase)
 * Copy/paste ready. Uses Realtime Database.
 *
 * Login creds (shared):
 *   Username: KATHIRI
 *   Password: Kathiri@786
 *
 * Firebase config below came from your project.
 ***********************************************/

/* ---------- Firebase config (provided) ---------- */
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

/* Initialize Firebase */
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* ---------- Shared login (client-side) ---------- */
const SHARED_USERNAME = "KATHIRI";
const SHARED_PASSWORD = "Kathiri@786";

/* ---------- Page elements ---------- */
// Login
const loginPage = document.getElementById("login-page");
const loginBtn = document.getElementById("login-btn");
const demoBtn = document.getElementById("demo-btn");
const logoutBtn = document.getElementById("logout-btn");
const loginError = document.getElementById("login-error");
const inUser = document.getElementById("login-username");
const inPass = document.getElementById("login-password");

// Dashboard container
const dashboard = document.getElementById("dashboard");

// Announcement elements
const announceMain = document.getElementById("announce-main");
const announceMeta = document.getElementById("announce-meta");
const announceEdit = document.getElementById("announce-edit");
const announceInput = document.getElementById("announce-input");
const announceDuration = document.getElementById("announce-duration");
const announceSave = document.getElementById("announce-save");
const announceCancel = document.getElementById("announce-cancel");
const editAnnBtn = document.getElementById("edit-announce-btn");
const announceHistory = document.getElementById("announce-history");

// Birthday elements
const bdayMain = document.getElementById("bday-main");
const bdayEdit = document.getElementById("bday-edit");
const bdayNameInput = document.getElementById("bday-name");
const bdayDateInput = document.getElementById("bday-date");
const bdayAdd = document.getElementById("bday-add");
const editBdayBtn = document.getElementById("edit-bday-btn");
const bdayClose = document.getElementById("bday-close");
const bdayHistory = document.getElementById("bday-history");

// Mowlid
const mowlidDisplayName = document.getElementById("mowlid-name-display");
const mowlidDisplayDays = document.getElementById("mowlid-days-display");
const editMowlidBtn = document.getElementById("edit-mowlid-btn");
const mowlidEdit = document.getElementById("mowlid-edit");
const mowlidNameInput = document.getElementById("mowlid-name");
const mowlidDaysInput = document.getElementById("mowlid-days");
const mowlidSave = document.getElementById("mowlid-save");
const mowlidCancel = document.getElementById("mowlid-cancel");

// Status
const statusDisplay = document.getElementById("status-display");
const editStatusBtn = document.getElementById("edit-status-btn");
const statusEditArea = document.getElementById("status-edit-area");
const statusSelect = document.getElementById("status-select");
const statusSave = document.getElementById("status-save");
const statusCancel = document.getElementById("status-cancel");

// Tabrook (duty schedule)
const tabrookMain = document.getElementById("tabrook-main");
const tabrookEdit = document.getElementById("tabrook-edit");
const editTabrookBtn = document.getElementById("edit-tabrook-btn");
const tabrookEditList = document.getElementById("tabrook-edit-list");
const tabrookSave = document.getElementById("tabrook-save");
const tabrookCancel = document.getElementById("tabrook-cancel");

// Family tree
const treeDisplay = document.getElementById("tree-display");
const treeEditArea = document.getElementById("tree-edit-area");
const editTreeBtn = document.getElementById("edit-tree-btn");
const memberNameInput = document.getElementById("member-name");
const memberParentInput = document.getElementById("member-parent");
const memberAddBtn = document.getElementById("member-add");
const treeDone = document.getElementById("tree-done");
const treeClear = document.getElementById("tree-clear");

/* ---------- Helper UI functions ---------- */
function showLogin() {
  loginPage.style.display = "flex";
  dashboard.style.display = "none";
}
function showDashboard() {
  loginPage.style.display = "none";
  dashboard.style.display = "block";
}

/* ---------- LOGIN handlers ---------- */
loginBtn.addEventListener("click", () => {
  const u = inUser.value.trim();
  const p = inPass.value;
  if (u === SHARED_USERNAME && p === SHARED_PASSWORD) {
    loginError.innerText = "";
    showDashboard();
    startListeners(); // start firebase listeners when user logged in
  } else {
    loginError.innerText = "Incorrect username or password.";
  }
});
demoBtn.addEventListener("click", () => {
  inUser.value = SHARED_USERNAME; inPass.value = SHARED_PASSWORD;
});
logoutBtn.addEventListener("click", () => {
  window.location.reload();
});

/* ---------- Start realtime listeners for all nodes ---------- */
let listenersStarted = false;
function startListeners() {
  if (listenersStarted) return;
  listenersStarted = true;

  // ANNOUNCEMENTS: node structure: announcements/{pushId} = { text, duration, ts }
  db.ref("announcements").on("value", snap => {
    const data = snap.val() || {};
    // Convert to array and sort newest first
    const items = Object.keys(data).map(k => ({ id: k, ...data[k] })).sort((a,b)=> b.ts - a.ts);

    // Latest announcement for top display
    if (items.length === 0) {
      announceMain.innerText = "No announcements yet.";
      announceMeta.innerText = "";
    } else {
      const recent = items[0];
      announceMain.innerHTML = escapeHtml(recent.text);
      announceMeta.innerText = `Published: ${new Date(recent.ts).toLocaleString()} · Duration: ${recent.duration || "—"}`;
    }

    // History display
    announceHistory.innerHTML = items.map(item => {
      return `<li>
                <div><strong>${escapeHtml(item.text)}</strong><div class="muted">${new Date(item.ts).toLocaleString()} · duration: ${escapeHtml(item.duration||"")}</div></div>
                <div>
                  <button class="ghost" onclick="editAnnouncement('${item.id}')">Edit</button>
                  <button class="ghost" onclick="deleteAnnouncement('${item.id}')">Delete</button>
                </div>
              </li>`;
    }).join("") || "<li>No announcements</li>";
  });

  // BIRTHDAYS: node structure: birthdays/{pushId} = { name, date (YYYY-MM-DD), ts }
  db.ref("birthdays").on("value", snap => {
    const data = snap.val() || {};
    const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));

    // Sort birthdays by month/day ascending for history
    list.sort((a,b)=>{
      const [ay,am,ad] = a.date.split('-').map(Number);
      const [by,bm,bd] = b.date.split('-').map(Number);
      if (am===bm) return ad - bd;
      return am - bm;
    });

    // History list
    bdayHistory.innerHTML = list.map(item => {
      return `<li>
                <div>${escapeHtml(item.name)} — ${escapeHtml(item.date)}</div>
                <div>
                  <button class="ghost" onclick="editBirthday('${item.id}')">Edit</button>
                  <button class="ghost" onclick="deleteBirthday('${item.id}')">Delete</button>
                </div>
              </li>`;
    }).join("") || "<li>No birthdays added</li>";

    // Today's birthdays for top display (match month and day)
    const today = new Date();
    const mm = String(today.getMonth()+1).padStart(2,'0');
    const dd = String(today.getDate()).padStart(2,'0');
    const todays = list.filter(it => {
      if (!it.date) return false;
      const parts = it.date.split('-');
      if (parts.length < 3) return false;
      return parts[1] === mm && parts[2] === dd;
    });

    if (todays.length === 0) {
      bdayMain.innerText = "No birthdays today.";
    } else {
      // display all today's birthdays (sorted)
      bdayMain.innerHTML = todays.map(it => `<div><strong>${escapeHtml(it.name)}</strong> — ${escapeHtml(it.date)}</div>`).join("");
    }
  });

  // MOWLID: single object at /mowlid = { name, days }
  db.ref("mowlid").on("value", snap => {
    const m = snap.val();
    if (!m || !m.name || !m.days || Number(m.days) <= 0) {
      mowlidDisplayName.innerText = "No meeting scheduled";
      mowlidDisplayDays.innerText = "";
      tabrookMain.innerText = "No meeting scheduled.";
      // also clear tabrook area edit list
      renderTabrook([], 0);
      return;
    }
    mowlidDisplayName.innerText = m.name;
    mowlidDisplayDays.innerText = `${m.days} day(s)`;
    // Build tabrook day list according to days
    // Get tabrook owners, then render
    db.ref("tabrook").once("value").then(snapT => {
      const tdata = snapT.val() || {};
      const owners = {};
      // owners keyed by dayIndex (1..N)
      Object.keys(tdata).forEach(k => { owners[k] = tdata[k].owner; });
      renderTabrook(owners, Number(m.days));
    });
  });

  // STATUS (single node)
  db.ref("mowlidStatus").on("value", snap => {
    const s = snap.val() || "Not Started";
    statusDisplay.innerText = s;
    // also reflect in select if open
    if (statusSelect) statusSelect.value = s;
  });

  // FAMILY (members)
  db.ref("family").on("value", snap => {
    const data = snap.val() || {};
    const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    renderTree(list);
  });
}

/* ---------- UI: Announcement edit/save/delete ---------- */
editAnnBtn.addEventListener("click", () => {
  announceEdit.style.display = announceEdit.style.display === "none" ? "block" : "none";
});
announceCancel.addEventListener("click", () => { announceEdit.style.display = "none"; });
announceSave.addEventListener("click", () => {
  const text = announceInput.value.trim();
  const duration = announceDuration.value.trim();
  if (!text) { alert("Enter announcement text."); return; }
  const key = db.ref("announcements").push().key;
  const payload = { text, duration, ts: Date.now() };
  db.ref("announcements/" + key).set(payload).then(() => {
    announceInput.value = ""; announceDuration.value = ""; announceEdit.style.display = "none";
  }).catch(err => { alert("Save failed: " + err.message); });
});

// Edit announcement by id - loads into edit area
window.editAnnouncement = function(id) {
  db.ref("announcements/" + id).once("value").then(snap => {
    const v = snap.val();
    if (!v) return alert("Announcement not found");
    announceInput.value = v.text || "";
    announceDuration.value = v.duration || "";
    // when editing we will override existing id rather than create new
    // we'll store id in a temp field
    announceEdit.dataset.editId = id;
    announceEdit.style.display = "block";
    // change save handler temporarily
    announceSave.onclick = function(){
      const newText = announceInput.value.trim();
      const newDur = announceDuration.value.trim();
      if (!newText) return alert("Enter text");
      db.ref("announcements/" + id).update({ text: newText, duration: newDur, ts: Date.now() })
        .then(()=> { announceEdit.style.display = "none"; announceEdit.dataset.editId = ""; announceSave.onclick = announceSaveHandler; announceInput.value=""; announceDuration.value=""; })
        .catch(err=>alert("Update failed: "+err.message));
    };
  });
};

// store original handler so we can restore after edit
const announceSaveHandler = announceSave.onclick;
window.deleteAnnouncement = function(id) {
  if (!confirm("Delete this announcement?")) return;
  db.ref("announcements/" + id).remove();
};

/* ---------- BIRTHDAY add/edit/delete ---------- */
editBdayBtn.addEventListener("click", () => {
  bdayEdit.style.display = bdayEdit.style.display === "none" ? "block" : "none";
});
bdayClose.addEventListener("click", () => { bdayEdit.style.display = "none"; });

bdayAdd.addEventListener("click", () => {
  const name = bdayNameInput.value.trim();
  const date = bdayDateInput.value;
  if (!name || !date) { alert("Enter name and date"); return; }
  const key = db.ref("birthdays").push().key;
  db.ref("birthdays/" + key).set({ name, date, ts: Date.now() })
    .then(()=> { bdayNameInput.value=""; bdayDateInput.value=""; bdayEdit.style.display="none"; })
    .catch(err=>alert("Save failed: "+err.message));
});

window.editBirthday = function(id) {
  db.ref("birthdays/" + id).once("value").then(snap => {
    const v = snap.val();
    if (!v) return alert("Not found");
    bdayNameInput.value = v.name || "";
    bdayDateInput.value = v.date || "";
    bdayEdit.style.display = "block";
    // change add button temporarily into update
    bdayAdd.onclickBackup = bdayAdd.onclick;
    bdayAdd.textContent = "Update";
    bdayAdd.onclick = function(){
      const newName = bdayNameInput.value.trim();
      const newDate = bdayDateInput.value;
      if (!newName || !newDate) return alert("Enter name and date");
      db.ref("birthdays/" + id).update({ name: newName, date: newDate, ts: Date.now() })
        .then(()=> { bdayNameInput.value=""; bdayDateInput.value=""; bdayEdit.style.display="none"; bdayAdd.textContent="Add"; bdayAdd.onclick = bdayAdd.onclickBackup; })
        .catch(err=>alert("Update failed:"+err.message));
    };
  });
};
window.deleteBirthday = function(id) {
  if (!confirm("Delete this birthday?")) return;
  db.ref("birthdays/" + id).remove();
};

/* ---------- Mowlid (duration) edit/save ---------- */
editMowlidBtn.addEventListener("click", () => {
  mowlidEdit.style.display = mowlidEdit.style.display === "none" ? "block" : "none";
});
mowlidCancel.addEventListener("click", ()=> mowlidEdit.style.display="none");
mowlidSave.addEventListener("click", () => {
  const name = mowlidNameInput.value.trim();
  const days = Number(mowlidDaysInput.value);
  if (!name || !days || days <= 0) {
    if (!name && (!days || days<=0)) return alert("Enter name and days (days>0) or clear to cancel.");
    if (!name) return alert("Enter mowlid name");
    if (!days || days<=0) return alert("Enter valid duration (>0)");
  }
  db.ref("mowlid").set({ name, days }).then(()=> {
    mowlidEdit.style.display="none";
    // Optionally initialize tabrook owners if empty
    db.ref("tabrook").once("value").then(snap=>{
      const t = snap.val() || {};
      // create missing owners up to days as empty
      for(let i=1;i<=days;i++){
        if (!t[i]) { db.ref("tabrook/"+i).set({ owner: "" }); }
      }
    });
  }).catch(err=>alert("Save failed: "+err.message));
});

/* ---------- Status edit ---------- */
editStatusBtn.addEventListener("click", ()=> { statusEditArea.style.display = statusEditArea.style.display === "none" ? "block" : "none"; });
statusCancel.addEventListener("click", ()=> statusEditArea.style.display = "none");
statusSave.addEventListener("click", ()=> {
  const val = statusSelect.value;
  db.ref("mowlidStatus").set(val).then(()=> statusEditArea.style.display="none");
});

/* ---------- Tabrook (duty schedule) editing ---------- */
// Render tabrook owners on UI (owners: object keyed by dayIndex -> ownerName ; days is number)
function renderTabrook(owners, days) {
  if (!days || days <= 0) {
    tabrookMain.innerText = "No meeting scheduled.";
    tabrookEditList.innerHTML = "";
    return;
  }
  // main view
  tabrookMain.innerHTML = "";
  for (let i=1;i<=days;i++){
    const name = owners[i] || "";
    const div = document.createElement("div");
    div.className = "tabrook-day";
    div.innerHTML = `<div>Day ${i}</div><div class="name">${escapeHtml(name||"—")}</div>`;
    tabrookMain.appendChild(div);
  }

  // edit area: create inputs for each day
  tabrookEditList.innerHTML = "";
  for (let i=1;i<=days;i++){
    const owner = owners[i] || "";
    const row = document.createElement("div");
    row.className = "add-row";
    row.style.marginBottom = "8px";
    row.innerHTML = `<div style="flex:1"><label>Day ${i}</label><input id="tabrook-input-${i}" value="${escapeAttr(owner)}" placeholder="Owner name for Day ${i}" /></div>`;
    tabrookEditList.appendChild(row);
  }
}

// edit tabrook button handlers
editTabrookBtn.addEventListener("click", ()=>{
  tabrookEdit.style.display = tabrookEdit.style.display === "none" ? "block" : "none";
});
tabrookCancel.addEventListener("click", ()=> tabrookEdit.style.display = "none");
tabrookSave.addEventListener("click", () => {
  // determine current mowlid days
  db.ref("mowlid").once("value").then(snap=>{
    const m = snap.val();
    if (!m || !m.days || m.days<=0) { alert("No meeting scheduled to save Tabrook."); return; }
    const days = Number(m.days);
    const updates = {};
    for (let i=1;i<=days;i++){
      const el = document.getElementById(`tabrook-input-${i}`);
      const owner = el ? el.value.trim() : "";
      updates[i] = { owner };
    }
    // write under /tabrook (keyed by day index)
    // We'll set each day explicitly
    const promises = [];
    for (let i=1;i<=days;i++){
      promises.push(db.ref("tabrook/"+i).set(updates[i]));
    }
    Promise.all(promises).then(()=> { tabrookEdit.style.display="none"; }).catch(err=>alert("Save failed: "+err.message));
  });
});

/* ---------- Family tree render + editing ---------- */
function renderTree(list) {
  // Build a simple map parent -> children for visual order
  const map = {};
  list.forEach(item => {
    const parent = item.parent || "ROOT";
    if (!map[parent]) map[parent] = [];
    map[parent].push(item);
  });

  // Simple render: show roots then children indented (not a visual connector but hierarchical cards)
  treeDisplay.innerHTML = "";
  const roots = map["ROOT"] || [];
  const added = new Set();

  // function to render subtree recursively
  function renderSub(node, depth=0) {
    const card = document.createElement("div");
    card.className = "tree-card";
    card.style.marginLeft = `${depth * 8}px`;
    card.innerHTML = `<div><strong>${escapeHtml(node.name)}</strong></div>
                      <div class="muted">Parent: ${escapeHtml(node.parent || "—")}</div>
                      <div class="tree-actions">
                        <button class="ghost" onclick="editMember('${node.id}')">Edit</button>
                        <button class="ghost" onclick="deleteMember('${node.id}')">Delete</button>
                      </div>`;
    treeDisplay.appendChild(card);
    added.add(node.id);
    // children
    const childs = map[node.name] || [];
    childs.forEach(c => renderSub(c, depth+1));
  }

  // render all roots and any orphan nodes
  roots.forEach(r => renderSub(r, 0));
  // any nodes not rendered (orphans)
  list.forEach(node => { if (!added.has(node.id)) renderSub(node, 0); });
}

// add member
memberAddBtn.addEventListener("click", () => {
  const name = memberNameInput.value.trim();
  const parent = memberParentInput.value.trim();
  if (!name) return alert("Enter member name");
  const key = db.ref("family").push().key;
  db.ref("family/" + key).set({ name, parent: parent || "" }).then(()=> {
    memberNameInput.value = ""; memberParentInput.value = "";
  });
});
treeDone && treeDone.addEventListener("click", ()=> { treeEditArea.style.display = "none"; });
treeClear && treeClear.addEventListener("click", ()=>{
  if (!confirm("Clear entire family tree?")) return;
  db.ref("family").remove();
});

// edit tree toggle
editTreeBtn.addEventListener("click", ()=> {
  treeEditArea.style.display = treeEditArea.style.display === "none" ? "block" : "none";
});

// edit & delete helpers for members
window.editMember = function(id) {
  db.ref("family/" + id).once("value").then(snap=>{
    const v = snap.val();
    if (!v) return alert("Not found");
    memberNameInput.value = v.name || "";
    memberParentInput.value = v.parent || "";
    treeEditArea.style.display = "block";
    // temporarily change add btn to update
    const old = memberAddBtn.onclick;
    const oldText = memberAddBtn.textContent;
    memberAddBtn.textContent = "Update";
    memberAddBtn.onclick = function(){
      const newName = memberNameInput.value.trim();
      const newParent = memberParentInput.value.trim();
      if (!newName) return alert("Enter name");
      db.ref("family/" + id).update({ name: newName, parent: newParent || "" }).then(()=> {
        memberNameInput.value=""; memberParentInput.value="";
        memberAddBtn.textContent = oldText;
        memberAddBtn.onclick = old;
      });
    };
  });
};
window.deleteMember = function(id) {
  if (!confirm("Delete member?")) return;
  db.ref("family/" + id).remove();
};

/* ---------- Utility helpers ---------- */
function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m]; });
}
function escapeAttr(s) { return s ? s.replace(/"/g,'&quot;') : ""; }

/* ---------- Delete announcement helper (attached earlier) ---------- */
window.deleteAnnouncement = function(id){
  if (!confirm("Delete announcement?")) return;
  db.ref("announcements/" + id).remove();
};

/* ---------- Delete birthday helper (attached earlier) ---------- */
window.deleteBirthday = function(id){
  if (!confirm("Delete birthday?")) return;
  db.ref("birthdays/" + id).remove();
};

/* ---------- Start with login shown ---------- */
showLogin();

/* ---------- Edge: If you need to pre-populate some demo data, uncomment below ---------- */
/*
function seedDemo() {
  // Example: set mowlid
  db.ref('mowlid').set({ name: "Example Mowlid", days: 3 });
  // Announcements
  const a1 = db.ref('announcements').push().key;
  db.ref('announcements/' + a1).set({ text: "Welcome to Kathiri Illam!", duration: "3 days", ts: Date.now() });
  // Birthdays
  const b1 = db.ref('birthdays').push().key;
  db.ref('birthdays/' + b1).set({ name: "Ali", date: "1990-12-05", ts: Date.now() });
  // Family
  const f1 = db.ref('family').push().key;
  db.ref('family/' + f1).set({ name: "Head", parent: "" });
}
*/

/* ---------- End script ---------- */
