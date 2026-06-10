FROM node:22-bookworm-slim AS builder

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/package.json
RUN pnpm install --filter frontend --no-frozen-lockfile

COPY apps/frontend ./apps/frontend
RUN pnpm --dir apps/frontend build

FROM nginx:1.27-bookworm
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
