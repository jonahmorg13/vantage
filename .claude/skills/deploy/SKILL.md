---
name: deploy
description: Pull latest images from GHCR and start the app with docker compose
disable-model-invocation: true
allowed-tools: Bash
---

Pull the latest images from GHCR and start the budget app using docker compose.

1. Check if a `.env` file exists in the repo root.
   - If it does not exist, ask the user: "No .env file found. Run generate-env script to create one?"
     - If yes: run `./scripts/generate-env.sh`
     - If no: warn the user that docker compose may fail without it
   - If it already exists, skip this step entirely

2. Pull the latest images from GHCR:

   ```bash
   docker compose pull
   ```

3. Start the services with the updated images:

   ```bash
   docker compose up -d
   ```

4. Wait a few seconds, then show container status:

   ```bash
   docker compose ps
   ```

5. Report which services are running and their ports, and note any images that were updated.

If any service fails to start, show its logs and report the error. If there are errors, try to solve them.
