FROM node:22-alpine

WORKDIR /app

RUN apk update && \
    apk add --no-cache ffmpeg python3 openssl curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

COPY package*.json .

RUN npm install

RUN npm install tsx -g

COPY . .

RUN chmod +x decrypt.sh && \
    ./decrypt.sh

CMD ["tsx", "main.ts"]