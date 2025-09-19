// === Seed Admin ===
if(!localStorage.getItem("admin")){
  localStorage.setItem("admin", JSON.stringify({user:"admin",pass:"admin123"}));
}

// === LOGIN ===
function login(){
  const role = document.getElementById("role").value;
  const id   = document.getElementById("username").value;
  const pw   = document.getElementById("password").value;

  if(role==="admin"){
    let a = JSON.parse(localStorage.getItem("admin"));
    if(id===a.user && pw===a.pass){
      window.location='admin.html';
    }else alert("Wrong admin ID/password");
  }else{
    let list = JSON.parse(localStorage.getItem("students")||"[]");
    let s = list.find(x=>x.id===id && x.pass===pw);
    if(s){ localStorage.setItem("currentStudent",id); location.reload();}
    else alert("Invalid student");
  }
}

// === Student Panel ===
window.addEventListener("load",()=>{
  const panel=document.getElementById("student-panel");
  if(panel){
    let id=localStorage.getItem("currentStudent");
    if(id){
      let list=JSON.parse(localStorage.getItem("students")||"[]");
      let s=list.find(x=>x.id===id);
      if(s){
        document.getElementById("welcome").innerText=`Welcome, ${s.name}`;
        const tbl=document.getElementById("student-info");
        tbl.innerHTML=`<tr><th>ID</th><td>${s.id}</td></tr>
                       <tr><th>Name</th><td>${s.name}</td></tr>`;
      }
    }
  }
});

// === Admin: add/delete ===
function addStudent(){
  let list=JSON.parse(localStorage.getItem("students")||"[]");
  list.push({id:studId.value,name:studName.value,pass:studPass.value,att:{}});
  localStorage.setItem("students",JSON.stringify(list));
  alert("Student Added");
  renderStudentList();
}

function renderStudentList(){
  const tbl=document.getElementById("studentList");
  if(!tbl) return;
  let list=JSON.parse(localStorage.getItem("students")||"[]");
  tbl.innerHTML="<tr><th>ID</th><th>Name</th><th>Action</th></tr>"+
    list.map((s,i)=>`<tr><td>${s.id}</td><td>${s.name}</td>
    <td><button onclick="delStudent(${i})">Delete</button></td></tr>`).join("");
}
function delStudent(i){
  let list=JSON.parse(localStorage.getItem("students")||"[]");
  list.splice(i,1);
  localStorage.setItem("students",JSON.stringify(list));
  renderStudentList();
}
renderStudentList();

// === QR Scanner ===
function startScanner(){
  if(!document.getElementById("preview")) return;
  const video=document.getElementById("preview");
  navigator.mediaDevices.getUserMedia({
    video:{ facingMode:{ exact:"environment" } }
  }).then(stream=>video.srcObject=stream);

  const html5QrCode = new Html5Qrcode("preview");
  html5QrCode.start(
    { facingMode:"environment" },
    { fps:10, qrbox:250 },
    (decoded)=>{
       document.getElementById("result").innerText="Scanned: "+decoded;
       markAttendance(decoded);
    }
  );
}

function markAttendance(data){
  let [sub,date]=data.split("|");
  let id=localStorage.getItem("currentStudent");
  let list=JSON.parse(localStorage.getItem("students")||"[]");
  let s=list.find(x=>x.id===id);
  if(!s.att[sub]) s.att[sub]={};
  s.att[sub][date]=true;
  localStorage.setItem("students",JSON.stringify(list));
  alert(`Attendance marked for ${sub} on ${date}`);
}

// === QR Generator ===
function generateQR(){
  const sub=document.getElementById("subject").value;
  const dt=document.getElementById("date").value;
  const teacher=document.getElementById("teacher").value;
  const text=`${sub}|${dt}|${teacher}`;
  QRCode.toCanvas(document.getElementById('qrcode'), text, function (error) {
    if (error) console.error(error)
  });
}
