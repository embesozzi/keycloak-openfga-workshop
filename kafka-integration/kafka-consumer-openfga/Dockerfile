FROM node:12-alpine
LABEL maintainer="embesozzi@gmail.com"

WORKDIR /src
COPY package*.json ./
RUN npm install
COPY ./src /src/

CMD [ "npm", "start" ]

