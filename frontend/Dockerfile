# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env — values are public and safe to bake in
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ARG NEXT_PUBLIC_S3_BASE_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_S3_BASE_URL=$NEXT_PUBLIC_S3_BASE_URL

RUN npm run build

# ── Stage 3: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Standalone output produced by next build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
