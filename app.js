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

// 메인화면
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

// 회원등록 화면
app.get('/members', (req, res) => {
  //res.render('members');
  const sql = 'SELECT * FROM members ORDER BY id DESC';

  db.query(sql, (err, members) => {

    if (err) {
      console.log(err);
      return res.send('회원 목록 불러오기 실패');
    }

    res.render('members', {
      members: members
    });

  });

});

// 회원 정보 수정
app.get('/members/:id/edit', (req, res) => {

  const id = req.params.id;

  const sql = 'SELECT * FROM members WHERE id = ?';

  db.query(sql, [id], (err, result) => {

    if (err) {
      console.log(err);
      return res.send('회원 정보 불러오기 실패');
    }

    res.render('member-edit', {
      member: result[0]
    });

  });

});

app.post('/members/:id/edit', (req, res) => {

  const id = req.params.id;

  const {
    name,
    birth,
    gender,
    phone,
    status,
    memo
  } = req.body;

  const sql = `
    UPDATE members
    SET
      name = ?,
      birth = ?,
      gender = ?,
      phone = ?,
      status = ?,
      memo = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      name,
      birth,
      gender,
      phone,
      status,
      memo,
      id
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.send('회원 수정 실패');
      }

      console.log('회원 수정 성공!');

      res.redirect('/members');
    }
  );

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


// 회원 등록 코드
app.post('/members', (req, res) => {

  const {
    name,
    birth,
    gender,
    phone,
    memo
  } = req.body;

  const sql = `
  INSERT INTO members
  (name, birth, gender, phone, status, joined_date, memo)
  VALUES (?, ?, ?, ?, 'ACTIVE', CURDATE(), ?)
  `;

  db.query(
    sql,
    [
      name,
      birth,
      gender,
      phone,
      memo
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.send('회원등록 실패');
      }
      console.log('회원 등록 성공');
      console.log(result);

      res.redirect('/members');
    }
  );
});

// 레슨방별 조회
app.get('/lesson-members', (req, res) => {

  const {
    year,
    month,
    lesson_room_id
  } = req.query;

  const roomSql = `
    SELECT *
    FROM lesson_rooms
    ORDER BY room_name
  `;

  const memberSql = `
    SELECT *
    FROM members
    ORDER BY name
  `;

  let lessonMemberSql = `
    SELECT
      lm.id,
      lm.year,
      lm.month,
      lm.lesson_room_id,
      lm.member_id,

      m.name AS member_name,
      m.birth,
      m.gender,
      m.status,

      lr.room_name,
      lr.coach_name,

      (
      SELECT COALESCE(SUM(co.carry_count), 0)
      FROM carry_overs co
      WHERE co.member_id = lm.member_id
      AND co.lesson_room_id = lm.lesson_room_id
      AND co.to_year = lm.year
      AND co.to_month = lm.month
    ) AS carry_count

    FROM lesson_members lm

    JOIN members m
      ON lm.member_id = m.id

    JOIN lesson_rooms lr
      ON lm.lesson_room_id = lr.id

    WHERE 1 = 1
  `;

  const params = [];

  if (year) {
    lessonMemberSql += ' AND lm.year = ?';
    params.push(year);
  }

  if (month) {
    lessonMemberSql += ' AND lm.month = ?';
    params.push(month);
  }

  if (lesson_room_id) {
    lessonMemberSql += ' AND lm.lesson_room_id = ?';
    params.push(lesson_room_id);
  }

  lessonMemberSql += `
    ORDER BY
      lm.year DESC,
      lm.month DESC,
      lr.room_name,
      m.name
  `;

  db.query(roomSql, (err, rooms) => {

    if (err) {
      console.log(err);
      return res.send('레슨방 목록 불러오기 실패');
    }

    db.query(memberSql, (err, members) => {

      if (err) {
        console.log(err);
        return res.send('회원 목록 불러오기 실패');
      }

      db.query(
        lessonMemberSql,
        params,
        (err, lessonMembers) => {

          if (err) {
            console.log(err);
            return res.send('레슨 명단 불러오기 실패');
          }

          res.render('lesson-members', {
            rooms: rooms,
            members: members,
            lessonMembers: lessonMembers,

            selectedYear: year || '',
            selectedMonth: month || '',
            selectedRoom: lesson_room_id || ''
          });

        }
      );

    });

  });

});

app.post('/lesson-members', (req, res) => {

  const {
    year,
    month,
    lesson_room_id,
    member_id
  } = req.body;

  const checkSql = `
    SELECT *
    FROM lesson_members
    WHERE lesson_room_id = ?
    AND member_id = ?
    AND year = ?
    AND month = ?
  `;

  db.query(
    checkSql,
    [
      lesson_room_id,
      member_id,
      year,
      month
    ],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.send('중복 확인 실패');
      }

      if (result.length > 0) {
        return res.send('이미 해당 월의 레슨방에 등록된 회원입니다.');
      }

      const insertSql = `
        INSERT INTO lesson_members
        (lesson_room_id, member_id, year, month)
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          lesson_room_id,
          member_id,
          year,
          month
        ],
        (err, result) => {

          if (err) {
            console.log(err);
            return res.send('레슨 회원 등록 실패');
          }

          const updateStatusSql = `
            UPDATE members
            SET status = 'ACTIVE'
            WHERE id = ?
            AND status = 'PAUSED'
          `;

          db.query(
            updateStatusSql,
            [member_id],
            (err, result) => {

              if (err) {
                console.log(err);
                return res.send('회원 상태 변경 실패');
              }

              console.log('레슨 회원 등록 성공!');

              res.redirect('/lesson-members');
            }
          );

        }
      );

    }
  );

});

