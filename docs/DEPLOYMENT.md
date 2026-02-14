# Deployment Guide - Bhasha Bridge AI

This guide covers deploying the Bhasha Bridge AI system to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Google Cloud Run](#google-cloud-run)
5. [Firebase Hosting](#firebase-hosting)
6. [Monitoring](#monitoring)
7. [Scaling](#scaling)

## Prerequisites

- Google Cloud Platform account
- Firebase project
- Docker installed (for containerization)
- gcloud CLI installed

## Environment Setup

### Production Environment Variables

Create a production `.env` file:

```env
# Production mode
NODE_ENV=production
PORT=8080

# Google Gemini
GEMINI_API_KEY=your_production_gemini_key
GEMINI_MODEL=gemini-3-pro
GEMINI_CONTEXT_SIZE=1000000

# Google Antigravity
ANTIGRAVITY_WORKSPACE_ID=your_prod_workspace
ANTIGRAVITY_API_KEY=your_prod_antigravity_key
ANTIGRAVITY_ENDPOINT=https://antigravity.google.com/api/v1

# Firebase
FIREBASE_PROJECT_ID=your_prod_project
FIREBASE_API_KEY=your_prod_firebase_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com

# Google Maps
GOOGLE_MAPS_API_KEY=your_prod_maps_key

# Bhashini
BHASHINI_API_KEY=your_prod_bhashini_key
BHASHINI_USER_ID=your_prod_user_id

# Logging
LOG_LEVEL=info
LOG_TO_FILE=true

# Agent Configuration
AGENT_MAX_PARALLEL=5
AGENT_TIMEOUT_MS=30000
```

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install dependencies
RUN npm ci --production
RUN apk add --no-cache python3 py3-pip
RUN pip3 install -r requirements.txt

# Copy application files
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
```

### 2. Create .dockerignore

```
node_modules
npm-debug.log
.env
.env.local
.git
.gitignore
*.md
tests
examples
docs
logs
.vscode
.idea
```

### 3. Build and Run

```bash
# Build image
docker build -t bhasha-bridge:latest .

# Run container
docker run -d \
  --name bhasha-bridge \
  -p 8080:8080 \
  --env-file .env.production \
  bhasha-bridge:latest

# View logs
docker logs -f bhasha-bridge

# Stop container
docker stop bhasha-bridge
```

### 4. Docker Compose (Optional)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    env_file:
      - .env.production
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Run with:
```bash
docker-compose up -d
```

## Google Cloud Run

### 1. Install gcloud CLI

```bash
# Windows (PowerShell)
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe

# Verify installation
gcloud --version
```

### 2. Initialize gcloud

```bash
gcloud init
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 3. Build and Push to Container Registry

```bash
# Enable Container Registry
gcloud services enable containerregistry.googleapis.com

# Configure Docker for gcloud
gcloud auth configure-docker

# Build and tag image
docker build -t gcr.io/YOUR_PROJECT_ID/bhasha-bridge:latest .

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/bhasha-bridge:latest
```

### 4. Deploy to Cloud Run

```bash
# Deploy
gcloud run deploy bhasha-bridge \
  --image gcr.io/YOUR_PROJECT_ID/bhasha-bridge:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "GEMINI_API_KEY=gemini-key:latest,FIREBASE_API_KEY=firebase-key:latest"

# Get service URL
gcloud run services describe bhasha-bridge --region us-central1 --format 'value(status.url)'
```

### 5. Configure Secrets (Recommended)

```bash
# Create secrets in Secret Manager
echo -n "your_gemini_key" | gcloud secrets create gemini-key --data-file=-
echo -n "your_firebase_key" | gcloud secrets create firebase-key --data-file=-

# Grant access
gcloud secrets add-iam-policy-binding gemini-key \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

## Firebase Hosting

For serving static frontend (future):

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Initialize Firebase

```bash
firebase login
firebase init hosting
```

### 3. Configure firebase.json

```json
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 4. Deploy

```bash
firebase deploy --only hosting
```

## Monitoring

### 1. Google Cloud Monitoring

```bash
# Enable APIs
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com

# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=bhasha-bridge" --limit 50
```

### 2. Setup Alerts

Create alerting policies in Google Cloud Console:
- High error rate (> 5%)
- High latency (> 5s)
- Low success rate (< 95%)
- Memory usage (> 80%)

### 3. Custom Monitoring Endpoint

Add to `src/index.js`:

```javascript
app.get('/metrics', (req, res) => {
  const status = orchestrator.getAgentStatus();
  const metrics = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    agents: status.agents,
    timestamp: new Date().toISOString(),
  };
  res.json(metrics);
});
```

## Scaling

### Horizontal Scaling (Cloud Run)

Cloud Run auto-scales based on:
- Request volume
- CPU utilization
- Memory usage

Configure in deployment:

```bash
gcloud run deploy bhasha-bridge \
  --min-instances 2 \    # Always keep 2 instances warm
  --max-instances 100 \  # Scale up to 100 instances
  --cpu-throttling \     # Throttle CPU when idle
  --concurrency 80       # 80 concurrent requests per instance
```

### Vertical Scaling

Increase resources per instance:

```bash
gcloud run deploy bhasha-bridge \
  --memory 4Gi \
  --cpu 4
```

### Load Testing

Test scaling with Apache Bench:

```bash
# Windows (install Apache)
ab -n 1000 -c 10 -H "Content-Type: application/json" \
  -p request.json \
  https://your-service-url/process

# request.json
{"text": "test", "location": {"lat": 19, "lng": 72}}
```

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Configure Docker
        run: gcloud auth configure-docker
      
      - name: Build
        run: docker build -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/bhasha-bridge:${{ github.sha }} .
      
      - name: Push
        run: docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/bhasha-bridge:${{ github.sha }}
      
      - name: Deploy
        run: |
          gcloud run deploy bhasha-bridge \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/bhasha-bridge:${{ github.sha }} \
            --region us-central1 \
            --platform managed
```

## Security Best Practices

1. **Use Secret Manager**: Never commit API keys
2. **Enable HTTPS**: Use Cloud Run's automatic HTTPS
3. **Set CORS**: Configure allowed origins
4. **Rate Limiting**: Implement request limits
5. **Authentication**: Add API key authentication
6. **Input Validation**: Validate all user inputs
7. **Security Headers**: Add security headers

```javascript
// Add security middleware
const helmet = require('helmet');
app.use(helmet());
```

## Backup and Recovery

### Database Backup (if using)

```bash
# Firebase Firestore
gcloud firestore export gs://YOUR_BUCKET/backup-$(date +%Y%m%d)
```

### Disaster Recovery

1. Keep Docker images in multiple registries
2. Deploy to multiple regions
3. Regular backups of configuration
4. Document recovery procedures

## Cost Optimization

1. **Use minimum instances**: Start with 1, scale up as needed
2. **Enable CPU throttling**: Reduce idle costs
3. **Set concurrency**: Optimize requests per instance
4. **Use caching**: Reduce API calls
5. **Monitor usage**: Track costs in Cloud Console

## Performance Optimization

1. **Connection Pooling**: Reuse connections
2. **Caching**: Cache frequent requests
3. **CDN**: Use Cloud CDN for static assets
4. **Compression**: Enable gzip compression
5. **Database Indexes**: Optimize queries

## Troubleshooting

### Check Logs

```bash
# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision" --limit 100

# Specific errors
gcloud logging read "severity>=ERROR" --limit 50
```

### Debug Container Locally

```bash
# Run with same config as production
docker run -it --env-file .env.production bhasha-bridge:latest /bin/sh
```

### Health Check Failures

1. Check `/health` endpoint
2. Verify environment variables
3. Check API key validity
4. Review resource limits

## Rollback

If deployment fails:

```bash
# List revisions
gcloud run revisions list --service bhasha-bridge

# Rollback to previous
gcloud run services update-traffic bhasha-bridge \
  --to-revisions REVISION-NAME=100
```

## Support

For deployment issues:
- Check [ARCHITECTURE.md](ARCHITECTURE.md)
- Review [QUICKSTART.md](../QUICKSTART.md)
- Open GitHub issue

---

**Last Updated**: February 14, 2026
