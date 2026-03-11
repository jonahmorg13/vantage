---
name: publish
description: Build, tag, and push Docker images to GitHub Container Registry
disable-model-invocation: true
allowed-tools: Bash
---

Publish the budget app Docker images to GitHub Container Registry.

1. Authenticate Docker with ghcr.io using the gh CLI:
   ```bash
   echo $(gh auth token) | docker login ghcr.io -u $(gh api user -q .login) --password-stdin
   ```

2. Get the GitHub username for tagging:
   ```bash
   GH_USER=$(gh api user -q .login)
   ```

3. Build the images from the repo root:
   ```bash
   docker compose build
   ```

4. Build the dacpac image:
   ```bash
   docker build -t budget-dacpac ./backend/Budget.Database
   ```

5. Tag all three images:
   ```bash
   docker tag budget-frontend ghcr.io/$GH_USER/budget-frontend:latest
   docker tag budget-backend ghcr.io/$GH_USER/budget-backend:latest
   docker tag budget-dacpac ghcr.io/$GH_USER/budget-dacpac:latest
   ```

6. Push all three images:
   ```bash
   docker push ghcr.io/$GH_USER/budget-frontend:latest
   docker push ghcr.io/$GH_USER/budget-backend:latest
   docker push ghcr.io/$GH_USER/budget-dacpac:latest
   ```

7. Print the pushed image URLs so the user can confirm.

If any step fails, stop and report the error. Ask the user before retrying.