app.post('/lesson-members/:id/delete', (req, res) => {

  const id = req.params.id;

  // 1. 삭제할 레슨 정보 먼저 찾기
  const findSql = `
    SELECT member_id, year, month
    FROM lesson_members
    WHERE id = ?
  `;

  db.query(findSql, [id], (err, rows) => {

    if (err) {
      console.log(err);
      return res.send('레슨 정보 확인 실패');
    }

    if (rows.length === 0) {
      return res.send('해당 레슨 등록 정보가 없습니다.');
    }

    // 중요: 여기서 변수에 저장
    const memberId = rows[0].member_id;
    const lessonYear = rows[0].year;
    const lessonMonth = rows[0].month;


    // 2. 해당 월의 레슨 등록 삭제
    const deleteSql = `
      DELETE FROM lesson_members
      WHERE id = ?
    `;

    db.query(deleteSql, [id], (err, result) => {

      if (err) {
        console.log(err);
        return res.send('레슨 명단 제외 실패');
      }


      // 3. 현재 연도 / 월 확인
      const today = new Date();

      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;


      // 과거 또는 미래 명단이면 회원 상태 변경하지 않음
      if (
        Number(lessonYear) !== currentYear ||
        Number(lessonMonth) !== currentMonth
      ) {

        return res.redirect('/lesson-members');

      }


      // 4. 현재 달에 다른 레슨방이 남아있는지 확인
      const checkSql = `
        SELECT COUNT(*) AS count
        FROM lesson_members
        WHERE member_id = ?
        AND year = ?
        AND month = ?
      `;

      db.query(
        checkSql,
        [
          memberId,
          lessonYear,
          lessonMonth
        ],
        (err, rows) => {

          if (err) {
            console.log(err);
            return res.send('회원 레슨 상태 확인 실패');
          }

          const lessonCount = rows[0].count;


          // 5. 현재 달 레슨이 하나도 없으면 휴식중
          if (lessonCount === 0) {

            const updateSql = `
              UPDATE members
              SET status = 'PAUSED'
              WHERE id = ?
            `;

            db.query(
              updateSql,
              [memberId],
              (err, result) => {

                if (err) {
                  console.log(err);
                  return res.send('회원 상태 변경 실패');
                }

                console.log('회원 상태가 휴식중으로 변경되었습니다.');

                res.redirect('/lesson-members');

              }
            );

          } else {

            console.log('다른 레슨방이 남아있어 ACTIVE 상태를 유지합니다.');

            res.redirect('/lesson-members');

          }

        }
      );

    });

  });

});

