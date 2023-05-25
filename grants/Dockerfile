FROM node:16-alpine AS development

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:16-alpine AS production

WORKDIR /usr/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/app/dist ./dist

CMD ["node", "dist/api/index"]