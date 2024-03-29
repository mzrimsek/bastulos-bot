FROM node:14

LABEL org.opencontainers.image.source https://github.com/mzrimsek/bastulos-bot

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json /usr/src/bot
RUN npm install

COPY . /usr/src/bot

RUN mkdir -p /var/bot

CMD ["npm", "start"]
