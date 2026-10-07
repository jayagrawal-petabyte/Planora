FROM node:18-alpine

WORKDIR /app

# Copy root package.json and workspace package.jsons
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY web/backend/package.json ./web/backend/
COPY web/frontend/package.json ./web/frontend/
COPY app/package.json ./app/

# Install dependencies (workspaces)
RUN npm install

# Copy source code
COPY packages/shared ./packages/shared
COPY web/frontend ./web/frontend

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Build frontend
WORKDIR /app/web/frontend
RUN npm run build

# Install a simple static server
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Start static server
CMD ["serve", "-s", "dist", "-p", "5173"]
