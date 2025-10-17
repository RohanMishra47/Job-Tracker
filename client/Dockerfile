FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
RUN pnpm build

# Serve static files using a lightweight server
RUN pnpm add serve
EXPOSE 3000
CMD ["pnpm", "serve", "-s", "dist", "-l", "3000"]