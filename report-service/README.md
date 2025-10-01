# Report Service (Go + gRPC)

Bonus feature: High-performance PDF report generation service using Go and gRPC.

## Setup

### Generate Protocol Buffers

```bash
# Install protoc compiler
# Install Go plugins
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Generate Go code from proto file
protoc --go_out=. --go-grpc_out=. proto/report.proto
```

### Run Locally

```bash
go mod download
go run main.go
```

### Run with Docker

```bash
docker build -t report-service .
docker run -p 50051:50051 report-service
```

## Features

- gRPC API for PDF report generation
- RedisTimeSeries data querying
- High-performance Go implementation
- Chart generation with go-chart
- PDF generation with gofpdf

## API

### GenerateReport

Generates a PDF report with charts from RedisTimeSeries data.

**Request:**
```protobuf
message ReportRequest {
  int64 start_timestamp = 1;
  int64 end_timestamp = 2;
  repeated string metrics = 3;
}
```

**Response:**
```protobuf
message ReportResponse {
  bytes pdf_data = 1;
  int32 page_count = 2;
  string generated_at = 3;
}
```

### GetTimeSeriesData

Retrieves time series data from Redis.

**Request:**
```protobuf
message TimeSeriesRequest {
  string key = 1;
  int64 start_timestamp = 2;
  int64 end_timestamp = 3;
}
```

**Response:**
```protobuf
message TimeSeriesResponse {
  repeated DataPoint data_points = 1;
  string key = 2;
}
```
