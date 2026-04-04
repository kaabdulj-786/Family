const firebaseConfig = {
  apiKey: "AIzaSyB4KiyI-vapW5rvY-VNKTHELfmkO3H4D0M",
  authDomain: "family-6889b.firebaseapp.com",
  databaseURL: "https://family-6889b-default-rtdb.firebaseio.com",
  projectId: "family-6889b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let editId = null;

// SECTION SWITCH
function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
showSection("mowlid");

// TOAST
function showToast(msg){
  let t = document.getElementById("toast");
  t.innerText = msg;
  t.style.display = "block";
  setTimeout(()=>t.style.display="none",2000);
}

// 🕌 MOWLID
function saveMowlid(){
  const name = mName.value;
  const days = parseInt(mDays.value);
  const start = mStart.value;

  if(!name || !days || !start){
    alert("Fill all fields");
    return;
  }

  db.ref("mowlid").set({name, days, start});
  generateTabarruk(days, start);

  showToast("Mowlid Saved");
}

function deleteMowlid(){
  db.ref("mowlid").remove();

  // CLEAR UI
  mName.value = "";
  mDays.value = "";
  mStart.value = "";
  mowlidDisplay.innerHTML = "";
  tabarrukList.innerHTML = "";

  showToast("Mowlid Deleted");
}

db.ref("mowlid").on("value", snap=>{
  let d = snap.val();
  if(!d) return;

  mName.value = d.name;
  mDays.value = d.days;
  mStart.value = d.start;

  mowlidDisplay.innerHTML = `
    <div class="card">
      <b>${d.name}</b><br>
      ${d.days} Days
      <br><button onclick="deleteMowlid()">Delete</button>
    </div>
  `;

  generateTabarruk(d.days, d.start);
});

// 🍽 TABARRUK
function generateTabarruk(days, start){
  tabarrukList.innerHTML = "";

  let s = new Date(start);

  for(let i=0;i<days;i++){
    let d = new Date(s);
    d.setDate(d.getDate()+i);

    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      Day ${i+1} - ${d.toDateString()}<br>
      <input placeholder="Name">
      <input placeholder="Remarks">
    `;

    tabarrukList.appendChild(div);
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
  showToast("Tabarruk Saved");
}

// 🎂 BIRTHDAY
function addBirthday(){
  let id = editId || Date.now();

  db.ref("birthdays/"+id).set({
    name: bName.value,
    dob: bDate.value
  });

  editId = null;
  showToast("Saved");
}

db.ref("birthdays").on("value", snap=>{
  birthdayList.innerHTML = "";
  let data = snap.val();

  for(let i in data){
    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      ${data[i].name}
      <button onclick="editBirthday('${i}','${data[i].name}','${data[i].dob}')">Edit</button>
      <button onclick="deleteBirthday('${i}')">Delete</button>
    `;

    birthdayList.appendChild(div);
  }
});

function editBirthday(id,name,dob){
  editId = id;
  bName.value = name;
  bDate.value = dob;
}

function deleteBirthday(id){
  db.ref("birthdays/"+id).remove();
  showToast("Deleted");
}

// 📢 ANNOUNCEMENTS
function addAnnouncement(){
  let id = editId || Date.now();

  db.ref("announcements/"+id).set({
    title: aTitle.value,
    text: aText.value,
    from: aFrom.value,
    to: aTo.value
  });

  editId = null;
  showToast("Saved");
}

db.ref("announcements").on("value", snap=>{
  announcementList.innerHTML = "";
  let data = snap.val();

  for(let i in data){
    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>${data[i].title}</b><br>
      ${data[i].text}
      <button onclick="editAnnouncement('${i}','${data[i].title}','${data[i].text}','${data[i].from}','${data[i].to}')">Edit</button>
      <button onclick="deleteAnnouncement('${i}')">Delete</button>
    `;

    announcementList.appendChild(div);
  }
});

function editAnnouncement(id,title,text,from,to){
  editId = id;
  aTitle.value = title;
  aText.value = text;
  aFrom.value = from;
  aTo.value = to;
}

function deleteAnnouncement(id){
  db.ref("announcements/"+id).remove();
  showToast("Deleted");
}

// 🌳 FAMILY TREE
let currentTree = null;

function createTree(){
  let id = Date.now();
  db.ref("trees/"+id).set({name: treeName.value});
}

db.ref("trees").on("value", snap=>{
  treeSelect.innerHTML = "";
  let data = snap.val();

  for(let i in data){
    let opt = document.createElement("option");
    opt.value = i;
    opt.innerText = data[i].name;
    treeSelect.appendChild(opt);
  }
});

treeSelect.onchange = ()=>{
  currentTree = treeSelect.value;
  loadPeople();
};

function addPerson(){
  if(!currentTree){
    alert("Select tree");
    return;
  }

  let id = Date.now();

  db.ref("people/"+id).set({
    name: pName.value,
    father: pFather.value,
    spouse: pSpouse.value,
    gender: pGender.value,
    tree: currentTree
  });

  showToast("Person Added");
}

function loadPeople(){
  db.ref("people").on("value", snap=>{
    peopleList.innerHTML = "";
    pFather.innerHTML = `<option value="">No Father</option>`;
    pSpouse.innerHTML = `<option value="">No Spouse</option>`;

    let data = snap.val();

    for(let i in data){
      if(data[i].tree !== currentTree) continue;

      let div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <b>${data[i].name}</b>
        <button onclick="deletePerson('${i}')">Delete</button>
      `;

      peopleList.appendChild(div);

      let opt = `<option value="${i}">${data[i].name}</option>`;
      pFather.innerHTML += opt;
      pSpouse.innerHTML += opt;
    }
  });
}

function deletePerson(id){
  db.ref("people/"+id).remove();
  showToast("Deleted");
}
