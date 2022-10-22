FROM node:12-alpine
# Create a directory (to house our source files) and navigate to it.
WORKDIR /src

COPY package*.json ./
RUN npm install

COPY ./src /src/

CMD [ "npm", "start" ]

