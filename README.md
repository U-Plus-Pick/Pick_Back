![image](https://github.com/user-attachments/assets/36e40504-633a-47c9-a790-07bd92c9e027)

> 당신의 U+, 당신만의 AI

# U+Pick (유플픽) - LG U+ 맞춤형 요금제 추천 & 결합 할인 플랫폼

**U+Pick**은 LG U+ 고객을 위한 **AI 기반 맞춤 요금제 추천**, **지인 결합 할인 매칭**, **위치 기반 멤버십 혜택 안내**를 통합 제공하는 플랫폼입니다.  
고객의 통신 서비스 경험을 향상시키고 **실질적인 비용 절감 및 편리함**을 목표로 합니다.

---

## 📅 프로젝트 기간

**2025.06.09 ~ 2025.06.27**

---

## 👨‍💻 팀원 소개

### 🔧 백엔드 담당

<table>
  <tr>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/110558148?v=4" width="100" /><br/>
      <strong>한여준</strong><br/>
      <a href="https://github.com/Hanyeojun">@Hanyeojun</a>
    </td>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/63743294?v=4" width="100" /><br/>
      <strong>임재찬</strong><br/>
      <a href="https://github.com/alex8396">@alex8396</a>
    </td>
  </tr>
</table>

### 💻 프론트엔드 담당

<table>
  <tr>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/101700659?v=4" width="100" /><br/>
      <strong>최영준</strong><br/>
      <a href="https://github.com/udwns310">@udwns310</a>
    </td>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/88296511?v=4" width="100" /><br/>
      <strong>이예은</strong><br/>
      <a href="https://github.com/yeeun426">@yeeun426</a>
    </td>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/180901036?v=4" width="100" /><br/>
      <strong>박용규</strong><br/>
      <a href="https://github.com/yonggyu99">@yonggyu99</a>
    </td>
  </tr>
</table>

---

## 🔗 관련 링크

- [🔗 프론트엔드 Repo](https://github.com/U-Plus-Pick/Pick_Front)
- [🔗 백엔드 Repo](https://github.com/U-Plus-Pick/Pick_Back)
- [🔗 프로젝트 Notion](https://wonderful-dewberry-9d0.notion.site/04-U-Pick-206796e7580e80cf8e1cefc9df8d4c23?source=copy_link)
- [🔗 최종 시안 Figma](https://www.figma.com/design/qaATYVnUNOeFKnJQU6mdX2/U-Pick?node-id=0-1&p=f&t=FEsA1aEdVqXb2dNQ-0)
---

# 🛠️ U+Pick Backend

## 개요

LG U+ 맞춤 요금제 추천, 결합 할인 매칭, 챗봇 및 결제 관리를 담당하는 **Node.js + Express 기반 백엔드 서버**입니다.  
MongoDB를 데이터베이스로 사용하며, RESTful API와 Socket.IO 기반 실시간 챗봇 통신을 제공합니다.

---

## 주요 기능

- JWT 기반 사용자 인증 및 회원관리
- 요금제, 결합 파티, 결제 관련 API 제공
- AI 챗봇 메시지 저장 및 실시간 스트리밍 처리
- MongoDB를 활용한 데이터 모델링 및 조회 최적화

---

## 기술 스택

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)

---

## 디렉터리 구조

📦 backend/
├── config/          # DB 연결 및 환경 설정
├── controllers/     # 비즈니스 로직 함수 모음
├── middleware/      # 인증, 에러 핸들링 등 미들웨어
├── models/          # MongoDB 스키마 정의
├── routes/          # API 라우터 정의
├── services/        # 서비스 레이어 (비즈니스 규칙)
├── utils/           # 유틸 함수
├── app.js           # Express 앱 초기화 및 라우터 연결
├── server.js        # 서버 진입점 (Express 실행)
├── .env             # 환경 변수
├── package.json     # 백엔드 의존성 관리
└── README.md        # 백엔드 설명서


---

## 실행 방법
npm install
npm run dev

주요 API 엔드포인트
메서드	URL	설명
POST	/api/users/register	회원가입
POST	/api/users/login	로그인
GET	/api/plans	요금제 목록 조회
POST	/api/parties/join	결합 파티 가입 요청
GET	/api/chatbot	챗봇 메시지 송수신

📌 더 자세한 API 설명은 Swagger 혹은 API 명세 문서 참고

참고 사항
데이터 모델 및 ERD는 Notion 문서 참고
ESLint, Prettier 기반 코드 스타일 적용
