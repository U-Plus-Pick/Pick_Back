# Pick_Back
# U+Pick Backend

## 개요

LG U+ 맞춤 요금제 추천, 결합 할인 매칭, 챗봇 및 결제 관리를 담당하는 Node.js + Express 기반 백엔드 서버입니다.  
MongoDB를 데이터베이스로 사용하며 RESTful API와 Socket.IO 기반 실시간 채팅을 제공합니다.

---

## 주요 기능

- 사용자 인증 및 회원관리 (JWT 기반)
- 요금제, 결합 파티, 결제 관련 API 제공
- AI 챗봇 메시지 저장 및 스트리밍 처리
- 자동 결제 정산 처리 로직 구현
- MongoDB를 활용한 데이터 모델링 및 조회 최적화

---

## 기술 스택

| 구분     | 기술                                      |
|----------|-------------------------------------------|
| 서버     | Node.js, Express                         |
| 데이터베이스 | MongoDB, Mongoose                       |
| 실시간   | Socket.IO                                |
| 인증     | JWT (jsonwebtoken)                      |
| 기타     | dotenv, bcrypt (비밀번호 해싱), cors    |

---

## 디렉터리 구조

````

📦 backend/
├── config/          # DB 연결 및 환경 설정
├── controllers/     # 비즈니스 로직 함수 모음
├── middleware/      # 인증, 에러 핸들링 등 미들웨어
├── models/          # MongoDB 스키마 정의
├── routes/          # API 라우터 정의
├── services/        # 서비스 레이어
├── utils/           # 유틸 함수
├── app.js           # Express 앱 초기화 및 라우터 연결
├── server.js        # 서버 진입점
├── .env             # 환경 변수
├── package.json     # 백엔드 의존성 관리
└── README.md        # 백엔드 설명서

````

---

## 설치 및 실행

```bash
npm install
npm run dev      # nodemon으로 개발 서버 실행
````

---

## 주요 API 엔드포인트

* `POST /api/users/register` : 회원가입
* `POST /api/users/login` : 로그인
* `GET /api/plans` : 요금제 목록 조회
* `POST /api/parties/join` : 결합 파티 가입 요청
* `GET /api/chatbot` : 챗봇 메시지 송수신
* 기타 자세한 내용은 API 문서 참고

---

## 참고

* DB 스키마 및 ERD는 Notion 링크 참고
* 코드 스타일은 ESLint, Prettier 규칙에 따름

````
