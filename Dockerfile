FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const net=require('net');const socket=net.connect(3000,'127.0.0.1',()=>process.exit(0));socket.on('error',()=>process.exit(1));socket.setTimeout(4000,()=>{socket.destroy();process.exit(1);});"

USER node

CMD ["npm", "start"]
