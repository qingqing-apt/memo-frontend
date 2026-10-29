FROM node:22-alpine

WORKDIR /app

# 依赖（与前端共用 package.json）
COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com

# 仅复制 Runtime 代码（与 tsconfig，供 tsx 使用）
COPY tsconfig.json tsconfig.node.json ./
COPY runtime ./runtime

EXPOSE 3000

CMD ["npx", "tsx", "runtime/server.ts"]
