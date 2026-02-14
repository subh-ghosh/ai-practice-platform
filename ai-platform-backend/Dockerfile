# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
# Skip tests to speed up build and avoid DB connection errors during build
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
# Copy the JAR file from the build stage
# Copy the JAR file from the build stage
COPY --from=build /app/target/ai-platform-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080 (Standard for Cloud)
EXPOSE 8080

# Run the app
# Note: server.port=${PORT:8080} in application.properties handles the port binding automatically.
ENTRYPOINT ["java", "-jar", "app.jar"]