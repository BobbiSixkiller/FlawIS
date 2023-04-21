# Developemnt Stage
FROM node:16-alpine AS development
ENV NODE_ENV=development

# RUN apk add --no-cache brotli-dev

# Create app directory
WORKDIR /usr/app

# Install app dependencies
COPY package*.json ./

RUN npm ci --silent --no-fund --no-audit

COPY . .

RUN npm run build

FROM node:16-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# RUN apk add --no-cache brotli-dev

WORKDIR /usr/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/app/.next ./.next

CMD ["npm", "run", "start"]