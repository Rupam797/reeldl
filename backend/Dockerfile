## Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

## Stage 2: Runtime
FROM eclipse-temurin:21-jre
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        python3-setuptools \
        ffmpeg \
        curl \
        ca-certificates && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
         -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp && \
    pip3 install --no-cache-dir --break-system-packages gallery-dl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN groupadd -r appuser && useradd -r -g appuser appuser
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN chown -R appuser:appuser /app

# Render free tier (512 MB memory limit)
ENV JAVA_TOOL_OPTIONS="-Xmx256m -Xss512k -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m"

USER appuser
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
