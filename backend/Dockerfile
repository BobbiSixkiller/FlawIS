FROM node:14.16.0
WORKDIR /backend
COPY package*.json /backend/
RUN npm install
COPY . /backend/
EXPOSE 5000
CMD ["npm", "start"]