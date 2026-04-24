# =============================================================================
# Stage 1: Dependencies
# Install production and development dependencies separately for better caching
# =============================================================================
FROM oven/bun:1-alpine AS deps
WORKDIR /app

# Install dependencies only when needed
# This layer will be recreated only when package.json or bun.lockb changes
COPY package.json bun.lockb* ./

# Install all dependencies (including devDependencies) needed for build
# Using --frozen-lockfile to ensure reproducible builds
# Note: Bun doesn't accept --production=false, omitting --production installs all deps
RUN bun install --frozen-lockfile

# =============================================================================
# Stage 2: Builder
# Build the Next.js application
# =============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
# Copy only necessary files for build (optimized layer caching)
COPY . .

# Accept build arguments for environment variables
ARG NEXT_PUBLIC_API_URL

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Optimize memory usage for build
# Set Node.js memory limit to prevent OOM while allowing efficient builds
ENV NODE_OPTIONS="--max-old-space-size=3072"

# Build the application
# Dependencies are already copied from deps stage, so we can directly build
RUN npm run build

# =============================================================================
# Stage 3: Runner
# Production runtime with minimal dependencies
# =============================================================================
FROM oven/bun:1-alpine AS runner
WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
# Using fixed UID/GID for consistency across environments
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder stage
# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build output
# Set proper ownership to non-root user
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user for security
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set runtime environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Add labels for better image management
LABEL org.opencontainers.image.title="Web HRMS Next.js Application" \
      org.opencontainers.image.description="Next.js 16 application with Bun runtime" \
      org.opencontainers.image.vendor="Web HRMS" \
      org.opencontainers.image.version="1.0.0"

# Health check to ensure container is running properly
# Checks if the server responds to HTTP requests
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD bun -e "const http = require('http'); http.get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Use exec form for better signal handling
# Run Next.js server using Bun (memory-efficient runtime)
CMD ["bun", "server.js"]
