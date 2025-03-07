var router = require('express').Router();

const mongoclient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectId;
// process.env.환경변수명
const url = process.env.DB_URL;

let mydb; // 데이터베이스 객체 참조변수 선언

mongoclient.connect(url).then((client)=>{
  mydb = client.db(process.env.DATABASE);
}).catch((err)=>{
   console.log("DB 접속 오류", err);
});

//localhost:127.0.0.1:8080/list 요청에 대한 처리 루틴
  // 데이터 조회 query("SQL문", 콜백함수(err,rows,fields){})
  router.get("/list",function(req,res){
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

  module.exports = router;