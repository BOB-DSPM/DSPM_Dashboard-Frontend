# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# 단일 URL 인자 정의
ARG URL=211.44.183.248

# 환경변수 설정 - 단일 URL 변수를 사용하여 각 서비스별 URL 생성
ENV REACT_APP_API_URL=http://${URL}:8000
ENV REACT_APP_POLICIES_URL=http://${URL}:8003
ENV REACT_APP_AEGIS_URL=http://${URL}:8400
ENV REACT_APP_COLLECTOR_URL=http://${URL}:8000
ENV REACT_APP_LINEAGE_URL=http://${URL}:8300
ENV REACT_APP_AUDIT_URL=http://${URL}:8103

COPY dspm_dashboard/package*.json ./
RUN npm install
COPY dspm_dashboard/ ./
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Nginx 설정 반영
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 산출물 복사
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
