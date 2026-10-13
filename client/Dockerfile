# Kudos Kit dashboard (Next.js), built in "standalone" mode: a small server.js with only
# the files it needs. Built from client/:   docker build client
# Normally docker compose builds it (see docker-compose.yml).

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Where the dashboard reaches the API inside Docker. Part of the build (next.config.ts rewrites).
ARG NESTJS_API_URL=http://server:3000
ENV NESTJS_API_URL=$NESTJS_API_URL NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production PORT=3001 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3001
CMD ["node", "server.js"]
