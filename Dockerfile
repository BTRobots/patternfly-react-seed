# build container
FROM node:lts AS builder

RUN apt-get update
COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build


#application
FROM gcr.io/distroless/nodejs
COPY --from=builder /app /app
COPY --from=builder /app/node_modules /app/node_modules
WORKDIR /app
CMD ["server.js"]
