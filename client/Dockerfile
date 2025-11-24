FROM node:25 AS frontend

COPY . /app

WORKDIR /app

RUN npm install

RUN npm run build

ENTRYPOINT [ "npm", "run", "start" ]
