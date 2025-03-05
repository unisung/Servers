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

app.get('/book', function(req, res){
    res.send('도서 목록 관련 페이지입니다.');
});
app.get('/welcome', function(req, res){
  res.send('<html><body> <h1>/welcome<h1> <marquee>사용자님 환영합니다!.<marquee/></body></html>');
});


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
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
    res.send("데이타 추가 성공");
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
app.get('/content', function(req, res){
  res.render('content.ejs');
});
