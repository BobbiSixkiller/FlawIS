# === Build Stage ===
FROM node:22-alpine AS builder

WORKDIR /usr/app

COPY package*.json ./
RUN npm ci --silent --no-fund --no-audit

COPY . .

# Optional: clean previous builds
RUN rm -rf .next

# Important: Next.js 15 uses output: 'standalone'
RUN npm run build

# === Production Stage ===
FROM node:22-alpine AS production

WORKDIR /usr/app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production --silent --no-fund --no-audit

# Copy necessary build output (standalone includes everything needed)
COPY --from=builder /usr/app/.next/standalone ./
COPY --from=builder /usr/app/.next/static ./.next/static
COPY --from=builder /usr/app/public ./public

# If needed, also copy your config
COPY --from=builder /usr/app/next.config.mjs ./next.config.mjs

CMD ["node", "server.js"]
