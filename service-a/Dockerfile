FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN rm -f tsconfig.tsbuildinfo && npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
