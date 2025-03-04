const http = require('http') // Importing the http module

const hostname = '127.0.0.1';
const port = 3000;

// Creating a server - createServer((요청변수, 응답변수)=>{}) method
const server = http.createServer((req, res)=>{
    res.statusCode = 200;     // HTTP 상태 코드 - 200 : 성공
    res.setHeader('Content-Type', 'text/plain'); // 헤더 설정
    res.end('Hello World\n'); // 응답 데이터
}); // Creating a server

server.listen(port, hostname, ()=>{
    console.log(`Server running at ${hostname}:${port}/`);
}); // 서버 실행

