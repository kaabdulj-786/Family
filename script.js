// 🔥 FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyB4KiyI-vapW5rvY-VNKTHELfmkO3H4D0M",
  authDomain: "family-6889b.firebaseapp.com",
  databaseURL: "https://family-6889b-default-rtdb.firebaseio.com",
  projectId: "family-6889b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let editId = null;

/* =========================
   SECTION SWITCH
========================= */
function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
showSection("mowlid");

/* =========================
   TOAST
========================= */
function showToast(msg){
  let t = document.getElementById("toast");
  t.innerText = msg;
  t.style.display = "block";
  setTimeout(()=>t.style.display="none",2000);
}

/* =========================
   🕌 MOWLID
========================= */
function saveMowlid(){
  if(!mName.value || !mDays.value || !mStart.value){
    showToast("Fill all fields");
    return;
  }

  db.ref("mowlid").set({
    name: mName.value,
    days: parseInt(mDays.value),
    start: mStart.value
  });

  generateTabarruk(mDays.value, mStart.value);

  // RESET
  mName.value="";
  mDays.value="";
  mStart.value="";

  showToast("Mowlid Saved");
}

function deleteMowlid(){
  db.ref("mowlid").remove();
  mowlidDisplay.innerHTML="";
  tabarrukList.innerHTML="";
  showToast("Deleted");
}

db.ref("mowlid").on("value", snap=>{
  let d = snap.val();
  if(!d) return;

  mowlidDisplay.innerHTML = `
    <div class="card">
      <b>${d.name}</b><br>
      ${d.days} Days<br>
      <button onclick="deleteMowlid()">Delete</button>
    </div>
  `;

  generateTabarruk(d.days, d.start);
});

/* =========================
   🍽 TABARRUK
========================= */
function generateTabarruk(days,start){
  tabarrukList.innerHTML="";
  let s = new Date(start);

  for(let i=0;i<days;i++){
    let d = new Date(s);
    d.setDate(d.getDate()+i);

    let div = document.createElement("div");
    div.className="card";

    div.innerHTML=`
      Day ${i+1} - ${d.toDateString()}<br>
      <input placeholder="Name">
      <input placeholder="Remarks">
    `;

    tabarrukList.appendChild(div);
  }
}

function saveTabarruk(){
  let data={};
  let cards=tabarrukList.children;

  for(let i=0;i<cards.length;i++){
    let inputs=cards[i].querySelectorAll("input");

    data["day"+(i+1)]={
      name: inputs[0].value,
      remarks: inputs[1].value
    };
  }

  db.ref("tabarruk").set(data);
  showToast("Saved");
}

/* =========================
   🎂 BIRTHDAY
========================= */
function addBirthday(){
  let id = editId || Date.now();

  db.ref("birthdays/"+id).set({
    name: bName.value,
    dob: bDate.value
  });

  bName.value="";
  bDate.value="";
  editId=null;

  showToast("Saved");
}

db.ref("birthdays").on("value", snap=>{
  birthdayList.innerHTML="";
  let data=snap.val()||{};

  for(let i in data){
    let div=document.createElement("div");
    div.className="card";

    div.innerHTML=`
      ${data[i].name}
      <button onclick="editBirthday('${i}','${data[i].name}','${data[i].dob}')">Edit</button>
      <button onclick="deleteBirthday('${i}')">Delete</button>
    `;

    birthdayList.appendChild(div);
  }
});

function editBirthday(id,name,dob){
  editId=id;
  bName.value=name;
  bDate.value=dob;
}

function deleteBirthday(id){
  db.ref("birthdays/"+id).remove();
  showToast("Deleted");
}

/* =========================
   📢 ANNOUNCEMENTS
========================= */
function addAnnouncement(){
  let id = editId || Date.now();

  db.ref("announcements/"+id).set({
    title:aTitle.value,
    text:aText.value,
    from:aFrom.value,
    to:aTo.value
  });

  aTitle.value="";
  aText.value="";
  aFrom.value="";
  aTo.value="";
  editId=null;

  showToast("Saved");
}

