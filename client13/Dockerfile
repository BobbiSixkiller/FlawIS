# Developemnt Stage
FROM node:21-alpine AS development

# Create app directory
WORKDIR /usr/app

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Install app dependencies
COPY package*.json ./

RUN npm ci --silent --no-fund --no-audit

COPY . .

RUN npm run build

FROM node:21-alpine AS production

WORKDIR /usr/app

COPY package*.json ./

RUN npm install 

COPY . .

COPY --from=development /usr/app/.next ./.next

# CMD ["npm", "run", "start"]