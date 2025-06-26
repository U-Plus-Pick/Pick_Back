![image](https://github.com/user-attachments/assets/36e40504-633a-47c9-a790-07bd92c9e027)

> 당신의 U+, 당신만의 AI

# U+Pick (유플픽)
- LG U+ 맞춤형 AI 챗봇 & 결합 할인 & 위치 기반 멤버십 혜택 안내 플랫폼

**U+Pick**은 LG U+ 고객을 위한 **AI 기반 챗봇**, **지인 결합 할인 매칭**, **위치 기반 멤버십 혜택 안내**를 통합 제공하는 플랫폼입니다.  
고객의 통신 서비스 경험을 향상시키고 **실질적인 비용 절감 및 편리함**을 목표로 합니다.

---
# 💡 서비스 소개  
📱 플랫폼 이름  
U+Pick (유플픽)  

🤖 챗봇 이름  
UPI (U+ Personal Intelligence)  
<img src="https://github.com/user-attachments/assets/a13af22c-7738-4b16-bc73-d704c3c9058a" width="200"/>


🎯 목적  
LG U+ 이용 고객의 통신 서비스 경험을 향상시키기 위해, 다음과 같은 기능을 통합 제공하는 플랫폼을 구축하고자 합니다.

🧠 AI 기반 챗봇  
고객의 기본 정보와 이용 패턴을 바탕으로 적합한 요금제와 각 요금제에 포함된 주요 혜택을 안내하고 결합 할인과 멤버십 혜택에 대해 안내하는 AI 챗봇을 통해 사용자의 편의성을 높입니다.  

👥 지인 결합 할인 매칭 기능  
결합 할인 혜택을 받고자 하는 고객들이 플랫폼 내에서 함께 결합할 수 있도록 자동 매칭 기능을 제공하여,
지인을 직접 찾기 어려운 고객도 손쉽게 결합 할인을 활용할 수 있도록 지원합니다.

🗺️ 위치 기반 멤버십 혜택 안내  
사용자의 현재 위치를 기반으로,
주변 상권에서 사용할 수 있는 LG U+ 멤버십 혜택 정보를 지도 기반 시각화로 제공하여 혜택 활용도를 높입니다.

---

## 📅 프로젝트 기간

**2025.06.09 ~ 2025.06.27**

---

## 👨‍💻 팀원 소개

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

- JWT 기반 사용자 인증 및 회원관리 : Bcrypt를 이용한 비밀번호 해싱 및 안전한 사용자 정보 관리
- 다양한 API 제공: 요금제 조회, 결합 할인 계산, 멤버십 혜택 안내, 파티 리더 계좌 정보 및 서류 제출 관리 등 LG U+ 서비스 관련 API 제공  
- AI 챗봇 메시지 저장 및 실시간 스트리밍 처리 : OpenAI Function Calling을 활용한 백엔드 서비스 연동 및 Socket.IO 기반의 챗봇 응답 스트리밍 구현

---


## 기술 스택

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-800000?style=flat&logo=mongoose&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=json-web-tokens&logoColor=white)
![Bcrypt](https://img.shields.io/badge/Bcrypt-000000?style=flat&logo=bcrypt&logoColor=white)


---

## 디렉터리 구조

````
📦 backend/
├── config/          
├── data/
├── functions/  
├── middleware/      
├── models/      
├── routes/
├── schemas/     
├── services/        
├── utils/           
├── app.js         
├── server.js                     
├── package.json   
└── README.md        

````
---

## 실행 방법

```bash
npm install
node server.js
````



## 📌 주요 API 엔드포인트

| 기능 분류     | 메서드 | URL                               | 설명                                |
|---------------|--------|-----------------------------------|-------------------------------------|
| **사용자 관리** | POST   | `/api/users/register`             | 회원가입                            |
|               | POST   | `/api/users/signin`               | 로그인                              |
|               | GET    | `/api/users/me`                   | 내 정보 조회 (파티/신청 상태 포함)  |
|               | PATCH  | `/api/users/me/plan`              | 사용자 요금제 변경                  |
| **파티 관리**   | GET    | `/api/party/infor`                | 현재 참여 중인 파티 정보 조회       |
|               | POST   | `/api/party/apply`                | 파티 신청 (리더/멤버 역할 분기)     |
|               | POST   | `/api/party/leave`                | 파티 탈퇴                           |
| **챗봇 서비스** | POST   | `/api/chat/insert-messages`       | 챗봇 대화 메시지 저장               |
|               | GET    | `/api/chat/rooms`                 | 사용자의 채팅방 목록 조회           |
| **요금제 정보** | GET    | `/api/plans`                      | 모든 요금제 정보 조회               |
| **결제 관리**   | POST   | `/api/payments/leader`            | 파티 리더 계좌 정보 등록            |
|               | PATCH  | `/api/payments/leader/change`     | 파티 리더 계좌 정보 수정            |
| **서류 제출**   | POST   | `/api/party/documents`            | 파티 관련 서류 제출 (PDF 파일)      |
| **토스 결제 연동**| POST   | `/api/toss`                       | 토스 결제 정보 저장                 |

📌 더 자세한 API 설명은 Notion API 명세 문서 참고


## ERD TABLE  
1. 🧑‍🤝‍🧑 parties (결합 파티 테이블)
   
| 필드명                  | 타입          | 설명                            |
| -------------------- | ----------- | ----------------------------- |
| `party_id`           | BIGINT (PK) | 파티 고유 ID                      |
| `party_leader_email` | VARCHAR(50) | 파티장 이메일 (FK - users)          |
| `party_member_email` | JSON        | 파티원 이메일 리스트 (JSON 배열)         |
| `party_leader_name`  | VARCHAR(50) | 파티장 이름                        |
| `party_member_name`  | VARCHAR(50) | 파티원 이름 리스트 (JSON 배열)          |
| `party_status`       | ENUM        | 모집 상태 (`모집중`, `모집완료`, `해체` 등) |
| `created_at`         | DATETIME    | 파티 생성일                        |

가족/지인 결합 파티 정보를 담는 테이블.  
파티장과 멤버들의 이메일과 이름을 저장하고, 파티 상태(모집중, 모집완료, 해체)를 관리함.
멤버 이메일과 이름은 JSON 형태로 여러 명을 저장할 수 있음.

2. 👤 users (회원 테이블)

   
| 필드명             | 타입           | 설명                      |
| --------------- | ------------ | ----------------------- |
| `user_email`    | VARCHAR(50)  | 이메일 (PK)                |
| `user_name`     | VARCHAR(50)  | 사용자 이름                  |
| `user_password` | VARCHAR(255) | 암호화된 비밀번호               |
| `user_phone`    | VARCHAR(20)  | 휴대폰 번호                  |
| `user_birth`    | DATE         | 생년월일                    |
| `plans`         | VARCHAR(50)  | 가입한 요금제 이름 (FK - plans) |

사용자 계정 정보 저장 테이블.  
이메일과 전화번호는 고유해야 하며, 비밀번호는 암호화되어 저장됨.  
사용자가 가입한 요금제 이름도 저장.

3. 💸 payments (결제 계좌 테이블)

| 필드명                     | 타입           | 설명          |
| ----------------------- | ------------ | ----------- |
| `id`                    | INT (PK)     | 결제 정보 고유 ID |
| `leader_email`          | VARCHAR(50)  | 파티장 이메일     |
| `leader_name`           | VARCHAR(50)  | 파티장 이름      |
| `leader_bank_name`      | VARCHAR(100) | 파티장 은행명     |
| `leader_account_number` | VARCHAR(100) | 파티장 계좌번호    |

파티 리더의 정산 계좌 정보를 저장하는 테이블.  
결제 관련 서류 제출 및 정산에 사용됨.

4. 💬 chat_bot (채팅방 테이블)

| 필드명              | 타입          | 설명                   |
| ---------------- | ----------- | -------------------- |
| `chatroom_id`    | INT (PK)    | 채팅방 고유 ID            |
| `user_email`     | VARCHAR(50) | 사용자 이메일 (FK - users) |
| `started_at`     | DATETIME    | 채팅 시작 시각             |
| `ended_at`       | DATETIME    | 채팅 종료 시각             |
| `chat_message`   | JSON        | 채팅 메시지 (JSON 배열)     |
| `chatroom_title` | VARCHAR(30) | 채팅방 이름               |  

사용자의 챗봇 대화 기록을 저장하는 테이블.  
메시지 내용은 JSON 배열로 저장되어 대화 흐름을 관리.


5. 📱 plans (요금제 테이블)

| 필드명                    | 타입           | 설명          |
| ---------------------- | ------------ | ----------- |
| `plan_name`            | VARCHAR(200) | 요금제 이름 (PK) |
| `plan_monthly_fee`     | INT          | 월 요금        |
| `plan_data_count`      | INT          | 데이터 용량 (GB) |
| `plan_smart_benefit`   | TEXT         | 스마트 기기 혜택   |
| `plan_voice_minutes`   | INT          | 음성 통화량 (분)  |
| `plan_sms_count`       | INT          | 문자 수        |
| `plan_basic_benefit`   | TEXT         | 기본 혜택       |
| `plan_premium_benefit` | TEXT         | 프리미엄 혜택     |
| `plan_media_benefit`   | TEXT         | 미디어 혜택      |
| `bundle_benefit_id`    | INT          | 결합 할인 참조 ID |

LG U+에서 제공하는 다양한 요금제 정보를 저장.  
각 요금제별 혜택과 기본 정보가 포함됨.


6. 💳 toss_payments (토스 결제 테이블)


| 필드명                | 타입           | 설명                        |
| ------------------ | ------------ | ------------------------- |
| `id`               | INT (PK)     | 결제 ID                     |
| `user_email`       | VARCHAR(255) | 사용자 이메일                   |
| `toss_payment_key` | VARCHAR(255) | 토스 결제 키                   |
| `amount`           | INT          | 결제 금액                     |
| `payment_method`   | VARCHAR(50)  | 결제 수단 (카드, 가상계좌 등)        |
| `paid_status`      | ENUM         | 결제 상태 (`SUCCESS`, `FAIL`) |
| `paid_at`          | DATETIME     | 결제 시각                     |

토스 결제 시스템과 연동된 결제 내역을 저장.

7. 🎁 membership_benefits (멤버십 혜택 테이블)

| 필드명                      | 타입          | 설명                      |
| ------------------------ | ----------- | ----------------------- |
| `membership_tap`         | VARCHAR(10) | 혜택 구분 (`VIP 콕`, `기본`)   |
| `membership_brand`       | VARCHAR(30) | 제휴 브랜드명                 |
| `membership_description` | TEXT        | 혜택 설명                   |
| `membership_grade`       | VARCHAR(10) | 멤버십 등급 (`VIP`, `BASIC`) |

멤버십 등급별, 브랜드별 혜택 정보를 저장.


## ERD 관계 요약  
회원(user_email) 은 여러 파티(parties) 에 참여할 수 있고, 파티장 또는 멤버 역할을 가짐.  
파티(parties) 는 여러 결제(payments) 와 연결되어 파티 리더의 정산 정보를 관리.  
회원(user_email) 은 여러 채팅방(chat_bot) 을 가질 수 있음.  
회원(user_email) 은 여러 파티 신청(party_applicant) 을 할 수 있음.  
요금제(plans) 는 회원의 plans 필드와 연결되어 있음.  
멤버십 혜택(membership_benefits) 은 요금제 및 브랜드 혜택 안내에 활용됨.  
토스 결제(toss_payments) 는 회원의 결제 내역을 기록.  



## 참고 사항
데이터 모델 및 ERD는 Notion 문서 참고  
ESLint, Prettier 기반 코드 스타일 적용
