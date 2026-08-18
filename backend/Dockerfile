# Stage 1: Build stage using Java 17 JDK
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper files and pom.xml first for efficient layer caching
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make Maven wrapper executable
RUN chmod +x ./mvnw

# Copy application source code
COPY src src

# Build the Spring Boot executable JAR skipping tests
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime stage using Java 17 JRE
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy executable JAR from build stage
COPY --from=build /app/target/ems-0.0.1-SNAPSHOT.jar app.jar

# Expose default application port
EXPOSE 8080

# Execute Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
