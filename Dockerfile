FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Install Node.js for frontend build
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Build frontend
COPY travel-frontend/package*.json ./travel-frontend/
RUN cd travel-frontend && npm install
COPY travel-frontend/ ./travel-frontend/
RUN cd travel-frontend && echo "VITE_API_URL=/api" > .env.local && npm run build

# Build backend
COPY Travel/pom.xml Travel/mvnw ./Travel/
COPY Travel/.mvn ./Travel/.mvn
RUN cd Travel && chmod +x mvnw && ./mvnw dependency:go-offline -q 2>/dev/null || true
COPY Travel/ ./Travel/

# Copy frontend build into Spring Boot static
RUN cp -r travel-frontend/dist/* Travel/src/main/resources/static/ 2>/dev/null; \
    mkdir -p Travel/src/main/resources/static && \
    cp -r travel-frontend/dist/* Travel/src/main/resources/static/

RUN cd Travel && ./mvnw package -DskipTests -q

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/Travel/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar", "--server.port=8080"]
