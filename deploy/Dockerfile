# Multi-stage Dockerfile for Bandrek.Server (ASP.NET Core 10)
# Build from repository root: docker build -f deploy/Dockerfile -t bandrek-api .

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Create contract directory for build-time OpenAPI generator
RUN mkdir -p /src/contract

# Copy solution and project files first to leverage Docker layer caching
COPY server/Bandrek.Server.slnx ./server/
COPY server/global.json ./server/
COPY server/src/Bandrek.Server/Bandrek.Server.csproj ./server/src/Bandrek.Server/
COPY server/src/Bandrek.Server/packages.lock.json ./server/src/Bandrek.Server/

# Restore dependencies
WORKDIR /src/server/src/Bandrek.Server
RUN dotnet restore --locked-mode

# Copy source code and contract
WORKDIR /src
COPY server/src/ ./server/src/
COPY contract/ ./contract/

# Publish Release build
WORKDIR /src/server/src/Bandrek.Server
RUN dotnet publish -c Release -o /app/publish --no-restore

# Final runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Copy published application
COPY --from=build /app/publish .

# Default environment configuration
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5000

EXPOSE 5000

ENTRYPOINT ["dotnet", "Bandrek.Server.dll"]
