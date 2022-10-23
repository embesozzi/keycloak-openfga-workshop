FROM node:12-alpine
LABEL maintainer="embesozzi@gmail.com"

WORKDIR /app
RUN apk update && apk add yarn python2 g++ make && rm -rf /var/cache/apk/*
COPY package*.json ./
RUN npm install
COPY . .

CMD [ "npm", "run", "serve" ]
