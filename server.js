//환경 변수 설정
const dotenv = require('dotenv').config();

// 몽고디비 연결
const mongoclient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;

const express = require('express');
const app = express();
const mysql2 = require('mysql2');
const sha = require('sha256');

app.set('view engine', 'ejs'); //ejs 뷰 엔진 사용


//body-parser 라이브러리(미들웨어) 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); //json 형식의 데이터를 받기 위한 설정
//정적파일(css, js, image) 위치 설정 -> 아래 설정 후static 폴더 생성하기
app.use(express.static('public'));


//라우터 추가
app.use('/', require('./routes/post.js'));
app.use('/', require('./routes/add.js'));
//app.use('/', require('./routes/auth.js'));


// process.env.환경변수명
const url = process.env.DB_URL;

let mydb; // 데이터베이스 객체 참조변수 선언

mongoclient.connect(url).then((client)=>{
  mydb = client.db('myboard');
  app.listen(process.env.PORT, function(){
    console.log("포트 번호 8081으로 서버 대기중 ... ")
  });
}).catch((err)=>{
   console.log("DB 접속 오류", err);
});



const conn = mysql2.createConnection({

    host:process.env.HOST,
    user:process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

conn.connect(function(err){
    if(err){
        console.log("접속 오류", err);
        return;
    }
    console.log("접속 성공");
});



app.get('/book', function(req, res){
    res.send('도서 목록 관련 페이지입니다.');
});
app.get('/welcome', function(req, res){
  res.send('<html><body> <h1>/welcome<h1> <marquee>사용자님 환영합니다!.<marquee/></body></html>');
});


app.get('/', function(req, res){
    // res.sendFile(__dirname + '/index.html');
    res.render('index.ejs', {user:null});
});
        



//const ObjId = require('mongodb').ObjectId; 

//클라이언트에서 ajax로 localhost:8080/delete 요청에 대한 처리 루틴
app.post("/delete", function(req, res){
  console.log("1:",req.body._id);

  if (!req.body._id || !ObjId.isValid(req.body._id)) {
   console.log('2.error: ',"유효하지 않은 ID 값입니다." );
  }
 //몽고디비의 _id값으로 id객체 생성하기
  req.body._id = new ObjId(req.body._id);
  console.log('3.삭제할 번호:', req.body); //삭제할 번호

  //삭제할 데이터의 _id값을 이용하여 삭제
  mydb.collection("post").deleteOne({_id:req.body._id}).then((result)=>{
    console.log("삭제완료", result);//4.삭제완료
    //클라이언트에게 응답
    res.status(200).send(); //ok
  }).catch((err)=>{
    console.log("삭제실패", err);
    res.status(500).send(); //server error
  });
});

// '/content' 요청에 대한 처리 루틴
app.get('/content/:id', function(req, res){
  // 파라미터로 전달된 id값 출력
  console.log("id:", req.params.id);

  //몽고디비의 _id값으로 id객체 생성하기
  req.params.id = new ObjId(req.params.id);
  //_id에 해당하는 내용 조회
  mydb.collection("post").findOne({_id:req.params.id}).then((result)=>{
    console.log("조회완료", result);
    //ejs파일을 이용하여 데이터 전송
    res.render('content.ejs', {data:result});
  }).catch((err)=>{
    console.log("조회실패", err);
  });
});

//이미지 경로 저장 변수
let imagepath = '';

//수정페이지
app.get("/edit/:id", function(req, res){
   req.params.id = new ObjId(req.params.id);
   mydb.collection("post").findOne({_id:req.params.id}).then((result)=>{
     console.log("조회완료", result);
     res.render('edit.ejs', {data:result});
   });
});
//수정처리
app.post("/edit",function(req,res){
  console.log(req.body);
  req.body.id = new ObjId(req.body.id);
  mydb.collection("post").updateOne(
    {_id:req.body.id},
    {$set:{title:req.body.title, 
           content:req.body.content, 
           date:req.body.someDate,
          path:imagepath}}
     ).then((result)=>{
    console.log("수정완료", result);
    res.redirect("/list"); //목록페이지로 이동
  }).catch((err)=>{
    console.log("수정실패", err);
  });
});

let cookieParser = require('cookie-parser');
app.use(cookieParser('ncvka0e39842kpfd'));

app.get('/cookie', function(req, res){
  let milk = parseInt(req.signedCookies.milk)+ 1000;
  if(isNaN(milk)){
    milk=0;
  }
  //res.cookie('milk', '1000원'); //response객체에 실어서 브라우저로 전달
  res.cookie('milk', milk, {signed : true }); //response객체에 실어서 브라우저로 전달
  //res.send('product :' +req.cookies.milk);//요청을 받으면 request로 넘어옴
  res.send("product : " + milk+"원");
});

let session = require('express-session');
app.use(session({
  secret : 'dkufe8938493j4e08349u',
  resave : false,
  saveUninitialized : true
}));

app.get('/session', function(req, res){
  if(isNaN(req.session.milk)){
    req.session.milk = 0;
  }
  req.session.milk += 1000;
  res.send("product : " + req.session.milk+"원");
});

//로그인 폼페이지 요청
app.get("/login", function(req, res){
  if(req.session.userid){
    console.log("세션 유지");
    //res.send("이미 로그인 되어있습니다.");
    res.render('index.ejs', {user : req.session.user});
  }else{
    res.render("login.ejs"); //로그인 페이지로 이동
  }
});

//로그인 처리 요청
app.post("/login", function(req, res){
  console.log("아이디 :" + req.body.userid);
  console.log("비밀번호 :" + req.body.userpw);

 // 몽고디비에서 데이터 조회
 mydb.collection("account").findOne({userid:req.body.userid}).then((result)=>{
  //id가 db에 존지하지않을 경우 발생하는 오류 처리 로직 추가
   if(!result){ // id에 해당하는 데이타가 없는 경우 null 처리
      res.send("아이디가 존재하지 않습니다.");
   }else if(result.userpw == sha(req.body.userpw)){ //id와 비번 둘다 맞는 경우
    req.session.userid = req.body; //세션에 로그인 정보 저장
    console.log('새로운 로그인')
    //res.send("로그인 되었습니다.");
    res.render('index.ejs', {user : req.session.userid});
   }else{
    res.send("비밀번호가 일치하지 않습니다."); //id는 맞고, 비번이 틀린 겨우
   }
 });
});

app.get("/logout", function(req, res){
  console.log("로그아웃");
  req.session.destroy(); //세션 삭제
  //res.redirect("/"); //메인페이지로 이동 (index.ejs)
  res.render('index.ejs', {user:null});
});

//회원가입 폼페이지 요청
app.get('/signup',function(req,res){
  res.render('signup.ejs');
});
//회원가입 처리 요청
app.post('/signup',function(req,res){
  console.log(req.body.userid);
  console.log(sha(req.body.userpw));
  console.log(req.body.usergroup);
  console.log(req.body.useremail);
  //몽고디비에 데이터 저장
  mydb.collection('account').insertOne({
    userid:req.body.userid,
    userpw:sha(req.body.userpw),
    usergroup:req.body.usergroup,
    useremail:req.body.useremail
  }).then((result)=>{
    console.log("저장완료-회원가입 성공", result);
   });
   res.render('index.ejs', {user:null});
  });


  //검색요청 기능
  app.get('/search', function(req, res){
    console.log(req.query); // 127.0.0.1:8080/search?value=서시 로 넘어온 값,query속성에서 구함.
    //몽고디비에서 데이터 조회
    mydb.collection("post").find({title:req.query.value}).toArray().then((result)=>{
      console.log(result);
      //검색결과 페이지로 이동
      res.render("sresult.ejs", {data:result});
     });
  });