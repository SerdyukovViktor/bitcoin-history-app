FROM node:20-alpine3.20 AS builder

WORKDIR /bitcoin-history-app/Front

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

COPY ./.output/public /app/public

CMD ["node", "server.js"]