FROM node:13.12.0-alpine

#WORKDIR /usr/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 3000

RUN echo $IP_ADDRES

CMD ["npm", "start"]
