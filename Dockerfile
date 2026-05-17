FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

COPY Travel/pom.xml ./Travel/
RUN cd Travel && mvn dependency:go-offline -q 2>/dev/null || true

COPY Travel/ ./Travel/
RUN cd Travel && mvn package -DskipTests -q

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/Travel/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar", "--server.port=8080"]
