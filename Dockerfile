# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# ✅ 절대 URL(고정): http://211.44.183.248:8200
ENV REACT_APP_API_URL=http://211.44.183.248:8200/api
ENV REACT_APP_POLICIES_URL=http://211.44.183.248:8200/policies
ENV REACT_APP_AEGIS_URL=http://211.44.183.248:8200/aegis
ENV REACT_APP_COLLECTOR_URL=http://211.44.183.248:8200/collector
ENV REACT_APP_LINEAGE_URL=http://211.44.183.248:8200/lineage
ENV REACT_APP_AUDIT_URL=http://211.44.183.248:8200/audit

COPY dspm_dashboard/package*.json ./
RUN npm install
COPY dspm_dashboard/ ./
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
