// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyB4KiyI-vapW5rvY-VNKTHELfmkO3H4D0M",
  authDomain: "family-6889b.firebaseapp.com",
  databaseURL: "https://family-6889b-default-rtdb.firebaseio.com",
  projectId: "family-6889b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* =======================
   SECTION SWITCH
======================= */
function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
showSection("mowlid");

/* =======================
   🕌 MOWLID
======================= */
function saveMowlid(){
  db.ref("mowlid").set({
    name: mName.value,
    days: parseInt(mDays.value),
    start: mStart.value
  });

  generateTabarruk(mDays.value, mStart.value);
  showToast("Mowlid Saved");
}

function deleteMowlid(){
  db.ref("mowlid").remove();
  db.ref("tabarruk").remove();

  mName.value="";
  mDays.value="";
  mStart.value="";
  tabarrukList.innerHTML="";

  showToast("Deleted");
}

db.ref("mowlid").on("value", snap=>{
  let d = snap.val();
  if(!d) return;

  mName.value = d.name;
  mDays.value = d.days;
  mStart.value = d.start;

  generateTabarruk(d.days, d.start);
});

/* =======================
   🍽 TABARRUK
======================= */
function generateTabarruk(days,start){
  tabarrukList.innerHTML="";
  let s = new Date(start);

  for(let i=0;i<days;i++){
    let d = new Date(s);
    d.setDate(d.getDate()+i);

    tabarrukList.innerHTML+=`
    <div class="card">
      Day ${i+1} - ${d.toDateString()}<br>
      <input placeholder="Name">
      <input placeholder="Remarks">
    </div>`;
  }
}

function saveTabarruk(){
  let data = {};
  let cards = tabarrukList.children;

  for(let i=0;i<cards.length;i++){
    let inputs = cards[i].querySelectorAll("input");

    data["day"+(i+1)] = {
      name: inputs[0].value,
      remarks: inputs[1].value
    };
  }

  db.ref("tabarruk").set(data);
  showToast("Saved");
}

/* =======================
   🌳 TREE SYSTEM
======================= */
let trees = {}, people = {};

db.ref("trees").on("value", s=>{
  trees = s.val() || {};
  loadTrees();
});

db.ref("people").on("value", s=>{
  people = s.val() || {};
  loadPeople();
});

/* CREATE TREE */
function createTree(){
  let id = Date.now();
  db.ref("trees/"+id).set({name: treeName.value});
  treeName.value="";
}

/* LOAD TREES */
function loadTrees(){
  treeSelect.innerHTML="";
  pTree.innerHTML="";

  for(let id in trees){
    treeSelect.innerHTML+=`<option value="${id}">${trees[id].name}</option>`;
    pTree.innerHTML+=`<option value="${id}">${trees[id].name}</option>`;
  }
}

/* ADD PERSON */
function addPerson(){
  let id = Date.now();

  db.ref("people/"+id).set({
    name: pName.value,
    tree: pTree.value,
    father: pFather.value,
    spouse: pSpouse.value
  });

  pName.value="";
}

/* LOAD PEOPLE */
function loadPeople(){
  peopleList.innerHTML="";
  pFather.innerHTML='<option value="">No Father</option>';
  pSpouse.innerHTML='<option value="">No Spouse</option>';

  for(let id in people){
    peopleList.innerHTML+=`
    <div class="card">
      ${people[id].name}
      <button onclick="deletePerson('${id}')">Delete</button>
    </div>`;

    pFather.innerHTML+=`<option value="${id}">${people[id].name}</option>`;
    pSpouse.innerHTML+=`<option value="${id}">${people[id].name}</option>`;
  }
}

function deletePerson(id){
  db.ref("people/"+id).remove();
}

/* =======================
   🔔 TOAST
======================= */
function showToast(msg){
  let t = document.getElementById("toast");
  t.innerText = msg;
  t.style.display = "block";
  setTimeout(()=>t.style.display="none",2000);
}
