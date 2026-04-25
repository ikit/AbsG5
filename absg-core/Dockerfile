# Stage I - Build dependencies
FROM node:20-alpine AS build

# Install build dependencies for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage II - Production
FROM node:20-alpine AS prod

RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

USER node

COPY --chown=node:node --from=build /app/build ./build
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./

EXPOSE 5010 5011

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5010/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "run", "start"]
