FROM node:22-alpine As development

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:22-alpine as production

WORKDIR /usr/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/app/dist ./dist

CMD ["node", "dist/src/index"]