package com.eauction.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@org.springframework.scheduling.annotation.EnableScheduling
@SpringBootApplication
@EnableTransactionManagement
public class CatalogIdentityApplication {

    public static void main(String[] args) {
        SpringApplication.run(CatalogIdentityApplication.class, args);
    }
}
