FROM node:26.13.0-alpine AS development

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:26.13.0-alpine AS production

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

COPY --from=development /usr/app/dist ./dist

CMD ["node", "dist/main"]
