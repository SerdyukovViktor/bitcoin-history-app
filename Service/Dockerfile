FROM node:20-alpine3.20 AS builder

WORKDIR /bitcoin-history-app/Service

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "start"]

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["node", "service.js"]