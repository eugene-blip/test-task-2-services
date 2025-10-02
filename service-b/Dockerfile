FROM node:20-alpine

# Install dependencies for canvas (required for chartjs-node-canvas)
RUN apk add --no-cache \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    make \
    g++ \
    python3

# Install fonts to fix chart rendering issues
RUN apk add --no-cache \
    fontconfig \
    ttf-liberation \
    ttf-dejavu \
    font-noto

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN rm -f tsconfig.tsbuildinfo && npm run build

EXPOSE 3001 50051

CMD ["npm", "run", "start:prod"]
