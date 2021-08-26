FROM node:14.17.5
WORKDIR /backend
COPY package*.json /backend/
RUN npm install
COPY . /backend/
EXPOSE 5000
CMD ["npm", "start"]