# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# (선택) URL 인자는 더 이상 사용하지 않습니다. 내부 프록시 경로 사용.
# ARG URL=211.44.183.248

# ✅ 프론트에서 호출할 엔드포인트를 '상대경로'로 고정
ENV REACT_APP_API_URL=/api
ENV REACT_APP_POLICIES_URL=/policies
ENV REACT_APP_AEGIS_URL=/aegis
ENV REACT_APP_COLLECTOR_URL=/collector
ENV REACT_APP_LINEAGE_URL=/lineage
ENV REACT_APP_AUDIT_URL=/audit

COPY dspm_dashboard/package*.json ./
RUN npm install
COPY dspm_dashboard/ ./
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# ✅ 아래의 nginx.conf로 프록시 라우팅
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
