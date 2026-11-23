package com.eauction.core.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DataSourceRoutingConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceRoutingConfig.class);

    public enum DataSourceType {
        WRITE,
        READ
    }

    public static class RoutingDataSource extends AbstractRoutingDataSource {
        @Override
        protected Object determineCurrentLookupKey() {
            boolean isReadOnly = TransactionSynchronizationManager.isCurrentTransactionReadOnly();
            log.trace("[DataSourceRouting] Query routed to: {}", isReadOnly ? "STANDBY REPLICA (READ)" : "PRIMARY (WRITE)");
            return isReadOnly ? DataSourceType.READ : DataSourceType.WRITE;
        }
    }

    @Bean(name = "writeDataSource")
    public DataSource writeDataSource(
            @Value("${spring.datasource.url:jdbc:postgresql://eauction-postgres:5432/eauction_db}") String url,
            @Value("${spring.datasource.username:postgres}") String username,
            @Value("${spring.datasource.password:postgres}") String password,
            @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}") String driver,
            @Value("${spring.datasource.hikari.maximum-pool-size:50}") int maxPool,
            @Value("${spring.datasource.hikari.minimum-idle:15}") int minIdle,
            @Value("${spring.datasource.hikari.connection-timeout:30000}") long connTimeout,
            @Value("${spring.datasource.hikari.idle-timeout:600000}") long idleTimeout,
            @Value("${spring.datasource.hikari.max-lifetime:1800000}") long maxLifetime) {

        HikariDataSource ds = new HikariDataSource();
        ds.setPoolName("HikariPool-Primary-Write");
        ds.setJdbcUrl(url);
        ds.setUsername(username);
        ds.setPassword(password);
        ds.setDriverClassName(driver);
        ds.setMaximumPoolSize(maxPool);
        ds.setMinimumIdle(minIdle);
        ds.setConnectionTimeout(connTimeout);
        ds.setIdleTimeout(idleTimeout);
        ds.setMaxLifetime(maxLifetime);
        return ds;
    }

    @Bean(name = "readDataSource")
    public DataSource readDataSource(
            @Value("${spring.datasource.read-url:${SPRING_DATASOURCE_READ_URL:jdbc:postgresql://eauction-postgres-replica:5432/eauction_db}}") String url,
            @Value("${spring.datasource.username:postgres}") String username,
            @Value("${spring.datasource.password:postgres}") String password,
            @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}") String driver,
            @Value("${spring.datasource.hikari.maximum-pool-size:50}") int maxPool,
            @Value("${spring.datasource.hikari.minimum-idle:15}") int minIdle,
            @Value("${spring.datasource.hikari.connection-timeout:30000}") long connTimeout,
            @Value("${spring.datasource.hikari.idle-timeout:600000}") long idleTimeout,
            @Value("${spring.datasource.hikari.max-lifetime:1800000}") long maxLifetime) {

        HikariDataSource ds = new HikariDataSource();
        ds.setPoolName("HikariPool-Standby-Read");
        if (url == null || url.isBlank()) {
            url = "jdbc:postgresql://eauction-postgres-replica:5432/eauction_db";
        }
        ds.setJdbcUrl(url);
        ds.setUsername(username);
        ds.setPassword(password);
        ds.setDriverClassName(driver);
        ds.setMaximumPoolSize(maxPool);
        ds.setMinimumIdle(minIdle);
        ds.setConnectionTimeout(connTimeout);
        ds.setIdleTimeout(idleTimeout);
        ds.setMaxLifetime(maxLifetime);
        return ds;
    }

    @Bean(name = "routingDataSource")
    public DataSource routingDataSource(
            @Qualifier("writeDataSource") DataSource writeDataSource,
            @Qualifier("readDataSource") DataSource readDataSource) {

        RoutingDataSource routing = new RoutingDataSource();
        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put(DataSourceType.WRITE, writeDataSource);
        targetDataSources.put(DataSourceType.READ, readDataSource);
        routing.setTargetDataSources(targetDataSources);
        routing.setDefaultTargetDataSource(writeDataSource);
        return routing;
    }

    @Primary
    @Bean
    public DataSource dataSource(@Qualifier("routingDataSource") DataSource routingDataSource) {
        return new LazyConnectionDataSourceProxy(routingDataSource);
    }
}
