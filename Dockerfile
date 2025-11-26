# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files for all workspaces
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies
RUN npm ci

# Copy source code
COPY client/ ./client/
COPY server/ ./server/

# Build client and server
RUN npm run build:client
RUN npm run build:server

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install production dependencies only
RUN npm ci --omit=dev --workspace=server

# Copy built assets
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist

# Copy migrations
COPY server/src/db/migrations ./server/dist/db/migrations

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

WORKDIR /app/server
CMD ["node", "dist/start.js"]
