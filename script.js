/* ===========================
   LOGIN GUARD
=========================== */
if(!sessionStorage.getItem("adminLogged")){
  location.href = "index.html";
}

function logout(){
  sessionStorage.removeItem("adminLogged");
  location.href = "index.html";
}

/* ===========================
   FIREBASE INIT
=========================== */

const firebaseConfig = {
  apiKey: "AIzaSyB4KiyI-vapW5rvY-VNKTHELfmkO3H4D0M",
  authDomain: "family-6889b.firebaseapp.com",
  databaseURL: "https://family-6889b-default-rtdb.firebaseio.com",
  projectId: "family-6889b"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

let editBirthdayId = null;
let editAnnouncementId = null;

/* SECTION SWITCH */
function showSection(id, btn){

  document.querySelectorAll(".section")
    .forEach(s=>s.classList.remove("active"));

  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".sidebar button[data-target]")
    .forEach(b=>b.classList.remove("active"));

  if(btn) btn.classList.add("active");
}

showSection("mowlid", document.querySelector('.sidebar button[data-target="mowlid"]'));

/* TOAST */
function showToast(text){
  let toast = document.getElementById("toast");
  toast.innerText = text;
  toast.style.display = "block";
  setTimeout(()=>{ toast.style.display = "none"; }, 2000);
}

/* ===========================
   🎉 EVENTS & GATHERINGS
=========================== */

let eventData = {};
let editEventId = null;

function addEvent(){

  let name = evName.value.trim();
  let dateTime = evDateTime.value;
  let venue = evVenue.value.trim();
  let organiser = evOrganiser.value.trim();
  let note = evNote.value.trim();

  if(!name || !dateTime){
    showToast("Please enter event name and date/time");
    return;
  }

  let id = editEventId || Date.now();

  db.ref("events/"+id).set({ name, dateTime, venue, organiser, note });

  evName.value = "";
  evDateTime.value = "";
  evVenue.value = "";
  evOrganiser.value = "";
  evNote.value = "";

  editEventId = null;
  evCancelBtn.style.display = "none";

  showToast("Event Saved");
}

function cancelEventEdit(){
  editEventId = null;
  evName.value = "";
  evDateTime.value = "";
  evVenue.value = "";
  evOrganiser.value = "";
  evNote.value = "";
  evCancelBtn.style.display = "none";
}

db.ref("events").on("value", snap=>{
  eventData = snap.val() || {};
  renderEventLists();
});

function renderEventLists(){

  let now = new Date();

  let upcoming = [];
  let past = [];

  Object.entries(eventData).forEach(([id,e])=>{
    if(new Date(e.dateTime) >= now){
      upcoming.push([id,e]);
    } else {
      past.push([id,e]);
    }
  });

  upcoming.sort((a,b)=> new Date(a[1].dateTime) - new Date(b[1].dateTime));
  past.sort((a,b)=> new Date(b[1].dateTime) - new Date(a[1].dateTime));

  upcomingEventList.innerHTML = upcoming.map(([id,e])=> eventCardHtml(id,e,false)).join("")
    || `<div class="card empty">No upcoming events</div>`;

  pastEventList.innerHTML = past.map(([id,e])=> eventCardHtml(id,e,true)).join("")
    || `<div class="card empty">No past events yet</div>`;
}

