# Stage I - Build dependencies
FROM node:20-alpine as build

# Install build dependencies for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY  . .

RUN npm ci
RUN npm run build

# Stage II - Production
FROM node:20-alpine as prod

# Install production dependencies for native modules
RUN apk add --no-cache python3 make g++

RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

USER node

COPY --chown=node:node --from=build  ./app/build ./build
COPY --chown=node:node package*.json ./

RUN node --version
RUN npm ci --production --ignore-scripts
RUN npm rebuild bcrypt --build-from-source

EXPOSE 5010 5011

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5010/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "run", "start"]
