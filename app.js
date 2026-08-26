// 설치한 Express 가져오기
const express = require('express');
// Express 를 이용해 웹 서버 만들가
const app = express();
// 서버가 사용할 포트
const PORT = 3000;
// 브라우저에서 http://localhost:3000/ 로 들어오면 무엇을 보여줄지 정함
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/main.html');
});
// 서버를 켜는 코드
app.listen(PORT, () => {
  console.log(`서버 실행중 : http:localhost:${PORT}`)
});