FROM node:26.13.0-alpine AS development

WORKDIR /usr/app

COPY package*.json ./

# Allow native dependencies to compile when a prebuilt binary is unavailable.
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm ci \
    && apk del .build-deps

COPY . .

RUN npm run build

FROM node:26.13.0-alpine AS production

WORKDIR /usr/app

COPY package*.json ./

RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm ci --omit=dev \
    && apk del .build-deps

COPY . .

COPY --from=development /usr/app/dist ./dist

CMD ["node", "dist/src/index"]
