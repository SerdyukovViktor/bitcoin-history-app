FROM node:20-alpine3.20 AS builder

WORKDIR /bitcoin-history-app/Back

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "start"]