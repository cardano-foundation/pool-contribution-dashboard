FROM node:25

COPY . /app

WORKDIR /app

RUN npm install

RUN npm run build

ENTRYPOINT [ "npm", "run", "start" ]
