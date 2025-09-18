# FinStream Backend Services

This directory contains all backend services and infrastructure for the FinStream platform.

## Components

### `generator/` - Java/Quarkus Data Service
- Real-time financial data generator
- WebSocket streaming
- PostgreSQL event store
- Health monitoring
- REST API endpoints

### `swarm/` - Infrastructure Services
- Docker Compose orchestration
- Kafka message streaming
- LGTM observability stack (Grafana/Prometheus/Loki)
- PostgreSQL database
- Redis caching

### `.quarkus/` - Build Configuration
- Quarkus CLI plugins and settings

## Quick Start

### Start Infrastructure
```bash
cd backend/swarm
docker-compose up -d
```

### Start Generator Service
```bash
cd backend/generator
./mvnw quarkus:dev
```

## Service Endpoints
- **Generator API**: http://localhost:8080
- **WebSocket Stream**: ws://localhost:8080/data
- **Grafana**: http://localhost:3000
- **Kafka UI**: http://localhost:8084
- **pgAdmin**: http://localhost:5050
- **RedisInsight**: http://localhost:5540

## Architecture
The backend follows a microservices architecture with event sourcing and real-time streaming capabilities.

