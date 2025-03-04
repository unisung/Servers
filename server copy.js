// 몽고디비 연결
const mongoclient = require('mongodb').MongoClient;
//const ObjId = require('mongodb').ObjectId;

// const url = "mongodb+srv://choimingdol77:0825@cluster0.aiw8d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
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
    //결과를 클라이언트에게 응답
    res.send("데이타 추가 성공");
});




// const { ObjectId } = require('mongodb');

// app.post("/delete", function(req, res) {
//     console.log("Received body:", req.body);

//     if (!req.body._id) {
//         console.log("error: _id is missing");
//         return res.status(400).send("삭제할 ID가 없습니다.");
//     }

//     if (!ObjectId.isValid(req.body._id)) {
//         console.log("Invalid ObjectId format:", req.body._id);
//         return res.status(400).send("잘못된 ObjectId 형식입니다.");
//     }

//     try {
//         const objectId = new ObjectId(req.body._id);
//         console.log("삭제할 번호:", objectId);
//         console.log("삭제 완료");

//         // 데이터베이스에서 해당 ID 삭제 처리 (추가 필요)

//         res.send("삭제 성공");
//     } catch (error) {
//         console.log("ObjectId 변환 오류:", error);
//         return res.status(400).send("잘못된 ObjectId입니다.");
//     }
// });
