FROM node:20-alpine
RUN npm install -g pnpm@10.18.3

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
RUN pnpm build

EXPOSE 5000
CMD ["pnpm", "start"]