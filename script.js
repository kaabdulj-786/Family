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
   🌳 FAMILY TREE ENGINE (v2)
   - father + mother (was father-only)
   - spouse links are now reciprocal & validated (was one-directional)
   - birth order field, used for sibling sequencing
   - full edit support (was add/delete only)
   - live preview rendered right here in admin
=========================== */

let currentTree = null;
let treesData = {};
let peopleData = {};
let editPersonId = null;

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

/* RENAME — only changes the label, people/relationships are untouched */
function renameTree(){

  if(!currentTree || !treesData[currentTree]){
    showToast("Select a tree first");
    return;
  }

  let newName = prompt("Rename tree:", treesData[currentTree].name);

  if(newName === null) return; // cancelled

  newName = newName.trim();

  if(!newName){
    showToast("Name can't be empty");
    return;
  }

  db.ref("trees/"+currentTree+"/name").set(newName);

  showToast("Tree Renamed");
}

/* DELETE — removes the tree, unlinks every person from it, and only
   deletes a person outright if this was their ONLY tree. Anyone who
   also belongs to another tree simply loses membership in this one. */
function deleteTree(){

  if(!currentTree || !treesData[currentTree]){
    showToast("Select a tree first");
    return;
  }

  let treeLabel = treesData[currentTree].name;

  let affected = Object.entries(peopleData).filter(([id,p]) => p.trees && p.trees[currentTree]);

  let onlyHere = affected.filter(([id,p]) => Object.keys(p.trees).length <= 1);

  let confirmMsg = `Delete "${treeLabel}"?\n\n` +
    `${affected.length} people are in this tree.\n` +
    (onlyHere.length
      ? `${onlyHere.length} of them are ONLY in this tree and will be permanently deleted.\n`
      : "") +
    `This cannot be undone. Continue?`;

  if(!confirm(confirmMsg)) return;

  let updates = {};

  let deletedIds = new Set(onlyHere.map(([id])=>id));

  affected.forEach(([id,p])=>{

    if(deletedIds.has(id)){
      updates["people/"+id] = null; // delete person entirely

      /* Only clear the spouse's reciprocal link if that spouse ISN'T
         also being fully deleted in this same batch — writing both
         "people/X" (delete) and "people/X/spouse" (leaf) together is
         an invalid overlapping Firebase path and would silently fail
         the whole update, same bug class as the person-save issue. */
      if(p.spouse && !deletedIds.has(p.spouse) &&
         peopleData[p.spouse] && peopleData[p.spouse].spouse === id){
        updates["people/"+p.spouse+"/spouse"] = null;
      }
    } else {
      updates["people/"+id+"/trees/"+currentTree] = null;
    }
  });

  updates["trees/"+currentTree] = null;

  db.ref().update(updates).then(()=>{
    currentTree = null;
    showToast("Tree Deleted");
  });
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
  cancelPersonEdit();
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

function treeNamesFor(person){
  if(!person.trees) return "";
  return Object.keys(person.trees).map(tid => treesData[tid] ? treesData[tid].name : "").filter(Boolean).join(", ");
}

/* ===========================
   ADD / EDIT PERSON (unified)
=========================== */

function savePerson(){

  if(!currentTree){
    showToast("Create or select a tree first");
    return;
  }

  let name = pName.value.trim();

  if(!name){
    showToast("Enter Name");
    return;
  }

  let gender = pGender.value;
  let father = pFather.value || null;
  let mother = pMother.value || null;
  let newSpouse = pSpouse.value || null;
  let order = pOrder.value ? parseInt(pOrder.value) : null;

  /* Validate: block linking a spouse who is already married to someone else */
  if(newSpouse && peopleData[newSpouse] && peopleData[newSpouse].spouse &&
     peopleData[newSpouse].spouse !== editPersonId){
    showToast(peopleData[newSpouse].name + " is already linked to a spouse");
    return;
  }

  let isEdit = !!editPersonId;
  let id = isEdit ? editPersonId : ("person_" + Date.now());
  let oldSpouse = isEdit && peopleData[id] ? peopleData[id].spouse : null;

  let updates = {};

  if(isEdit){
    updates["people/"+id+"/name"] = name;
    updates["people/"+id+"/gender"] = gender;
    updates["people/"+id+"/father"] = father;
    updates["people/"+id+"/mother"] = mother;
    updates["people/"+id+"/order"] = order;
    updates["people/"+id+"/spouse"] = newSpouse;
  } else {
    /* IMPORTANT: spouse must be included in this single object write.
       Writing "people/id" (the whole record) and "people/id/spouse"
       (a piece of that same record) in the same update() call is an
       invalid overlapping path in Firebase and silently fails the
       entire save — this was the bug that stopped people from saving. */
    updates["people/"+id] = {
      name, gender, father, mother, order,
      spouse: newSpouse,
      trees: { [currentTree]: true }
    };
  }

  /* Reciprocal spouse handling */
  if(oldSpouse && oldSpouse !== newSpouse && peopleData[oldSpouse] && peopleData[oldSpouse].spouse === id){
    updates["people/"+oldSpouse+"/spouse"] = null;
  }

  if(newSpouse){
    updates["people/"+newSpouse+"/spouse"] = id;
  }

  db.ref().update(updates).then(()=>{
    showToast(isEdit ? "Person Updated" : "Person Added");
  });

  cancelPersonEdit();
}

function editPerson(id){

  let p = peopleData[id];
  if(!p) return;

  editPersonId = id;

  pName.value = p.name;
  pGender.value = p.gender;
  pFather.value = p.father || "";
  pMother.value = p.mother || "";
  pSpouse.value = p.spouse || "";
  pOrder.value = p.order || "";

  personFormTitle.innerText = "Edit " + p.name;
  pCancelBtn.style.display = "inline-block";

  renderPeopleUI(); // refresh dropdowns to exclude self, keep current values

  pFather.value = p.father || "";
  pMother.value = p.mother || "";
  pSpouse.value = p.spouse || "";

  showSection('tree', document.querySelector('.sidebar button[data-target="tree"]'));
  document.getElementById('personFormTitle').scrollIntoView({behavior:'smooth', block:'center'});
}

function cancelPersonEdit(){
  editPersonId = null;
  pName.value = "";
  pFather.value = "";
  pMother.value = "";
  pSpouse.value = "";
  pOrder.value = "";
  pGender.value = "male";
  personFormTitle.innerText = "Add New Person";
  pCancelBtn.style.display = "none";
}

/* LINK EXISTING PERSON INTO CURRENT TREE */
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

/* ===========================
   RENDER: dropdowns + member list + live preview
=========================== */

function renderPeopleUI(){

  pFather.innerHTML = `<option value="">No Father (Root Person)</option>`;
  pMother.innerHTML = `<option value="">No Mother Linked</option>`;
  pSpouse.innerHTML = `<option value="">No Spouse</option>`;
  existingPersonSelect.innerHTML = `<option value="">Select a person...</option>`;

  if(!currentTree){
    peopleList.innerHTML = `<div class="empty">Create a tree first</div>`;
    adminTreePreview.innerHTML = "";
    return;
  }

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

  /* Father / Mother: people in this tree, excluding the person being edited */
  inTree.filter(p=>p.id!==editPersonId).forEach(p=>{
    let target = p.gender === "female" ? pMother : pFather;
    target.innerHTML += `<option value="${p.id}">${escapeHtml(p.name)}</option>`;
  });
  /* Spouse: ANYONE globally, excluding self, excluding people already married to someone else */
  Object.entries(peopleData).forEach(([id,p])=>{
    if(id === editPersonId) return;
    if(p.spouse && p.spouse !== editPersonId) return; // already taken
    let label = p.name + (treeNamesFor(p) ? " (" + treeNamesFor(p) + ")" : "");
    pSpouse.innerHTML += `<option value="${id}">${escapeHtml(label)}</option>`;
  });

  /* existing-person linker offers everyone NOT already in this tree */
  notInTree.forEach(p=>{
    existingPersonSelect.innerHTML += `<option value="${p.id}">${escapeHtml(p.name)} (${escapeHtml(treeNamesFor(p))})</option>`;
  });

  renderPeopleList(inTree);
  renderAdminTreePreview(inTree);
}

function renderPeopleList(inTree){

  let query = (pSearch ? pSearch.value : "").toLowerCase().trim();

  let filtered = inTree
    .filter(p => !query || p.name.toLowerCase().includes(query))
    .sort((a,b)=> a.name.localeCompare(b.name));

  if(filtered.length === 0){
    peopleList.innerHTML = `<div class="empty">No people found</div>`;
    return;
  }

  peopleList.innerHTML = filtered.map(p=>{

    let treeCount = p.trees ? Object.keys(p.trees).length : 1;

    return `
      <div class="card">
        <h3>${escapeHtml(p.name)} <small style="color:#94a3b8;font-weight:400">(${p.gender}${p.order ? ", order " + p.order : ""})</small></h3>
        <div>Father: ${p.father ? escapeHtml(resolveName(p.father) || "—") : "No Father"}</div>
        <div>Mother: ${p.mother ? escapeHtml(resolveName(p.mother) || "—") : "No Mother"}</div>
        <div>Spouse: ${p.spouse ? escapeHtml(resolveName(p.spouse) || "—") : "No Spouse"}</div>
        ${treeCount > 1 ? `<span class="badge badge-upcoming" style="margin-top:8px">In ${treeCount} trees</span>` : ""}
        <div class="btn-row">
          <button class="primary-btn" onclick="editPerson('${p.id}')">Edit</button>
          <button class="danger-btn" onclick="removeFromTree('${p.id}')">Remove from Tree</button>
        </div>
      </div>
    `;
  }).join("");
}

/* REMOVE FROM TREE — only deletes the person entirely if this was their last tree */
function removeFromTree(id){

  let p = peopleData[id];
  if(!p) return;

  let treeIds = p.trees ? Object.keys(p.trees) : [];

  if(treeIds.length <= 1){
    if(!confirm(`${p.name} will be permanently deleted (this is their only tree). Continue?`)) return;
    db.ref("people/"+id).remove();
    if(p.spouse && peopleData[p.spouse] && peopleData[p.spouse].spouse === id){
      db.ref("people/"+p.spouse+"/spouse").remove();
    }
    showToast("Person Deleted");
  } else {
    if(!confirm(`Remove ${p.name} from this tree only? They will remain in their other tree(s).`)) return;
    db.ref("people/"+id+"/trees/"+currentTree).remove();
    showToast("Removed from this tree");
  }
}

/* ===========================
   🌳 LIVE PREVIEW RENDERER
   (mirrors the public tree logic, so what you see here is
   exactly what the family sees on the public site)
=========================== */

function relationLabelAdmin(person){

  let parts = [];

  if(person.father && peopleData[person.father]){
    let word = person.gender === "female" ? "D/O" : "S/O";
    parts.push(`${word} ${escapeHtml(peopleData[person.father].name)}`);
  }
  if(person.mother && peopleData[person.mother]){
    parts.push(`Mother: ${escapeHtml(peopleData[person.mother].name)}`);
  }
  if(person.spouse && peopleData[person.spouse]){
    parts.push(`Spouse: ${escapeHtml(peopleData[person.spouse].name)}`);
  }

  return parts.join("<br>");
}

function sortByOrder(list){
  return list.slice().sort((a,b)=>{
    let ao = (a.order===null||a.order===undefined) ? Infinity : a.order;
    let bo = (b.order===null||b.order===undefined) ? Infinity : b.order;
    if(ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name);
  });
}

/* ===========================
   GENERATION ENGINE (mirrors home.html)
   A married-in spouse with no father in this tree attaches to their
   partner's generation instead of floating as a false root.
=========================== */

function computeLevel(id, map, cache, visiting){

  if(cache.has(id)) return cache.get(id);

  let p = map[id];
  if(!p) return 0;

  if(visiting.has(id)) return 0;

  visiting.add(id);

  let lvl;

  if(p.father && map[p.father]){
    lvl = computeLevel(p.father, map, cache, visiting) + 1;
  } else if(p.spouse && map[p.spouse]){
    lvl = computeLevel(p.spouse, map, cache, visiting);
  } else {
    lvl = 0;
  }

  visiting.delete(id);
  cache.set(id, lvl);

  return lvl;
}

function computeSortKey(id, map, cache){

  if(cache.has(id)) return cache.get(id);

  let p = map[id];
  if(!p) return "";

  let pad = n => String(n===null||n===undefined?9999:n).padStart(5,"0");

  let key;

  if(p.father && map[p.father]){
    key = computeSortKey(p.father, map, cache) + "." + pad(p.order);
  } else if(p.spouse && map[p.spouse] && map[p.spouse].father && map[map[p.spouse].father]){
    key = computeSortKey(p.spouse, map, cache) + "-s";
  } else {
    key = pad(p.order);
  }

  cache.set(id, key);
  return key;
}

function buildFamilyUnits(people){

  let map = {};
  people.forEach(p=> map[p.id] = p);

  let levelCache = new Map();
  people.forEach(p=> computeLevel(p.id, map, levelCache, new Set()));

  let sortCache = new Map();
  let sorted = people.slice().sort((a,b)=>
    computeSortKey(a.id, map, sortCache).localeCompare(computeSortKey(b.id, map, sortCache))
  );

  let consumed = new Set();
  let units = [];

  sorted.forEach(person=>{

    if(consumed.has(person.id)) return;
    consumed.add(person.id);

    let lvl = levelCache.get(person.id) || 0;
    let spouse = null;

    if(person.spouse && map[person.spouse] && !consumed.has(person.spouse) &&
       levelCache.get(person.spouse) === lvl){
      spouse = map[person.spouse];
      consumed.add(spouse.id);
    }

    units.push({ mainPerson: person, spouse, level: lvl, children: [] });
  });

  units.forEach(u=>{

    u.children = units.filter(cu=>{
      let cp = cu.mainPerson;
      return cp.father === u.mainPerson.id || (u.spouse && cp.father === u.spouse.id);
    });

    u.children.sort((a,b)=>{
      let ao = (a.mainPerson.order===null||a.mainPerson.order===undefined) ? Infinity : a.mainPerson.order;
      let bo = (b.mainPerson.order===null||b.mainPerson.order===undefined) ? Infinity : b.mainPerson.order;
      if(ao !== bo) return ao - bo;
      return a.mainPerson.name.localeCompare(b.mainPerson.name);
    });
  });

  let roots = units.filter(u=> u.level === 0);

  roots.sort((a,b)=>
    computeSortKey(a.mainPerson.id, map, sortCache).localeCompare(computeSortKey(b.mainPerson.id, map, sortCache))
  );

  return roots;
}

function renderAdminBranchHtml(unit){

  let person = unit.mainPerson;
  let spouse = unit.spouse;
  let shared = person.trees && Object.keys(person.trees).length > 1;

  let childrenHtml = unit.children.length
    ? `<div class="children-row">${unit.children.map(renderAdminBranchHtml).join("")}</div>`
    : "";

  return `
    <div class="branch">
      <div class="family-unit">
        <div id="person-${person.id}" class="person-card ${shared?'shared-person':''}">
          ${shared ? `<div class="shared-badge">Shared</div>` : ""}
          <div class="person-name">${escapeHtml(person.name)}</div>
          <div class="person-meta">${relationLabelAdmin(person)}</div>
        </div>
        ${spouse ? `
          <div class="spouse-link"></div>
          <div id="person-${spouse.id}" class="person-card spouse-card">
            <div class="person-name">${escapeHtml(spouse.name)}</div>
            <div class="person-meta">${relationLabelAdmin(spouse)}</div>
          </div>
        ` : ""}
      </div>
      ${childrenHtml}
    </div>
  `;
}

function renderAdminTreePreview(inTree){

  if(!inTree || inTree.length === 0){
    adminTreePreview.innerHTML = `<div class="empty">No people in this tree yet</div>`;
    return;
  }

  let roots = buildFamilyUnits(inTree);

  let html = `
    <div class="tree-wrapper">
      <div class="tree-area">
        <svg class="tree-svg" id="adminTreeSVG"></svg>
        <div class="tree-root-row">
          ${roots.map(renderAdminBranchHtml).join("")}
        </div>
      </div>
    </div>
  `;

  adminTreePreview.innerHTML = html;

  setTimeout(()=>drawAdminTreeLines(inTree), 100);
}

function drawAdminTreeLines(inTree){

  let svg = document.getElementById("adminTreeSVG");
  if(!svg) return;

  svg.innerHTML = "";

  let svgRect = svg.getBoundingClientRect();

  document.querySelectorAll("#adminTreePreview .family-unit").forEach(unit=>{

    let cards = unit.querySelectorAll(".person-card");
    if(cards.length === 0) return;

    let firstRect = cards[0].getBoundingClientRect();
    let lastRect = cards[cards.length-1].getBoundingClientRect();

    let centerX = (firstRect.left + lastRect.right) / 2 - svgRect.left;
    let centerY = firstRect.bottom - svgRect.top;

    let mainId = cards[0].id.replace("person-","");
    let spouseId = cards.length > 1 ? cards[1].id.replace("person-","") : null;

    inTree.forEach(child=>{

      if(child.father !== mainId && child.father !== spouseId) return;

      let childCard = document.getElementById("person-"+child.id);
      if(!childCard) return;

      let childRect = childCard.getBoundingClientRect();
      let childX = childRect.left + childRect.width/2 - svgRect.left;
      let childY = childRect.top - svgRect.top;
      let midY = (centerY + childY) / 2;

      svg.innerHTML += `<path d="M ${centerX} ${centerY} V ${midY} H ${childX} V ${childY}" class="connector-line"/>`;
    });
  });
}

let adminResizeTimer = null;
window.addEventListener('resize', ()=>{
  clearTimeout(adminResizeTimer);
  adminResizeTimer = setTimeout(()=>{
    if(currentTree) renderPeopleUI();
  }, 200);
});

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
