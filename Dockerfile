# Build stage
FROM oven/bun:latest as builder

WORKDIR /build

# Copy only files needed for installation
COPY package.json tsconfig.json bun.lockb ./
COPY src/ ./src/
COPY drizzle/ ./drizzle/

# Install dependencies and build
RUN bun install
RUN bun build src/index.ts --outfile server.js --target bun

# Production stage
FROM oven/bun:latest

WORKDIR /app

# Copy only the built artifact
COPY --from=builder /build/server.js ./
COPY --from=builder /build/drizzle/ ./drizzle/

# Configure environment
ENV DBPATH=/db
EXPOSE 3000

CMD ["bun", "run", "server.js"]