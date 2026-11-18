FROM node:22-alpine AS build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY backend ./backend
COPY --from=build /app/frontend/dist ./frontend/dist
ENV NODE_ENV=production DATA_DIR=/data PORT=3000
VOLUME /data
EXPOSE 3000
CMD ["node", "backend/server.js"]
