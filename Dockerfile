# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# package.json과 package-lock.json 복사
COPY dspm_dashboard/package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY dspm_dashboard/ ./

# 프로덕션 빌드
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 파일 복사 (CRA는 build 폴더 사용)
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
