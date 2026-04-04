alert("script loaded");
const firebaseConfig = {
apiKey: "AIzaSyB4KiyI-vapW5rvY-VNKTHELfmkO3H4D0M",
authDomain: "family-6889b.firebaseapp.com",
databaseURL: "https://family-6889b-default-rtdb.firebaseio.com",
projectId: "family-6889b",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// MOWLID
function saveMowlid(){
const name = mName.value;
const days = mDays.value;
const start = mStart.value;

db.ref("mowlid").set({name, days, start});
generateTabarruk(days, start);

alert("Saved");
}

// TABARRUK
function generateTabarruk(days, start){
tabarrukList.innerHTML = "";

let s = new Date(start);

for(let i=0;i<days;i++){
let d = new Date(s);
d.setDate(d.getDate()+i);

```
tabarrukList.innerHTML += `
  <div>
    Day ${i+1} - ${d.toDateString()}
    <input id="t${i}" placeholder="Name">
  </div>
`;
```

}
}

function saveTabarruk(){
let data = {};
let inputs = tabarrukList.querySelectorAll("input");

inputs.forEach((inp,i)=>{
data["day"+(i+1)] = inp.value;
});

db.ref("tabarruk").set(data);
alert("Saved");
}

// BIRTHDAY
function addBirthday(){
let id = Date.now();
db.ref("birthdays/"+id).set({
name: bName.value,
date: bDate.value
});
}

// SHOW BIRTHDAYS
db.ref("birthdays").on("value", snap=>{
birthdayList.innerHTML="";
let data = snap.val();
for(let i in data){
birthdayList.innerHTML += `<p>${data[i].name}</p>`;
}
});

// ANNOUNCEMENT
function addAnnouncement(){
let id = Date.now();
db.ref("announcements/"+id).set({
text: aText.value,
from: aFrom.value,
to: aTo.value
});
}

// SHOW ANNOUNCEMENT
db.ref("announcements").on("value", snap=>{
announcementList.innerHTML="";
let data = snap.val();
for(let i in data){
announcementList.innerHTML += `<p>${data[i].text}</p>`;
}
});

