// .env 파일 읽는 코드
require('dotenv').config();
// mysql2 가져오기
const mysql = require('mysql2');
// Node.js에서 MYSQL로 연결할 정보 설정(.env를 이용해 비밀번호를 깃에 올라가지 않게 분리)
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.log('DB 연결 실패');
    console.log(err);
    return;
  }

  console.log('DB 연결 성공');
});

module.exports = connection;