function eventCardHtml(id, e, isPast){

  let dt = new Date(e.dateTime);

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:10px">
        <b>${escapeHtml(e.name)}</b>
        <span class="badge ${isPast ? 'badge-expired' : 'badge-started'}">${isPast ? 'Past' : 'Upcoming'}</span>
      </div>
      <small style="color:#64748b;display:block;margin-top:6px">
        ${formatDateTimeClean(dt)}${e.venue ? " · " + escapeHtml(e.venue) : ""}
      </small>
      ${e.organiser ? `<div style="margin-top:8px">👤 Organised by ${escapeHtml(e.organiser)}</div>` : ""}
      ${e.note ? `<div style="margin-top:8px;color:#64748b">${escapeHtml(e.note)}</div>` : ""}
      <div class="btn-row">
        <button class="primary-btn" onclick="editEvent('${id}')">Edit</button>
        <button class="danger-btn" onclick="deleteEvent('${id}')">Delete</button>
      </div>
    </div>
  `;
}

function editEvent(id){
  let e = eventData[id];
  if(!e) return;
  editEventId = id;
  evName.value = e.name;
  evDateTime.value = e.dateTime;
  evVenue.value = e.venue || "";
  evOrganiser.value = e.organiser || "";
  evNote.value = e.note || "";
  evCancelBtn.style.display = "inline-block";
  showSection('events', document.querySelector('.sidebar button[data-target="events"]'));
}

function deleteEvent(id){
  if(!confirm("Delete this event permanently?")) return;
  db.ref("events/"+id).remove();
  showToast("Event Deleted");
}

/* ===========================
   🕌 MOWLID
=========================== */

let currentMowlid = null;

function saveMowlid(){

  let name = mName.value.trim();
  let days = parseInt(mDays.value);
  let start = mStart.value;

  if(!name || !days || !start){
    showToast("Please fill all Mowlid fields");
    return;
  }

  let data = { name, days, start };

  db.ref("mowlid").set(data);

  /* Reset Tabarruk + status whenever Mowlid is (re)saved, per spec */
  db.ref("tabarruk").remove();
  db.ref("mowlidStatus").remove();

  mName.value = "";
  mDays.value = "";
  mStart.value = "";

  showToast("Mowlid Saved — Tabarruk table regenerated");
}

function deleteMowlid(){

  db.ref("mowlid").remove();
  db.ref("tabarruk").remove();
  db.ref("mowlidStatus").remove();

  showToast("Mowlid Deleted");
}

db.ref("mowlid").on("value", snap=>{

  currentMowlid = snap.val();

  if(!currentMowlid){
    mowlidPreview.innerHTML = `
      <div class="card empty">No Mowlid Scheduled</div>
    `;
  } else {

    let start = new Date(currentMowlid.start);
    let end = new Date(start);
    end.setDate(end.getDate() + currentMowlid.days - 1);

    mowlidPreview.innerHTML = `
      <div class="card">
        <h3>${escapeHtml(currentMowlid.name)}</h3>
        <div>${currentMowlid.days} Days</div>
        <small style="color:#64748b">
          ${start.toDateString()} → ${end.toDateString()}
        </small>
      </div>
    `;
  }

  renderTabarrukList();
});

/* ===========================
   🍽️ TABARRUK
   (rebuilt to persist saved values on reload — fixes original bug)
=========================== */

let savedTabarruk = {};

db.ref("tabarruk").on("value", snap=>{
  savedTabarruk = snap.val() || {};
  renderTabarrukList();
});

function renderTabarrukList(){

  if(!currentMowlid){
    tabarrukList.innerHTML = `<div class="empty">No Mowlid scheduled yet.</div>`;
    return;
  }

  let start = new Date(currentMowlid.start);
  let html = "";

  for(let i = 0; i < currentMowlid.days; i++){

    let d = new Date(start);
    d.setDate(d.getDate() + i);

    let key = "day" + (i+1);
    let existing = savedTabarruk[key] || { name:"", remarks:"" };

    html += `
      <div class="card tab-edit-row">
        <b>Day ${i+1}</b>
        <small style="display:block;color:#64748b;margin:4px 0 10px">
          ${formatDateClean(d)}
        </small>
        <input data-day="${key}" data-field="name" placeholder="Name" value="${escapeAttr(existing.name)}">
        <input data-day="${key}" data-field="remarks" placeholder="Remarks (what is being served)" value="${escapeAttr(existing.remarks)}">
      </div>
    `;
  }

  tabarrukList.innerHTML = html;
}

function saveTabarruk(){

  if(!currentMowlid){
    showToast("No Mowlid scheduled");
    return;
  }

  let data = {};
  let rows = tabarrukList.querySelectorAll(".tab-edit-row");

  rows.forEach((row, i)=>{
    let inputs = row.querySelectorAll("input");
    data["day"+(i+1)] = {
      name: inputs[0].value,
      remarks: inputs[1].value
    };
  });

  db.ref("tabarruk").set(data);

  showToast("Tabarruk Saved");
}

/* ===========================
   🎂 BIRTHDAY
=========================== */

let birthdayData = {};

function addBirthday(){

  let name = bName.value.trim();
  let dob = bDate.value;

  if(!name || !dob){
    showToast("Please enter name and date of birth");
    return;
  }

  let id = editBirthdayId || Date.now();

  db.ref("birthdays/"+id).set({ name, dob });

  bName.value = "";
  bDate.value = "";

  editBirthdayId = null;
  bCancelBtn.style.display = "none";

  showToast("Birthday Saved");
}

function cancelBirthdayEdit(){
  editBirthdayId = null;
  bName.value = "";
  bDate.value = "";
  bCancelBtn.style.display = "none";
}

db.ref("birthdays").on("value", snap=>{
  birthdayData = snap.val() || {};
  renderBirthdayList();
});

function renderBirthdayList(){

  let query = (bSearch.value || "").toLowerCase().trim();

  let html = "";
  let entries = Object.entries(birthdayData)
    .sort((a,b)=> a[1].name.localeCompare(b[1].name));

  entries.forEach(([id, b])=>{

    if(query && !b.name.toLowerCase().includes(query)) return;

    html += `
      <div class="card">
        <b>${escapeHtml(b.name)}</b>
        <br>
        ${formatDateClean(new Date(b.dob))}
        <div class="btn-row">
          <button class="primary-btn" onclick="editBirthday('${id}')">Edit</button>
          <button class="danger-btn" onclick="deleteBirthday('${id}')">Delete</button>
        </div>
      </div>
    `;
  });

  birthdayList.innerHTML = html || `<div class="empty">No birthdays found</div>`;
}

function editBirthday(id){
  let b = birthdayData[id];
  if(!b) return;
  editBirthdayId = id;
  bName.value = b.name;
  bDate.value = b.dob;
  bCancelBtn.style.display = "inline-block";
  showSection('birthdays', document.querySelector('.sidebar button[data-target="birthdays"]'));
}

function deleteBirthday(id){
  if(!confirm("Delete this birthday entry?")) return;
  db.ref("birthdays/"+id).remove();
  showToast("Birthday Deleted");
}

/* ===========================
   📢 ANNOUNCEMENTS
   (adds Active/Expired badge, never auto-deletes)
=========================== */

let announcementData = {};

function addAnnouncement(){

  let title = aTitle.value.trim();
  let text = aText.value.trim();
  let from = aFrom.value;
  let to = aTo.value;

  if(!title || !from || !to){
    showToast("Please fill title, from and to");
    return;
  }

  let id = editAnnouncementId || Date.now();

  db.ref("announcements/"+id).set({ title, text, from, to });

  aTitle.value = "";
  aText.value = "";
  aFrom.value = "";
  aTo.value = "";

  editAnnouncementId = null;
  aCancelBtn.style.display = "none";

  showToast("Announcement Saved");
}

function cancelAnnouncementEdit(){
  editAnnouncementId = null;
  aTitle.value = "";
  aText.value = "";
  aFrom.value = "";
  aTo.value = "";
  aCancelBtn.style.display = "none";
}

db.ref("announcements").on("value", snap=>{
  announcementData = snap.val() || {};
  renderAnnouncementList();
});

function renderAnnouncementList(){

  let now = new Date();

  let entries = Object.entries(announcementData).sort((a,b)=>{
    return new Date(b[1].from) - new Date(a[1].from);
  });

  let html = "";

  entries.forEach(([id, a])=>{

    let from = new Date(a.from);
    let to = new Date(a.to);
    let active = now >= from && now <= to;

    html += `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:10px">
          <b>${escapeHtml(a.title)}</b>
          <span class="badge ${active ? 'badge-started' : 'badge-expired'}">
            ${active ? 'Active' : 'Expired'}
          </span>
        </div>
        <div style="margin-top:8px">${escapeHtml(a.text||"")}</div>
        <small style="color:#64748b;display:block;margin-top:8px">
          ${formatDateTimeClean(from)} → ${formatDateTimeClean(to)}
        </small>
        <div class="btn-row">
          <button class="primary-btn" onclick="editAnnouncement('${id}')">Edit</button>
          <button class="danger-btn" onclick="deleteAnnouncement('${id}')">Delete</button>
        </div>
      </div>
    `;
  });

  announcementList.innerHTML = html || `<div class="empty">No announcements yet</div>`;
}

function editAnnouncement(id){
  let a = announcementData[id];
  if(!a) return;
  editAnnouncementId = id;
  aTitle.value = a.title;
  aText.value = a.text || "";
  aFrom.value = a.from;
  aTo.value = a.to;
  aCancelBtn.style.display = "inline-block";
  showSection('announcements', document.querySelector('.sidebar button[data-target="announcements"]'));
}

function deleteAnnouncement(id){
  if(!confirm("Delete this announcement permanently?")) return;
  db.ref("announcements/"+id).remove();
  showToast("Announcement Deleted");
}

/* ===========================
   🌳 FAMILY TREE ENGINE
   (fixes duplicate-listener bug: people + trees are each
   subscribed exactly ONCE, not re-subscribed on every switch)
=========================== */

let currentTree = null;
let treesData = {};
let peopleData = {};

/* CREATE TREE */
function createTree(){

  let name = treeName.value.trim();

  if(!name){
    showToast("Enter Tree Name");
    return;
  }

  let id = "tree_" + Date.now();

  db.ref("trees/"+id).set({ name });

  treeName.value = "";

  showToast("Tree Created");
}

/* LOAD TREES — single subscription */
db.ref("trees").on("value", snap=>{

  treesData = snap.val() || {};

  let ids = Object.keys(treesData);

  treeSelect.innerHTML = ids.map(id=>
    `<option value="${id}">${escapeHtml(treesData[id].name)}</option>`
  ).join("");

  if(ids.length && !treesData[currentTree]){
    currentTree = ids[0];
  }

  if(currentTree){
    treeSelect.value = currentTree;
  }

  renderPeopleUI();
});

/* TREE SWITCH — just changes which tree we render, no new listener */
treeSelect.onchange = ()=>{
  currentTree = treeSelect.value;
  renderPeopleUI();
};

/* LOAD PEOPLE — single subscription for the whole app's lifetime */
db.ref("people").on("value", snap=>{
  peopleData = snap.val() || {};
  renderPeopleUI();
});

function resolveName(id){
  return peopleData[id] ? peopleData[id].name : null;
}

/* ADD NEW PERSON */
function addPerson(){

  if(!currentTree){
    showToast("Create or select a tree first");
    return;
  }

  let name = pName.value.trim();

  if(!name){
    showToast("Enter Name");
    return;
  }

  let id = "person_" + Date.now();

  let person = {
    name,
    gender: pGender.value,
    father: pFather.value || null,
    spouse: pSpouse.value || null,
    trees: { [currentTree]: true }
  };

  db.ref("people/"+id).set(person);

  pName.value = "";
  pFather.value = "";
  pSpouse.value = "";
  pGender.value = "male";

  showToast("Person Added");
}

/* LINK EXISTING PERSON INTO CURRENT TREE (fixes the missing cross-tree feature) */
function linkExistingPerson(){

  if(!currentTree){
    showToast("Select a tree first");
    return;
  }

  let id = existingPersonSelect.value;

  if(!id){
    showToast("Select a person to add");
    return;
  }

  db.ref("people/"+id+"/trees/"+currentTree).set(true);

  existingPersonSelect.value = "";

  showToast("Person added to this tree");
}

/* RENDER EVERYTHING TREE-RELATED FROM CACHED DATA */
function renderPeopleUI(){

  peopleList.innerHTML = "";

  pFather.innerHTML = `<option value="">No Father (Root Person)</option>`;
  pSpouse.innerHTML = `<option value="">No Spouse</option>`;
  existingPersonSelect.innerHTML = `<option value="">Select a person...</option>`;

  if(!currentTree) return;

  let inTree = [];
  let notInTree = [];

  for(let id in peopleData){
    let p = peopleData[id];
    if(p.trees && p.trees[currentTree]){
      inTree.push({ id, ...p });
    } else {
      notInTree.push({ id, ...p });
    }
  }

  /* dropdowns only offer people already in this tree, for father/spouse */
  inTree.forEach(p=>{
    pFather.innerHTML += `<option value="${p.id}">${escapeHtml(p.name)}</option>`;
    pSpouse.innerHTML += `<option value="${p.id}">${escapeHtml(p.name)}</option>`;
  });

  /* existing-person linker offers everyone NOT already in this tree */
  notInTree.forEach(p=>{
    existingPersonSelect.innerHTML += `<option value="${p.id}">${escapeHtml(p.name)}</option>`;
  });

  if(inTree.length === 0){
    peopleList.innerHTML = `<div class="empty">No people in this tree yet</div>`;
    return;
  }

  inTree.forEach(p=>{

    let treeCount = p.trees ? Object.keys(p.trees).length : 1;

    peopleList.innerHTML += `
      <div class="card">
        <h3>${escapeHtml(p.name)} <small style="color:#94a3b8;font-weight:400">(${p.gender})</small></h3>
        <div>Father: ${p.father ? escapeHtml(resolveName(p.father) || "—") : "No Father"}</div>
        <div>Spouse: ${p.spouse ? escapeHtml(resolveName(p.spouse) || "—") : "No Spouse"}</div>
        ${treeCount > 1 ? `<span class="badge badge-upcoming" style="margin-top:8px">In ${treeCount} trees</span>` : ""}
        <div class="btn-row">
          <button class="danger-btn" onclick="removeFromTree('${p.id}')">Remove from Tree</button>
        </div>
      </div>
    `;
  });
}

/* REMOVE FROM TREE — only deletes the person entirely if this was their last tree */
function removeFromTree(id){

  let p = peopleData[id];
  if(!p) return;

  let treeIds = p.trees ? Object.keys(p.trees) : [];

  if(treeIds.length <= 1){
    if(!confirm(`${p.name} will be permanently deleted (this is their only tree). Continue?`)) return;
    db.ref("people/"+id).remove();
    showToast("Person Deleted");
  } else {
    if(!confirm(`Remove ${p.name} from this tree only? They will remain in their other tree(s).`)) return;
    db.ref("people/"+id+"/trees/"+currentTree).remove();
    showToast("Removed from this tree");
  }
}

/* ===========================
   HELPERS
=========================== */

function escapeHtml(str){
  if(str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");
}

function escapeAttr(str){
  return escapeHtml(str).replace(/"/g,"&quot;");
}

function formatDateClean(d){
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

function formatDateTimeClean(d){
  return d.toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
