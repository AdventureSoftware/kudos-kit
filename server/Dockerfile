# Kudos Kit API (NestJS), with the widget script it serves at /kkw.js.
# Built from the repository root, because it also needs widget/:
#   docker build -f server/Dockerfile .
# Normally you don't run this yourself: docker compose does (see docker-compose.yml).

# 1. The widget: widget/build.mjs writes server/public/kkw.js
FROM node:22-alpine AS widget
WORKDIR /repo/widget
COPY widget/package.json widget/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY widget/ ./
RUN mkdir -p ../server/public && npm run build

# 2. The API
FROM node:22-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /repo/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY server/ ./
COPY --from=widget /repo/server/public/kkw.js ./public/kkw.js
RUN npx prisma generate \
 && npm run build \
 && npm prune --omit=dev --no-audit --no-fund

# 3. What runs: compiled code and production dependencies only, as a non-root user
FROM node:22-alpine
RUN apk add --no-cache openssl
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /repo/server/package.json ./
COPY --from=build --chown=node:node /repo/server/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/server/prisma ./prisma
COPY --from=build --chown=node:node /repo/server/dist ./dist
COPY --from=build --chown=node:node /repo/server/public ./public
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
