# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

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
