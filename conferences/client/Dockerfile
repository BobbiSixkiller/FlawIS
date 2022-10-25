# Developemnt Stage
FROM node:16-alpine as development
ENV NODE_ENV=development

# Create app directory
WORKDIR /usr/app

# Install app dependencies
COPY package*.json ./

RUN npm ci --silent --no-fund --no-audit

COPY . .

# EXPOSE 3000

# CMD [ "npm", "run", "dev"]