FROM node:22-alpine

WORKDIR /app

#copy package.json and package-lock.json
COPY package*.json .

#install dependencies
RUN npm install

#copy everything else
COPY . .

EXPOSE 3000

CMD ["node", "./src/server.js"]