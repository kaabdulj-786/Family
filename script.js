const firebaseConfig = {
  apiKey: "AIzaSyB4KiyI-vapW5rvY-VNKTHELfmkO3H4D0M",
  authDomain: "family-6889b.firebaseapp.com",
  databaseURL: "https://family-6889b-default-rtdb.firebaseio.com",
  projectId: "family-6889b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
showSection("mowlid");


// 🔹 MOWLID
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
}

db.ref("mowlid").on("value", snap=>{
  let d = snap.val();
  if(!d) return;

  mowlidDisplay.innerHTML =
    `<div class="card"><b>${d.name}</b><br>${d.days} Days</div>`;
});


// 🔹 TABARRUK
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
}


// 🔹 BIRTHDAYS
function addBirthday(){
  let id = Date.now();

  db.ref("birthdays/"+id).set({
    name: bName.value,
    dob: bDate.value
  });
}

db.ref("birthdays").on("value", snap=>{
  birthdayList.innerHTML = "";
  let data = snap.val();

  for(let i in data){
    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      ${data[i].name}
      <button onclick="deleteBirthday('${i}')">Delete</button>
    `;

    birthdayList.appendChild(div);
  }
});

function deleteBirthday(id){
  db.ref("birthdays/"+id).remove();
}


// 🔹 ANNOUNCEMENTS
function addAnnouncement(){
  let id = Date.now();

  db.ref("announcements/"+id).set({
    title: aTitle.value,
    text: aText.value,
    from: aFrom.value,
    to: aTo.value
  });
}

function getStatus(from,to){
  let now = new Date();
  if(now < new Date(from)) return "Upcoming";
  if(now > new Date(to)) return "Expired";
  return "Active";
}

db.ref("announcements").on("value", snap=>{
  announcementList.innerHTML = "";
  let data = snap.val();

  for(let i in data){
    let status = getStatus(data[i].from, data[i].to);

    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>${data[i].title}</b> (${status})<br>
      ${data[i].text}
      <button onclick="deleteAnnouncement('${i}')">Delete</button>
    `;

    announcementList.appendChild(div);
  }
});

function deleteAnnouncement(id){
  db.ref("announcements/"+id).remove();
}


// 🔹 FAMILY TREE (BASE)
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

function addPerson(){
  let id = Date.now();

  db.ref("people/"+id).set({
    name: pName.value,
    father: pFather.value,
    spouse: pSpouse.value,
    gender: pGender.value
  });
}