db.ref("announcements").on("value", snap=>{
  announcementList.innerHTML="";
  let data=snap.val()||{};

  for(let i in data){
    let div=document.createElement("div");
    div.className="card";

    div.innerHTML=`
      <b>${data[i].title}</b><br>
      ${data[i].text}<br>
      <button onclick="editAnnouncement('${i}','${data[i].title}','${data[i].text}','${data[i].from}','${data[i].to}')">Edit</button>
      <button onclick="deleteAnnouncement('${i}')">Delete</button>
    `;

    announcementList.appendChild(div);
  }
});

function editAnnouncement(id,title,text,from,to){
  editId=id;
  aTitle.value=title;
  aText.value=text;
  aFrom.value=from;
  aTo.value=to;
}

function deleteAnnouncement(id){
  db.ref("announcements/"+id).remove();
  showToast("Deleted");
}

/* =========================
   🌳 FAMILY TREE (IMPROVED)
========================= */

let currentTree=null;
let allPeople={};

/* CREATE TREE */
function createTree(){
  if(!treeName.value){
    showToast("Enter name");
    return;
  }

  let id=Date.now();
  db.ref("trees/"+id).set({name:treeName.value});
  treeName.value="";
  showToast("Tree Created");
}

/* LOAD TREES */
db.ref("trees").on("value", snap=>{
  treeSelect.innerHTML="<option value=''>Select Tree</option>";
  let data=snap.val()||{};

  for(let i in data){
    let opt=document.createElement("option");
    opt.value=i;
    opt.innerText=data[i].name;
    treeSelect.appendChild(opt);
  }
});

/* TREE CHANGE */
treeSelect.onchange=()=>{
  currentTree=treeSelect.value;
  loadPeople();
};

/* LOAD ALL PEOPLE */
db.ref("people").on("value", snap=>{
  allPeople=snap.val()||{};
  loadPeople();
});

/* ADD PERSON */
function addPerson(){
  if(!currentTree){
    showToast("Select tree");
    return;
  }

  if(!pName.value){
    showToast("Enter name");
    return;
  }

  let id=Date.now();

  db.ref("people/"+id).set({
    name:pName.value.trim(),
    father:pFather.value,
    spouse:pSpouse.value,
    gender:pGender.value,
    tree:currentTree
  });

  // RESET FORM
  pName.value="";
  pFather.value="";
  pSpouse.value="";
  pGender.value="male";

  showToast("Added");
}

/* LOAD PEOPLE */
function loadPeople(){
  if(!currentTree) return;

  peopleList.innerHTML="";
  pFather.innerHTML=`<option value="">No Father</option>`;
  pSpouse.innerHTML=`<option value="">No Spouse</option>`;

  for(let id in allPeople){

    let p=allPeople[id];
    if(p.tree!==currentTree) continue;

    let duplicate=false;

    for(let x in allPeople){
      if(x!==id && allPeople[x].name===p.name && allPeople[x].tree!==currentTree){
        duplicate=true;
        break;
      }
    }

    let div=document.createElement("div");
    div.className="card";

    div.innerHTML=`
      <b>${p.name}</b>
      ${duplicate ? "<span class='link'>🔗 Linked</span>" : ""}
      <br>
      <small>${p.father?"Father set":""} ${p.spouse?"| Spouse set":""}</small>
      <br>
      <button onclick="deletePerson('${id}')">Delete</button>
    `;

    peopleList.appendChild(div);

    let opt=`<option value="${id}">${p.name}</option>`;
    pFather.innerHTML+=opt;
    pSpouse.innerHTML+=opt;
  }
}

/* DELETE */
function deletePerson(id){
  db.ref("people/"+id).remove();
  showToast("Deleted");
}
