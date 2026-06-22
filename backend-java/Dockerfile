# Build stage using standard Maven and Java 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy dependency configuration first to cache layer downloads
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source tree and compile package safely
COPY src ./src
RUN mvn clean package -DskipTests -Dmaven.main.skip=false

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8002
ENTRYPOINT ["java", "-jar", "app.jar"]