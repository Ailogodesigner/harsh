# Production Multi-Stage Dockerfile for Developer Portfolio
FROM node:22-alpine AS base
WORKDIR /app

# Dependencies Stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Runner Stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
