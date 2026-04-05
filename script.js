const firebaseConfig = {
  apiKey: "AIzaSyB4KiyI-vapW5rvY-VNKTHELfmkO3H4D0M",
  authDomain: "family-6889b.firebaseapp.com",
  databaseURL: "https://family-6889b-default-rtdb.firebaseio.com",
  projectId: "family-6889b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* SECTION */
function showSection(id){
document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
document.getElementById(id).classList.add("active");
}
showSection("mowlid");

/* TOAST */
function toast(t){
let x=document.getElementById("toast");
x.innerText=t;x.style.display="block";
setTimeout(()=>x.style.display="none",2000);
}

/* MOWLID */
function saveMowlid(){
db.ref("mowlid").set({name:mName.value,days:+mDays.value,start:mStart.value});
generateTabarruk();
toast("Saved");
}

function generateTabarruk(){
let d=+mDays.value;
let s=new Date(mStart.value);
tabarrukList.innerHTML="";
for(let i=0;i<d;i++){
let dt=new Date(s);dt.setDate(dt.getDate()+i);
tabarrukList.innerHTML+=`<div class="card">Day ${i+1} ${dt.toDateString()}
<input><input></div>`;
}
}

function saveTabarruk(){
let data={},cards=tabarrukList.children;
for(let i=0;i<cards.length;i++){
let inp=cards[i].querySelectorAll("input");
data["day"+(i+1)]={name:inp[0].value,remarks:inp[1].value};
}
db.ref("tabarruk").set(data);
toast("Saved");
}

/* BIRTHDAY */
function addBirthday(){
let id=Date.now();
db.ref("birthdays/"+id).set({name:bName.value,dob:bDate.value});
}

/* ANN */
function addAnn(){
let id=Date.now();
db.ref("announcements/"+id).set({
title:aTitle.value,text:aText.value,from:aFrom.value,to:aTo.value
});
}

/* TREE */
function createTree(){
db.ref("trees/"+Date.now()).set({name:treeName.value});
}

function addPerson(){
db.ref("people/"+Date.now()).set({
name:pName.value,tree:pTree.value,father:pFather.value,spouse:pSpouse.value
});
}
