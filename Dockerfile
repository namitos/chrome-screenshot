FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - &&\
  sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' &&\
  apt-get update &&\
  apt-get install -y git make google-chrome-stable &&\
  npm install --unsafe-perm

CMD [ "node", "app" ]