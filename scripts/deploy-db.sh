#!/bin/bash
# Publishes the Budget.Database dacpac to the SQL Server defined in appsettings.Development.json.
# Run from the repo root: ./scripts/deploy-db.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DACPAC="$REPO_ROOT/backend/Budget.Database/bin/Debug/Budget.Database.dacpac"
APPSETTINGS="$REPO_ROOT/backend/Budget.Api/appsettings.Development.json"

# Parse connection string from appsettings.Development.json
CONN_STR=$(python3 -c "
import json, sys
with open('$APPSETTINGS') as f:
    data = json.load(f)
print(data['ConnectionStrings']['DefaultConnection'])
")

# Extract components from connection string
SERVER=$(echo "$CONN_STR" | sed -n 's/.*Server=\([^;]*\).*/\1/p')
DATABASE=$(echo "$CONN_STR" | sed -n 's/.*Database=\([^;]*\).*/\1/p')
USER_ID=$(echo "$CONN_STR" | sed -n 's/.*User Id=\([^;]*\).*/\1/p')
PASSWORD=$(echo "$CONN_STR" | sed -n 's/.*Password=\([^;]*\).*/\1/p')

echo "Building dacpac..."
dotnet build "$REPO_ROOT/backend/Budget.Database" --configuration Debug -v q

echo "Deploying $DATABASE to $SERVER..."
sqlpackage \
  /Action:Publish \
  /SourceFile:"$DACPAC" \
  /TargetServerName:"$SERVER" \
  /TargetDatabaseName:"$DATABASE" \
  /TargetUser:"$USER_ID" \
  /TargetPassword:"$PASSWORD" \
  /TargetTrustServerCertificate:true

echo "Database deployed successfully."
