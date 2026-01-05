# ============================
# BUILD STAGE
# ============================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Csak a backend projekt csproj fájlját másoljuk be
COPY backend/FuelApi/FuelApi.csproj .

# Restore
RUN dotnet restore

# Teljes backend mappa bemásolása
COPY backend/FuelApi/ .

# Publish
RUN dotnet publish -c Release -o /app/out


# ============================
# RUNTIME STAGE
# ============================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# A publish output bemásolása
COPY --from=build /app/out .

# Indítás
ENTRYPOINT ["dotnet", "FuelApi.dll"]
