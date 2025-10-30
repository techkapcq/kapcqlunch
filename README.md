# 점심 참여 웹앱 (kapcqlunch)

매일 해당 날짜에 점심 참여를 자율 등록하고 목록을 확인할 수 있는 간단한 웹앱입니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## Vercel 배포 (서버리스)

이 프로젝트는 로컬에서는 SQLite를 사용하지만, Vercel 서버리스 환경에서는 파일 시스템이 휘발성/읽기 전용이므로 Vercel KV(Upstash)를 사용합니다. 아래 환경 변수를 설정하세요.

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

설정 후 재배포하면 서버가 자동으로 KV 백엔드를 사용합니다. 패스코드와 당일 참여자 목록이 KV에 저장됩니다.

## 기능
- 오늘 날짜의 참여자 목록 표시
- 이름 입력으로 참여 등록
- 같은 날 같은 이름 중복 방지 (대소문자 무시)
- 내 이름 삭제 기능

## 기술 스택
- Express, EJS, better-sqlite3, Day.js

데이터 파일은 `src/storage/data.db` 에 생성됩니다.
