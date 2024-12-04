# WEBCHAT
> 웹 채팅 사이트

## 기술 스택 
### Front-End
<img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black"><img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white"><img src="https://img.shields.io/badge/css-1572B6?style=for-the-badge&logo=css3&logoColor=white"><img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">

### Back-End
<img src="https://img.shields.io/badge/java-007396?style=for-the-badge&logo=java&logoColor=white"><img src="https://img.shields.io/badge/springboot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"><img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white"><img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=Redis&logoColor=white"> 

### Repository
<img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white">


## 실행 방법
1. 프로젝트 클론

2. 자바 17 환경 설치

3. webchat에서 ./gradlew bootRun

4. webchat_front에서 npm start

5. localhost:3000 으로 접속

6. application-secret.properties 작성 필요
    + spring.mail.username=
    + spring.mail.password=
    + 작성 후 이메일 IMAP 사용 

## 데이터베이스
###  MySQL
Spring Boot 내에서 Entity로 설계

https://www.erdcloud.com/d/xq4NqMEW77aaebcL6
![image](https://github.com/user-attachments/assets/a01027ff-8230-4aa1-bc44-12d340410173)


## 주요 기능
+ 사용자
  + 회원가입 
  + 로그인
  + 로그아웃
  + 아이디 찾기
  + 비밀번호 변경
  + 친구 목록
    + 친구 추가/삭제/차단

+ 채팅방
  + 참여중인 채팅방
    + 1:1 채팅방
    + 그룹채팅방
    + 오픈채팅방
  + 오픈채팅방 목록
    + 일반 채팅방
    + 비밀 채팅방
   
## 세부 기능
+ 모든 페이지(로그인,회원가입,아이디찾기, 비밀번호 찾기 제외)
  + jwt 토큰을 받아 로그인 interceptor로 검증
+ 회원가입
  + 사용자 아이디 중복 체크
  + 사용자 이메일 중복 체크
  + smtp 이메일 인증 코드 발송
  + redis를 통한 이메일 인증 코드 저장
  + bcrypt를 이용한 비밀번호 해시화
+ 로그인
  + jwt을 이용한 토큰 local storage 저장
  + 모든 동작에 대해 header에 token 발송
+ 로그아웃
  + local storage에서 token 삭제
+ 아이디 찾기
  + smtp, redis를 통한 이메일 인증
+ 비밀번호 변경
  + smtp, redis를 통한 이메일 인증
  + bcrypt를 이용한 비밀번호 해시화
+ 친구
  + 친구 목록 / 받은 요청 / 보낸 요청 / 차단 목록 조회
  + 친구 삭제 / 차단, 받은 요청 삭제 / 차단, 차단 해제
  + 웹 소켓을 이용한 친구 온/오프라인 실시간 업데이트
+ 채팅방 목록
  + 해당 유저가 참여한 모든 채팅방 목록 조회
  + 해당 유저가 참여하지 않은 모든 오픈 채팅방 목록 조회
  + 채팅방 이름, 인원, 타입, 마지막 메시지, 마지막 메시지 시간 조회
  + 웹 소켓을 통한 안읽은 메시지 및 시간 실시간 업데이트
  + 채팅방 생성
  + 비밀 오픈 채팅방 입장 (비밀번호 입력 후 해시화 검증)
+ 채팅방
  + 웹 소켓을 통한 채팅방 인원 온/오프라인 상태 실시간 업데이트
  + 웹 소켓을 통한 메시지 기능
  + 웹 소켓을 통한 파일 전송 (서버에 저장 후 데이터베이스엔 이름,url 등 저장)
  + 모든 메시지 local storage에 저장 및 데이터 베이스 저장 (데이터베이스는 30일간 보관 후 삭제)
  + 마지막 읽은 시간 업데이트 및 이후 안 읽은 메시지 로드 ("여기까지 읽었습니다" 시스템 메시지 출력)
  + 메시지 검색창 기능 (ctrl + F 나 돋보기 모양 누르면 활성화)
  + 채팅방 나가기 (퇴장 시스템 메시지 출력)
  + 그룹 채팅방 친구 초대 (입장 시스템 메시지 출력)
