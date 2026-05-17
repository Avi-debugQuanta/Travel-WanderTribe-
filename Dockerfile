FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

RUN apt-get update && apt-get install -y curl maven && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

COPY travel-frontend/package*.json ./travel-frontend/
RUN cd travel-frontend && npm install

COPY travel-frontend/ ./travel-frontend/
RUN cd travel-frontend && VITE_API_URL=/api npm run build

COPY Travel/pom.xml ./Travel/
RUN cd Travel && mvn dependency:go-offline -q 2>/dev/null || true

COPY Travel/ ./Travel/
RUN mkdir -p Travel/src/main/resources/static && \
    cp -r travel-frontend/dist/* Travel/src/main/resources/static/

RUN cd Travel && mvn package -DskipTests -q

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/Travel/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar", "--server.port=8080"]
