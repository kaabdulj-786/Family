const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "..."
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let trees={}, people={};

function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
showSection("tree");

/* TREE LOAD */
db.ref("trees").on("value", s=>{
  trees=s.val()||{};
  loadTrees();
});

db.ref("people").on("value", s=>{
  people=s.val()||{};
  loadPeople();
  renderPreview();
});

/* CREATE TREE */
function createTree(){
  let name=treeName.value;
  if(!name) return alert("Enter name");

  let id=Date.now();
  db.ref("trees/"+id).set({name});

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
  let id=Date.now();

  db.ref("people/"+id).set({
    name:pName.value,
    tree:pTree.value,
    father:pFather.value,
    spouse:pSpouse.value,
    gender:pGender.value
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
      <button onclick="deletePerson('${id}')">X</button>
    </div>`;

    pFather.innerHTML+=`<option value="${id}">${people[id].name}</option>`;
    pSpouse.innerHTML+=`<option value="${id}">${people[id].name}</option>`;
  }
}

/* DELETE */
function deletePerson(id){
  db.ref("people/"+id).remove();
}

/* PREVIEW TREE */
function renderPreview(){
  let html="";
  let arr=Object.entries(people);

  arr.forEach(([id,p])=>{
    html+=`<div class="person">${p.name}</div>`;
  });

  treePreview.innerHTML=html;
}
