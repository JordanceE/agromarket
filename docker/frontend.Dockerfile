FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.16.0 --activate

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend/ ./

ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm run build

FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
