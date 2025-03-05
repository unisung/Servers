// 몽고디비 연결
const mongoclient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;

const url = "mongodb+srv://admin:123@mycluster1.gzupq.mongodb.net/?retryWrites=true&w=majority&appName=Mycluster1";

let mydb; // 데이터베이스 객체 참조변수 선언

mongoclient.connect(url).then((client)=>{
  mydb = client.db('myboard');
  app.listen(8081, function(){
    console.log("포트 번호 8081으로 서버 대기중 ... ")
  });
}).catch((err)=>{
   console.log("DB 접속 오류", err);
});


const express = require('express');
const app = express();
const mysql2 = require('mysql2');

const conn = mysql2.createConnection({

    host:"localhost",
    user:"root",
    password: "root",
    database: "myboard"
});

conn.connect(function(err){
    if(err){
        console.log("접속 오류", err);
        return;
    }
    console.log("접속 성공");
});

//body-parser 라이브러리(미들웨어) 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); //json 형식의 데이터를 받기 위한 설정

app.set('view engine', 'ejs'); //ejs 뷰 엔진 사용

//정적파일(css, js, image) 위치 설정 -> 아래 설정 후static 폴더 생성하기
app.use(express.static('public'));

app.get('/book', function(req, res){
    res.send('도서 목록 관련 페이지입니다.');
});
app.get('/welcome', function(req, res){
  res.send('<html><body> <h1>/welcome<h1> <marquee>사용자님 환영합니다!.<marquee/></body></html>');
});


app.get('/', function(req, res){
    // res.sendFile(__dirname + '/index.html');
    res.render('index.ejs');
});
        
//localhost:127.0.0.1:8080/list 요청에 대한 처리 루틴
  // 데이터 조회 query("SQL문", 콜백함수(err,rows,fields){})
app.get("/list",function(req,res){
  mydb.collection("post").find().toArray().then((result)=>{
     console.log(result);     
    //ejs파일을 이용하여 데이터 전송
   res.render('list.ejs', {data:result});

  }).catch((err)=>{
    console.log("데이터 조회 실패", err);
  });
   //client로 결과 페이지 전송
   //res.sendFile(__dirname + '/list.html');
});

// localhost:8080/enter 요청에 대한 처리 루틴
app.get('/enter', function(req, res){
  // res.sendFile(__dirname + '/enter.html');
  res.render('enter.ejs');
});

// localhost:8080/save 요청에 대한 처리 루틴
app.post('/save',function(req,res){
  console.log(req.body.title); // 입력한 제목
  console.log(req.body.content);  // 입력한 내용
  
  //MongoDB에 데이터 저장
mydb.collection("post").insertOne(
  {title:req.body.title, content: req.body.content, date:req.body.someDate}
).then((result)=>{
  console.log("저장완료", result);
});


  // //sql문 작성
  // let sql = "insert into post(title, content, created) values(?, ?, now())";
  // //바인딩변수 값 설정
  // let params = [req.body.title, req.body.content];
  // //쿼리 실행
  // conn.query(sql, params, function(err, result){
  //   if(err) throw err; //에러 발생시 예외객체 생성
  //   console.log("저장완료", result);


    //결과를 클라이언트에게 응답
    // res.send("데이타 추가 성공");
    res.redirect("/list"); //목록페이지로 이동
    

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
    {$set:{title:req.body.title, content:req.body.content, date:req.body.someDate}}
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
   }else if(result.userpw == req.body.userpw){ //id와 비번 둘다 맞는 경우
    req.session.userid = req.body; //세션에 로그인 정보 저장
    console.log('새로운 로그인')
    //res.send("로그인 되었습니다.");
    res.render('index.ejs', {user : req.session.user});
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