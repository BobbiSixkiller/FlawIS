FROM node:14.17.6 as client
WORKDIR /frontend
ENV PATH /frontend/node_modules/.bin:$PATH
COPY package*.json /frontend/
RUN npm install --silent
RUN npm install react-scripts -g --silent
COPY . /frontend/
RUN npm run build
FROM nginx:latest
EXPOSE 80
COPY --from=client /frontend/build/ /var/www/html
COPY ./nginx/default.conf /etc/nginx/conf.d
CMD ["nginx", "-g", "daemon off;"]