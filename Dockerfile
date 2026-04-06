FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["src/Amally.Core/Amally.Core.csproj", "src/Amally.Core/"]
COPY ["src/Amally.Application/Amally.Application.csproj", "src/Amally.Application/"]
COPY ["src/Amally.Infrastructure/Amally.Infrastructure.csproj", "src/Amally.Infrastructure/"]
COPY ["src/Amally.API/Amally.API.csproj", "src/Amally.API/"]
RUN dotnet restore "src/Amally.API/Amally.API.csproj"
COPY . .
RUN dotnet publish "src/Amally.API/Amally.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Amally.API.dll"]
