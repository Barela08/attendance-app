// ---------- Initial Data ----------
if (!localStorage.getItem("students")) {
  localStorage.setItem("students", JSON.stringify([
    {id:"stu01", name:"Demo Student", email:"demo@uni.com", dept:"CSE", pass:"123"}
  ]));
}
if (!localStorage.getItem("admin")) {
  localStorage.setItem("admin", JSON.stringify({user:"admin", pass:"admin123"}));
}

const subjects = ["Math","Physics","Chemistry","CSE","English","Elective"];

// ---------- Login ----------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", e=>{
    e.preventDefault();
    const u=document.getElementById("username").value;
    const p=document.getElementById("password").value;
    const r=document.getElementById("role").value;

    if (r==="admin") {
      let admin = JSON.parse(localStorage.getItem("admin"));
      if (u===admin.user && p===admin.pass) location.href="admin.html";
      else alert("Invalid Admin Credentials");
    } else {
      let stus = JSON.parse(localStorage.getItem("students"));
      let stu = stus.find(s=>s.id===u && s.pass===p);
      if (stu) {
        localStorage.setItem("currentStudent", stu.id);
        location.href="student.html";
      } else alert("Invalid Student Credentials");
    }
  });
}

// ---------- Student Dashboard ----------
if (location.pathname.endsWith("student.html")) {
  let stus = JSON.parse(localStorage.getItem("students"));
  let id = localStorage.getItem("currentStudent");
  let s = stus.find(x=>x.id===id);
  if (s) {
    document.getElementById("stuName").textContent = s.name;
    document.getElementById("stuId").textContent = s.id;
    document.getElementById("stuEmail").textContent = s.email;
    document.getElementById("stuDept").textContent = s.dept;
  }
}

// ---------- Admin Panel ----------
function renderStudents(){
  let tbody=document.querySelector("#studentTable tbody");
  if(!tbody) return;
  tbody.innerHTML="";
  JSON.parse(localStorage.getItem("students")).forEach((s,i)=>{
    tbody.innerHTML+=`<tr>
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td><button onclick="delStudent(${i})">Delete</button></td>
    </tr>`;
  });
}
function addStudent(){
  let stus=JSON.parse(localStorage.getItem("students"));
  let s={
    id:document.getElementById("newId").value,
    name:document.getElementById("newName").value,
    email:document.getElementById("newEmail").value,
    dept:document.getElementById("newDept").value,
    pass:document.getElementById("newPass").value,
    attendance:{}};
  subjects.forEach(sub=> s.attendance[sub]={present:0,total:0,dates:[]});
  stus.push(s);
  localStorage.setItem("students",JSON.stringify(stus));
  renderStudents();
}
function delStudent(i){
  let stus=JSON.parse(localStorage.getItem("students"));
  stus.splice(i,1);
  localStorage.setItem("students",JSON.stringify(stus));
  renderStudents();
}
if(location.pathname.endsWith("admin.html")) renderStudents();

// ---------- Attendance Table ----------
function renderAttendance(){
  let id = localStorage.getItem("currentStudent");
  let stus = JSON.parse(localStorage.getItem("students"));
  let s = stus.find(x=>x.id===id);
  if(!s.attendance){
    s.attendance={};
    subjects.forEach(sub=> s.attendance[sub]={present:0,total:0,dates:[]});
  }
  let tb=document.querySelector("#attTable tbody");
  if(tb){
    tb.innerHTML="";
    subjects.forEach(sub=>{
      let a=s.attendance[sub];
      let percent = a.total?((a.present/a.total)*100).toFixed(1):0;
      tb.innerHTML+=`<tr><td>${sub}</td><td>${a.present}</td><td>${a.total}</td><td>${percent}%</td></tr>`;
    });
  }
  localStorage.setItem("students",JSON.stringify(stus));
}

// ---------- QR Scanner ----------
if(document.getElementById("reader")){
  const html5QrCode = new Html5Qrcode("reader");
  Html5Qrcode.getCameras().then(devices=>{
    if(devices.length){
      html5QrCode.start(devices[0].id,
        {fps:10, qrbox:250},
        qr=>{
          try{
            let data=JSON.parse(qr);
            markAttendance(data.sub, data.date);
            alert(`Attendance marked for ${data.sub}`);
            html5QrCode.stop();
            renderAttendance();
          }catch(e){alert("Invalid QR");}
        });
    }
  });
}

function markAttendance(sub,date){
  let id = localStorage.getItem("currentStudent");
  let stus = JSON.parse(localStorage.getItem("students"));
  let s = stus.find(x=>x.id===id);
  if(!s.attendance[sub]) s.attendance[sub]={present:0,total:0,dates:[]};
  if(!s.attendance[sub].dates.includes(date)){
    s.attendance[sub].present++;
    s.attendance[sub].total++;
    s.attendance[sub].dates.push(date);
  }else{
    alert("Already marked for this date");
  }
  localStorage.setItem("students",JSON.stringify(stus));
}

if(location.pathname.endsWith("attendance.html")) renderAttendance();

// ---------- Logout ----------
function logout(){ location.href="index.html"; }
