package com.taskflow.api.config;

import com.taskflow.api.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class TaskScheduler {
    private static final Logger logger = LoggerFactory.getLogger(TaskScheduler.class);

    @Autowired
    private TaskService taskService;

    // Run daily at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void runDailyRecalculation() {
        logger.info("Starting daily task priority and status recalculation...");
        try {
            taskService.recalculateAllTaskPrioritiesAndStatuses();
            logger.info("Successfully completed daily task recalculation.");
        } catch (Exception e) {
            logger.error("Failed to run daily task recalculation: {}", e.getMessage());
        }
    }
}
