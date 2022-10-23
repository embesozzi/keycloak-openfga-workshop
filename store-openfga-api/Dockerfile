FROM node:12-alpine
LABEL maintainer="embesozzi@gmail.com"

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD [ "npm", "start"]
