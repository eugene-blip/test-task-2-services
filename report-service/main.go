package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
	"google.golang.org/grpc"
	pb "report-service/proto"
)

type server struct {
	pb.UnimplementedReportServiceServer
	redisClient *redis.Client
}

func main() {
	// Connect to Redis
	redisHost := os.Getenv("REDIS_HOST")
	if redisHost == "" {
		redisHost = "localhost"
	}
	redisPort := os.Getenv("REDIS_PORT")
	if redisPort == "" {
		redisPort = "6379"
	}

	rdb := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", redisHost, redisPort),
	})

	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	log.Println("Connected to Redis")

	// Start gRPC server
	port := os.Getenv("GRPC_PORT")
	if port == "" {
		port = "50051"
	}

	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterReportServiceServer(s, &server{redisClient: rdb})

	log.Printf("gRPC Report Service listening on port %s", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}

func (s *server) GenerateReport(ctx context.Context, req *pb.ReportRequest) (*pb.ReportResponse, error) {
	log.Printf("Generating report from %d to %d", req.StartTimestamp, req.EndTimestamp)

	// Get all time series keys
	keys, err := s.redisClient.Keys(ctx, "ts:*").Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get time series keys: %v", err)
	}

	// Generate PDF
	pdfData, err := generatePDF(ctx, s.redisClient, keys, req.StartTimestamp, req.EndTimestamp)
	if err != nil {
		return nil, fmt.Errorf("failed to generate PDF: %v", err)
	}

	return &pb.ReportResponse{
		PdfData:     pdfData,
		PageCount:   1,
		GeneratedAt: time.Now().Format(time.RFC3339),
	}, nil
}

func (s *server) GetTimeSeriesData(ctx context.Context, req *pb.TimeSeriesRequest) (*pb.TimeSeriesResponse, error) {
	log.Printf("Getting time series data for key: %s", req.Key)

	// Query RedisTimeSeries
	cmd := s.redisClient.Do(ctx, "TS.RANGE", req.Key, req.StartTimestamp, req.EndTimestamp)
	result, err := cmd.Result()
	if err != nil {
		return nil, fmt.Errorf("failed to query time series: %v", err)
	}

	dataPoints := []*pb.DataPoint{}
	if resultSlice, ok := result.([]interface{}); ok {
		for _, item := range resultSlice {
			if point, ok := item.([]interface{}); ok && len(point) == 2 {
				timestamp, _ := point[0].(int64)
				value := 0.0
				if strVal, ok := point[1].(string); ok {
					fmt.Sscanf(strVal, "%f", &value)
				}
				dataPoints = append(dataPoints, &pb.DataPoint{
					Timestamp: timestamp,
					Value:     value,
				})
			}
		}
	}

	return &pb.TimeSeriesResponse{
		Key:        req.Key,
		DataPoints: dataPoints,
	}, nil
}

func generatePDF(ctx context.Context, rdb *redis.Client, keys []string, startTs, endTs int64) ([]byte, error) {
	// This is a simplified PDF generation
	// In a real implementation, you would use a proper PDF library with charts
	
	pdfContent := fmt.Sprintf("Event Analytics Report\n\nPeriod: %s to %s\n\n",
		time.Unix(startTs/1000, 0).Format(time.RFC3339),
		time.Unix(endTs/1000, 0).Format(time.RFC3339))

	pdfContent += fmt.Sprintf("Total Time Series Keys: %d\n\n", len(keys))

	for _, key := range keys {
		cmd := rdb.Do(ctx, "TS.RANGE", key, startTs, endTs)
		result, err := cmd.Result()
		if err != nil {
			continue
		}

		count := 0
		if resultSlice, ok := result.([]interface{}); ok {
			count = len(resultSlice)
		}

		pdfContent += fmt.Sprintf("Key: %s\nData Points: %d\n\n", key, count)
	}

	return []byte(pdfContent), nil
}
