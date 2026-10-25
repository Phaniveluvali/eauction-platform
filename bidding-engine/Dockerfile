FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY . .
RUN rm -f go.sum && go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o bidding-engine ./cmd/server/main.go

FROM alpine:3.20
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/bidding-engine .
EXPOSE 8081
ENTRYPOINT ["./bidding-engine"]
