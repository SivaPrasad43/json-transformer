# JSON Transformer Backend

Go backend server for the JSON Transformer application. Provides REST APIs for managing transformation configurations and executing transformations.

## Features

- **Configuration Management**: Create, read, update, and delete transformation configs
- **Concurrent API Fetching**: Fetch data from multiple APIs in parallel
- **JSON Transformation**: Transform JSON data based on field mappings
- **In-Memory Storage**: Fast, thread-safe configuration storage
- **CORS Support**: Configured for Next.js frontend

## Prerequisites

- Go 1.21 or higher
- Port 8080 available (or configure via PORT env variable)

## Installation

```bash
cd backend
go mod download
```

## Running the Server

```bash
# Development
go run .

# Build and run
go build -o server
./server
```

## Environment Variables

```bash
PORT=8080                          # Server port (default: 8080)
CORS_ORIGIN=http://localhost:3000  # CORS origin (default: http://localhost:3000)
```

## API Endpoints

### Health Check
```
GET /health
```

### Configuration Management

**Create Configuration**
```
POST /api/configs
Content-Type: application/json

{
  "name": "My Transform",
  "apis": [
    {"id": "1", "name": "Users API", "url": "https://api.example.com/users"}
  ],
  "outputSchema": {"users": []},
  "mappings": {"users": "usersapi.data"}
}
```

**List Configurations**
```
GET /api/configs
```

**Get Configuration**
```
GET /api/configs/{id}
```

**Update Configuration**
```
PUT /api/configs/{id}
Content-Type: application/json

{
  "name": "Updated Transform",
  "apis": [...],
  "outputSchema": {...},
  "mappings": {...}
}
```

**Delete Configuration**
```
DELETE /api/configs/{id}
```

### Transformation Execution

**Execute Transformation**
```
POST /api/transform/{configId}
GET /api/transform/{configId}

Response:
{
  "data": {...},
  "logs": ["Starting transformation...", "Fetched 2 APIs", ...],
  "errors": []
}
```

## Architecture

```
main.go       - HTTP server setup, routing, middleware
store.go      - In-memory configuration store with thread-safe operations
handlers.go   - HTTP request handlers for all endpoints
transform.go  - Data fetching and transformation logic
```

## Data Structures

### TransformConfig
```go
type TransformConfig struct {
    ID           string                 `json:"id"`
    Name         string                 `json:"name"`
    APIs         []APIConfig            `json:"apis"`
    OutputSchema map[string]interface{} `json:"outputSchema"`
    Mappings     map[string]string      `json:"mappings"`
    CreatedAt    time.Time              `json:"createdAt"`
    UpdatedAt    time.Time              `json:"updatedAt"`
}
```

### APIConfig
```go
type APIConfig struct {
    ID   string `json:"id"`
    Name string `json:"name"`
    URL  string `json:"url"`
}
```

## Testing

```bash
# Test health endpoint
curl http://localhost:8080/health

# Create a config
curl -X POST http://localhost:8080/api/configs \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","apis":[],"outputSchema":{},"mappings":{}}'

# List configs
curl http://localhost:8080/api/configs

# Execute transformation
curl -X POST http://localhost:8080/api/transform/{configId}
```

## Development

### Adding New Endpoints

1. Add handler function in `handlers.go`
2. Register route in `main.go`
3. Update this README

### Modifying Transformation Logic

Edit `transform.go`:
- `fetchAPIs()` - Modify API fetching behavior
- `getValueFromPath()` - Change path resolution logic
- `transformData()` - Update transformation algorithm

## Production Considerations

- Replace in-memory store with database (PostgreSQL, MongoDB)
- Add authentication/authorization
- Implement rate limiting
- Add request logging
- Configure timeouts appropriately
- Add metrics and monitoring
- Use environment-based configuration
- Add comprehensive error handling

## Troubleshooting

**Port already in use**
```bash
# Change port
PORT=8081 go run .
```

**CORS errors**
```bash
# Set correct origin
CORS_ORIGIN=http://localhost:3001 go run .
```

**Build errors**
```bash
# Clean and rebuild
go clean
go mod tidy
go build
```
