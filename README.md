# DSPM Dashboard Frontend

## 프로젝트 설명
데이터 보안 포스처 관리(DSPM) 대시보드의 프론트엔드 애플리케이션입니다.

## 기술 스택
- React
- TypeScript
- Tailwind CSS

## fix: package.json

## Docker 빌드 및 실행 방법

### 빌드

환경변수로 API URL을 설정하여 이미지를 빌드합니다:
```bash
sudo docker build --build-arg URL={API_서버_IP_또는_호스트명} -t dspm-dashboard .
```

예시:
```bash
sudo docker build --build-arg URL=211.44.183.248 -t dspm-dashboard .
```

### 실행

빌드된 이미지를 실행합니다:
```bash
sudo docker run -d -p {호스트_포트}:3000 --name dspm-frontend dspm-dashboard
```

예시:
```bash
sudo docker run -d -p 3000:3000 --name dspm-frontend dspm-dashboard
```

### 접속

웹 브라우저에서 다음 주소로 접속합니다:
```
http://{호스트_IP_또는_도메인}:{호스트_포트}/dashboard/
```

예시:
```
http://localhost:3000/dashboard/
```
