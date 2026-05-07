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
function showSection(id){

  document.querySelectorAll(".section")
  .forEach(s=>s.classList.remove("active"));

  document.getElementById(id)
  .classList.add("active");
}

showSection("mowlid");

/* TOAST */
function showToast(text){

  let toast = document.getElementById("toast");

  toast.innerText = text;

  toast.style.display = "block";

  setTimeout(()=>{
    toast.style.display = "none";
  },2000);
}

/* ===========================
   🕌 MOWLID
=========================== */

function saveMowlid(){

  let data = {
    name : mName.value,
    days : parseInt(mDays.value),
    start : mStart.value
  };

  db.ref("mowlid").set(data);

  generateTabarruk(data.days,data.start);

  mName.value = "";
  mDays.value = "";
  mStart.value = "";

  showToast("Mowlid Saved");
}

function deleteMowlid(){

  db.ref("mowlid").remove();
  db.ref("tabarruk").remove();
  db.ref("mowlidStatus").remove();

  tabarrukList.innerHTML = "";
  mowlidPreview.innerHTML = "";

  showToast("Mowlid Deleted");
}

db.ref("mowlid").on("value",snap=>{

  let d = snap.val();

  if(!d){
    mowlidPreview.innerHTML = `
      <div class="card empty">
        No Mowlid Scheduled
      </div>
    `;
    return;
  }

  mowlidPreview.innerHTML = `
    <div class="card">
      <h3>${d.name}</h3>
      <div>${d.days} Days</div>
      <div>${d.start}</div>
    </div>
  `;

  generateTabarruk(d.days,d.start);
});

/* ===========================
   🍽️ TABARRUK
=========================== */

function generateTabarruk(days,start){

  tabarrukList.innerHTML = "";

  let s = new Date(start);

  for(let i=0;i<days;i++){

    let d = new Date(s);

    d.setDate(d.getDate()+i);

    tabarrukList.innerHTML += `

      <div class="card">

        <b>Day ${i+1}</b>

        <br><br>

        <small>${d.toDateString()}</small>

        <input placeholder="Name">

        <input placeholder="Remarks">

      </div>
    `;
  }
}

function saveTabarruk(){

  let data = {};

  let cards = tabarrukList.children;

  for(let i=0;i<cards.length;i++){

    let inputs = cards[i]
    .querySelectorAll("input");

    data["day"+(i+1)] = {
      name : inputs[0].value,
      remarks : inputs[1].value
    };
  }

  db.ref("tabarruk").set(data);

  showToast("Tabarruk Saved");
}

/* ===========================
   🎂 BIRTHDAY
=========================== */

function addBirthday(){

  let id = editBirthdayId || Date.now();

  db.ref("birthdays/"+id).set({
    name : bName.value,
    dob : bDate.value
  });

  bName.value = "";
  bDate.value = "";

  editBirthdayId = null;

  showToast("Birthday Saved");
}

db.ref("birthdays").on("value",snap=>{

  birthdayList.innerHTML = "";

  let data = snap.val() || {};

  for(let id in data){

    birthdayList.innerHTML += `

      <div class="card">

        <b>${data[id].name}</b>

        <br>

        ${data[id].dob}

        <br><br>

        <button class="primary-btn"
        onclick="editBirthday('${id}','${data[id].name}','${data[id].dob}')">
        Edit
        </button>

        <button class="primary-btn"
        onclick="deleteBirthday('${id}')">
        Delete
        </button>

      </div>
    `;
  }
});

function editBirthday(id,name,dob){

  editBirthdayId = id;

  bName.value = name;
  bDate.value = dob;
}

function deleteBirthday(id){

  db.ref("birthdays/"+id).remove();

  showToast("Birthday Deleted");
}

/* ===========================
   📢 ANNOUNCEMENTS
=========================== */

function addAnnouncement(){

  let id = editAnnouncementId || Date.now();

  db.ref("announcements/"+id).set({
    title : aTitle.value,
    text : aText.value,
    from : aFrom.value,
    to : aTo.value
  });

  aTitle.value = "";
  aText.value = "";
  aFrom.value = "";
  aTo.value = "";

  editAnnouncementId = null;

  showToast("Announcement Saved");
}

db.ref("announcements").on("value",snap=>{

  announcementList.innerHTML = "";

  let data = snap.val() || {};

  for(let id in data){

    announcementList.innerHTML += `

      <div class="card">

        <b>${data[id].title}</b>

        <br><br>

        ${data[id].text}

        <br><br>

        <small>
          ${data[id].from}
          →
          ${data[id].to}
        </small>

        <br><br>

        <button class="primary-btn"
        onclick="editAnnouncement(
          '${id}',
          '${data[id].title}',
          '${data[id].text}',
          '${data[id].from}',
          '${data[id].to}'
        )">
          Edit
        </button>

        <button class="primary-btn"
        onclick="deleteAnnouncement('${id}')">
          Delete
        </button>

      </div>
    `;
  }
});

function editAnnouncement(id,title,text,from,to){

  editAnnouncementId = id;

  aTitle.value = title;
  aText.value = text;
  aFrom.value = from;
  aTo.value = to;
}

function deleteAnnouncement(id){

  db.ref("announcements/"+id).remove();

  showToast("Announcement Deleted");
}
