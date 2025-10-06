# TASK

You'll build 2 NestJS microservices (A & B), dockerized via Docker Compose, with:

- Connections to MongoDB and Redis (official drivers)
- API docs via Swagger
- Inter-service messaging (any transporter)

## Feature Highlights

### Service A

- Fetch large data from a public API, save to file (JSON/Excel).
  - Bonus: Do this entirely via code (no manual download)
- Upload and parse file, insert into MongoDB robustly.
  - Bonus: Full in-code implementation for parsing and insertion
- Search API with indexing and efficient pagination
- Publish all API actions/events to RedisTimeSeries

### Service B

- Subscribe to events from A, store logs
- Expose APIs to query logs by filters (e.g., date, type)
- Generate a PDF report with charts from time series data, including labels and a meaningful layout.
  - Bonus: Implement this report API in Go (or other) with gRPC

## Code Expectations

- Clean, reusable, strongly typed code
- Shared libs for DB connections, etc.
