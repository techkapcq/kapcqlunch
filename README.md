# 점심 참여 웹앱 (kapcqlunch)

매일 해당 날짜에 점심 참여를 자율 등록하고 목록을 확인할 수 있는 간단한 웹앱입니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 기능
- 오늘 날짜의 참여자 목록 표시
- 이름 입력으로 참여 등록
- 같은 날 같은 이름 중복 방지 (대소문자 무시)
- 내 이름 삭제 기능

## 기술 스택
- Express, EJS, better-sqlite3, Day.js

데이터 파일은 `src/storage/data.db` 에 생성됩니다.