app.get('/carry-over/:id', (req, res) => {

  const id = req.params.id;

  const sql = `
    SELECT
      lm.id,
      lm.member_id,
      lm.lesson_room_id,
      lm.year,
      lm.month,

      m.name AS member_name,

      lr.room_name,
      lr.coach_name

    FROM lesson_members lm

    JOIN members m
      ON lm.member_id = m.id

    JOIN lesson_rooms lr
      ON lm.lesson_room_id = lr.id

    WHERE lm.id = ?
  `;

  db.query(sql, [id], (err, result) => {

    if (err) {
      console.log(err);
      return res.send('이월 정보 불러오기 실패');
    }

    if (result.length === 0) {
      return res.send('해당 레슨 정보를 찾을 수 없습니다.');
    }

    res.render('carry-over', {
      lesson: result[0]
    });

  });

});


app.post('/carry-over/:id', (req, res) => {

  const lessonMemberId = req.params.id;
  const carryCount = req.body.carry_count;

  // 1. 현재 레슨 등록 정보 찾기
  const findSql = `
    SELECT
      member_id,
      lesson_room_id,
      year,
      month
    FROM lesson_members
    WHERE id = ?
  `;

  db.query(findSql, [lessonMemberId], (err, rows) => {

    if (err) {
      console.log(err);
      return res.send('이월 대상 정보 확인 실패');
    }

    if (rows.length === 0) {
      return res.send('해당 레슨 정보를 찾을 수 없습니다.');
    }

    const memberId = rows[0].member_id;
    const lessonRoomId = rows[0].lesson_room_id;

    const fromYear = Number(rows[0].year);
    const fromMonth = Number(rows[0].month);


    // 2. 다음 달 계산
    let toYear = fromYear;
    let toMonth = fromMonth + 1;

    if (toMonth === 13) {
      toMonth = 1;
      toYear = fromYear + 1;
    }


    // 3. 이월 기록 저장
    const carrySql = `
      INSERT INTO carry_overs
      (
        member_id,
        lesson_room_id,
        from_year,
        from_month,
        to_year,
        to_month,
        carry_count
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      carrySql,
      [
        memberId,
        lessonRoomId,
        fromYear,
        fromMonth,
        toYear,
        toMonth,
        carryCount
      ],
      (err, result) => {

        if (err) {
          console.log(err);
          return res.send('이월 정보 저장 실패');
        }


        // 4. 다음 달 레슨 명단 자동 등록
        const lessonSql = `
          INSERT INTO lesson_members
          (
            lesson_room_id,
            member_id,
            year,
            month
          )
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            id = id
        `;

        db.query(
          lessonSql,
          [
            lessonRoomId,
            memberId,
            toYear,
            toMonth
          ],
          (err, result) => {

            if (err) {
              console.log(err);
              return res.send('다음 달 명단 자동 등록 실패');
            }

            console.log(
              `${fromYear}년 ${fromMonth}월 → ` +
              `${toYear}년 ${toMonth}월 ` +
              `${carryCount}회 이월 완료`
            );

            res.redirect(
              `/lesson-members?year=${toYear}&month=${toMonth}&lesson_room_id=${lessonRoomId}`
            );

          }
        );

      }
    );

  });

});


app.get('/carry-over-edit/:id', (req, res) => {

  const lessonMemberId = req.params.id;

  const sql = `
    SELECT
      co.id AS carry_id,
      co.carry_count,
      co.from_year,
      co.from_month,
      co.to_year,
      co.to_month,

      m.name AS member_name,

      lr.room_name,
      lr.coach_name

    FROM lesson_members lm

    JOIN carry_overs co
      ON co.member_id = lm.member_id
      AND co.lesson_room_id = lm.lesson_room_id
      AND co.to_year = lm.year
      AND co.to_month = lm.month

    JOIN members m
      ON lm.member_id = m.id

    JOIN lesson_rooms lr
      ON lm.lesson_room_id = lr.id

    WHERE lm.id = ?
  `;

  db.query(sql, [lessonMemberId], (err, rows) => {

    if (err) {
      console.log(err);
      return res.send('이월 정보 불러오기 실패');
    }

    if (rows.length === 0) {
      return res.send('이월 정보를 찾을 수 없습니다.');
    }

    res.render('carry-over-edit', {
      carry: rows[0]
    });

  });

});













// 서버를 켜는 코드
app.listen(PORT, () => {
  console.log(`서버 실행중: http: localhost:${PORT} `)
});