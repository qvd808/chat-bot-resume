FROM node:20-bullseye-slim

# Create app directory
RUN mkdir -p /app
WORKDIR /app
COPY . .

RUN apt-get update && apt-get install -y python3-pip
RUN npm install
RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start"]