// 설치한 Express 가져오기
const express = require('express');
const db = require('./db');

// Express 를 이용해 웹 서버 만들가
const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

// 서버가 사용할 포트
const PORT = 3000;
// 브라우저에서 http://localhost:3000/--- 로 들어오면 무엇을 보여줄지 정함
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/main.html');
});
app.get('/rooms', (req, res) => {
  // res.sendFile(__dirname + '/views/rooms.html');
  // 레슨방 목록 불러오기.
  const sql = 'SELECT * FROM lesson_rooms';

  db.query(sql, (err, rooms) => {

    if (err) {
      console.log(err);
      return res.send('레슨방 목록 불러오기 실패');
    }

    console.log(rooms);
    res.render('rooms', {
      rooms: rooms
    });
  });
});


// 레슨방 정보 저장
app.post('/rooms', (req, res) => {
  // console.log(req.body);

  // res.send('레슨방 정보 전달 완료.')
  const {
    room_name,
    coach_name,
    start_time,
    end_time,
    capacity,
    lesson_fee
  } = req.body;

  let days = req.body.days;
  //  요일은 배열로 들어오기 때문에 문자열로 바꿔줘야함.
  //  요일 하나만 선택시 그냥 문자로 오기때문에 배열인지 확인.
  if (Array.isArray(days)) {
    days = days.join(',');
  }

  const sql = `
  INSERT INTO lesson_rooms
    (room_name, coach_name, days, start_time, end_time, capacity, lesson_fee)
  VALUES(?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      room_name,
      coach_name,
      days,
      start_time,
      end_time,
      capacity,
      lesson_fee
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.send('레슨방 등록 실패');
      }
      console.log('레슨방 등록 성공');
      // 레슨방 생성 성공후 다시 rooms 로 돌아가기
      res.redirect('/rooms');
    }
  );
});

// 레슨방 수정
// 수정할 방 불러오기
app.get('/rooms/:id/edit', (req, res) => {
  const id = req.params.id;

  const sql = 'SELECT * FROM lesson_rooms WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.send('레슨방 정보 불러오기 실패');
    }

    res.render('room-edit', {
      room: result[0]
    });
  });
});
// 방 수정하기
app.post('/rooms/:id/edit', (req, res) => {

  const id = req.params.id;

  const {
    room_name,
    coach_name,
    days,
    start_time,
    end_time,
    capacity,
    lesson_fee
  } = req.body;

  const sql = `
  UPDATE lesson_rooms
  SET
  room_name = ?,
  coach_name = ?,
  days = ?,
  start_time = ?,
  end_time = ?,
  capacity = ?,
  lesson_fee = ?
  WHERE id = ?
  `;
  db.query(
    sql,
    [
      room_name,
      coach_name,
      days,
      start_time,
      end_time,
      capacity,
      lesson_fee,
      id
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.send('레슨방 수정 실패');
      }
      console.log('레슨방 수정 성공');
      res.redirect('/rooms');
    }
  )
})


// 서버를 켜는 코드
app.listen(PORT, () => {
  console.log(`서버 실행중: http: localhost:${PORT} `)
});