# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Accept BASE_PATH as build argument (default is root "/")
ARG BASE_PATH=/
ENV PUBLIC_URL=$BASE_PATH

COPY package*.json ./
RUN npm ci
COPY . .

# This build will use PUBLIC_URL environment variable
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
