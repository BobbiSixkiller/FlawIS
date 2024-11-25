# Development Stage
FROM node:22-alpine AS development

# Set working directory
WORKDIR /usr/app

# Install dependencies
COPY package*.json ./
RUN npm ci --silent --no-fund --no-audit

# Copy source code and build
COPY . .
RUN npm run build

# Production Stage
FROM node:22-alpine AS production

# Set working directory
WORKDIR /usr/app

# Install dependencies
COPY package*.json ./
RUN npm ci --silent --no-fund --no-audit --timeout=120000

# Copy built assets from the development stage
COPY --from=development /usr/app/.next ./.next

# Copy remaining source code
COPY . .

# Start the application
# CMD ["npm", "run", "start"]
