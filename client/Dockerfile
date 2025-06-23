# Development Stage
FROM node:22-alpine AS builder

WORKDIR /usr/app

COPY package*.json ./
RUN npm ci --silent --no-fund --no-audit

COPY . .

# Optional: ensure clean build
RUN rm -rf .next
RUN npm run build

# Production Stage
FROM node:22-alpine AS production

WORKDIR /usr/app
ENV NODE_ENV=production

# Install only prod deps
COPY package*.json ./
RUN npm ci --only=production --silent --no-fund --no-audit

# Copy required build assets
COPY --from=builder /usr/app/.next ./.next
COPY --from=builder /usr/app/public ./public
COPY --from=builder /usr/app/next.config.mjs ./next.config.mjs
COPY --from=builder /usr/app/package.json ./package.json
COPY --from=builder /usr/app/node_modules ./node_modules

# Start the app
CMD ["npm", "start"]
