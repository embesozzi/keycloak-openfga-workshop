FROM node:16.0.0
# FROM --platform=linux/amd64 node:16.0.0
LABEL maintainer="embesozzi@gmail.com"

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD [ "npm", "start"]
