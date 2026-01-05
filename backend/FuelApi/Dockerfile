# ============================
# BUILD STAGE
# ============================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Csak a csproj fájlt másoljuk be
COPY FuelApi.csproj .

RUN dotnet restore

# Teljes backend mappa bemásolása
COPY . .

RUN dotnet publish -c Release -o /app/out


# ============================
# RUNTIME STAGE
# ============================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/out .

ENTRYPOINT ["dotnet", "FuelApi.dll"]
