package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	ServerPort         string
	RedisAddr          string
	RedisPassword      string
	RedisDB            int
	RedisSentinelAddrs []string
	RedisMasterName    string
	KafkaBrokers       []string
	KafkaTopic         string
	JWTSecret          string
}

func LoadConfig() *Config {
	return &Config{
		ServerPort:         getEnv("SERVER_PORT", "8081"),
		RedisAddr:          getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:      getEnv("REDIS_PASSWORD", ""),
		RedisDB:            getEnvAsInt("REDIS_DB", 0),
		RedisSentinelAddrs: getEnvAsSlice("REDIS_SENTINEL_ADDRS", nil),
		RedisMasterName:    getEnv("REDIS_MASTER_NAME", "mymaster"),
		KafkaBrokers:       getEnvAsSlice("KAFKA_BROKERS", []string{"localhost:9092"}),
		KafkaTopic:         getEnv("KAFKA_BID_TOPIC", "vehicle-bids-topic"),
		JWTSecret:          getEnv("JWT_SECRET", "eauction_secret_jwt_signing_key_32bytes_minimum_length_production_ready_value!"),
	}
}

func getEnv(key, defaultVal string) string {
	if val, exists := os.LookupEnv(key); exists && strings.TrimSpace(val) != "" {
		return strings.TrimSpace(val)
	}
	return defaultVal
}

func getEnvAsInt(key string, defaultVal int) int {
	if valStr, exists := os.LookupEnv(key); exists {
		if val, err := strconv.Atoi(strings.TrimSpace(valStr)); err == nil {
			return val
		}
	}
	return defaultVal
}

func getEnvAsSlice(key string, defaultVal []string) []string {
	if valStr, exists := os.LookupEnv(key); exists && strings.TrimSpace(valStr) != "" {
		parts := strings.Split(valStr, ",")
		var cleaned []string
		for _, p := range parts {
			if trimmed := strings.TrimSpace(p); trimmed != "" {
				cleaned = append(cleaned, trimmed)
			}
		}
		if len(cleaned) > 0 {
			return cleaned
		}
	}
	return defaultVal
}
