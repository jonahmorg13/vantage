FROM mcr.microsoft.com/dotnet/sdk:10.0
WORKDIR /src
COPY . .
RUN dotnet build -c Release
RUN dotnet tool install --global microsoft.sqlpackage
ENV PATH="$PATH:/root/.dotnet/tools"
RUN cp bin/Release/Budget.Database.dacpac /dacpac.dacpac
ENTRYPOINT ["sqlpackage", "/Action:Publish", \
  "/SourceFile:/dacpac.dacpac", \
  "/p:BlockOnPossibleDataLoss=false"]
