#!/bin/bash
# Start the TaskFlow backend
cd "$(dirname "$0")/backend"
mvn spring-boot:run
