FROM mcr.microsoft.com/playwright:v1.52.0-jammy
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV PW_CHROMIUM_ARGS="--no-sandbox"
ENTRYPOINT ["node","bot.js"]
