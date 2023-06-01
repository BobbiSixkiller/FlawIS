# Developemnt Stage
FROM node:16-alpine AS development

# Create app directory
WORKDIR /usr/app

ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Install app dependencies
COPY package*.json ./

RUN npm ci --silent --no-fund --no-audit

COPY . .

RUN npm run build

FROM node:16-alpine AS production

WORKDIR /usr/app

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/app/.next ./.next

# CMD ["npm", "run", "start"]