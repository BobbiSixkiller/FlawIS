# Developemnt Stage
FROM node:16-alpine AS development

# Create app directory
WORKDIR /usr/app

# Install app dependencies
COPY package*.json ./

RUN npm ci --silent --no-fund --no-audit

COPY . .

RUN npm run build

FROM node:16-alpine AS production

WORKDIR /usr/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/app/.next ./.next

# CMD ["npm", "run", "start"]