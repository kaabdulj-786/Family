const firebaseConfig = {
apiKey: "AIzaSyB4KiyI-vapW5rvY-VNKTHELfmkO3H4D0M",
authDomain: "family-6889b.firebaseapp.com",
databaseURL: "https://family-6889b-default-rtdb.firebaseio.com",
projectId: "family-6889b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// TEST
console.log("JS Loaded");

// MOWLID SAVE
function saveMowlid(){
const name = document.getElementById("mName").value;
const days = document.getElementById("mDays").value;
const start = document.getElementById("mStart").value;

db.ref("mowlid").set({
name: name,
days: days,
start: start
});

generateTabarruk(days, start);

alert("Mowlid Saved");
}

// TABARRUK GENERATE
function generateTabarruk(days, start){
const container = document.getElementById("tabarrukList");
container.innerHTML = "";

let s = new Date(start);

for(let i=0;i<days;i++){
let d = new Date(s);
d.setDate(d.getDate()+i);

```
let div = document.createElement("div");
div.innerHTML = "Day " + (i+1) + " - " + d.toDateString();

let input = document.createElement("input");
input.placeholder = "Name";

div.appendChild(input);
container.appendChild(div);
```

}
}

// SAVE TABARRUK
function saveTabarruk(){
const inputs = document.querySelectorAll("#tabarrukList input");
let data = {};

inputs.forEach((inp,i)=>{
data["day"+(i+1)] = inp.value;
});

db.ref("tabarruk").set(data);

alert("Tabarruk Saved");
}

// ADD BIRTHDAY
function addBirthday(){
let id = Date.now();

db.ref("birthdays/"+id).set({
name: document.getElementById("bName").value,
date: document.getElementById("bDate").value
});
}

// SHOW BIRTHDAYS
db.ref("birthdays").on("value", snap=>{
const list = document.getElementById("birthdayList");
list.innerHTML = "";

let data = snap.val();
for(let i in data){
let p = document.createElement("p");
p.innerText = data[i].name;
list.appendChild(p);
}
});

// ADD ANNOUNCEMENT
function addAnnouncement(){
let id = Date.now();

db.ref("announcements/"+id).set({
text: document.getElementById("aText").value,
from: document.getElementById("aFrom").value,
to: document.getElementById("aTo").value
});
}

// SHOW ANNOUNCEMENTS
db.ref("announcements").on("value", snap=>{
const list = document.getElementById("announcementList");
list.innerHTML = "";

let data = snap.val();
for(let i in data){
let p = document.createElement("p");
p.innerText = data[i].text;
list.appendChild(p);
}
});
