# Deployment Guide for BharatAgent

This guide covers deploying BharatAgent to Google Cloud Platform.

## Prerequisites

1. Google Cloud Project with billing enabled
2. Firebase project created
3. WhatsApp Business API access (Twilio account)
4. Google Maps API key
5. Domain for webhooks (optional but recommended)

## Step 1: Set Up Google Cloud

```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
  cloudfunctions.googleapis.com \
  aiplatform.googleapis.com \
  firestore.googleapis.com \
  run.googleapis.com
```

## Step 2: Configure Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init firestore

# Download service account credentials
# Go to: Firebase Console → Project Settings → Service Accounts
# Generate new private key → Save as backend/config/firebase-creds.json
```

## Step 3: Set Up Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```
GCP_PROJECT_ID=your-actual-project-id
GOOGLE_MAPS_API_KEY=your-maps-api-key
WHATSAPP_ACCOUNT_SID=your-twilio-sid
WHATSAPP_AUTH_TOKEN=your-twilio-token
WHATSAPP_FROM_NUMBER=whatsapp:+14155238886
```

## Step 4: Deploy Backend to Cloud Functions

```bash
# Deploy main API
gcloud functions deploy bharat-agent-api \
  --runtime python312 \
  --trigger-http \
  --allow-unauthenticated \
  --region asia-south1 \
  --entry-point app \
  --source backend/ \
  --set-env-vars $(cat .env | xargs)

# Deploy webhook handler
gcloud functions deploy whatsapp-webhook \
  --runtime python312 \
  --trigger-http \
  --allow-unauthenticated \
  --region asia-south1 \
  --entry-point whatsapp_webhook \
  --source backend/ \
  --set-env-vars $(cat .env | xargs)
```

## Step 5: Deploy to Cloud Run (Alternative)

For better control and scaling:

```bash
# Build Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/bharat-agent:v1 .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/bharat-agent:v1

# Deploy to Cloud Run
gcloud run deploy bharat-agent \
  --image gcr.io/YOUR_PROJECT_ID/bharat-agent:v1 \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars $(cat .env | xargs)
```

## Step 6: Configure WhatsApp Webhook

1. Get your Cloud Function/Run URL:
```bash
gcloud functions describe whatsapp-webhook --region asia-south1 --format="value(httpsTrigger.url)"
```

2. Configure in Twilio Console:
   - Go to Twilio Console → WhatsApp → Sandbox/Production
   - Set "WHEN A MESSAGE COMES IN" to your webhook URL
   - Method: POST

## Step 7: Deploy Frontend Dashboard

```bash
cd frontend/dashboard

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Firebase Hosting
firebase init hosting
firebase deploy --only hosting
```

## Step 8: Set Up Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own shop data
    match /bharat_agent_shops/{shopId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.owner_uid;
    }
    
    // Allow authenticated users to access their inventory
    match /bharat_agent_inventory/{itemId} {
      allow read, write: if request.auth != null;
    }
    
    // Orders: read/write by shop owner
    match /bharat_agent_orders/{orderId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## Step 9: Configure Gemini API

```bash
# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Set up authentication
gcloud auth application-default login

# Test Gemini access
python -c "from google.cloud import aiplatform; print('Gemini API ready')"
```

## Step 10: Test Deployment

```bash
# Test health endpoint
curl https://YOUR_CLOUD_FUNCTION_URL/health

# Test WhatsApp webhook with sample data
curl -X POST https://YOUR_WEBHOOK_URL/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "text": "Hello",
    "shop_id": "shop_test"
  }'
```

## Monitoring and Logging

### View Logs
```bash
# Cloud Functions logs
gcloud functions logs read bharat-agent-api --region asia-south1

# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

### Set Up Monitoring
```bash
# Enable Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# Create alerts for errors
gcloud alpha monitoring policies create \
  --notification-channels=YOUR_CHANNEL_ID \
  --display-name="BharatAgent Errors" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=5
```

## Scaling Configuration

### Cloud Functions
```bash
# Set max instances
gcloud functions deploy bharat-agent-api \
  --max-instances 100 \
  --min-instances 1
```

### Cloud Run
```bash
# Configure autoscaling
gcloud run services update bharat-agent \
  --min-instances 1 \
  --max-instances 100 \
  --concurrency 80
```

## Cost Optimization

1. **Cloud Functions**: Free tier includes 2M invocations/month
2. **Firestore**: Free tier includes 1GB storage, 50K reads/day
3. **Gemini API**: Pay per token (optimize context usage)
4. **Cloud Run**: Pay for actual usage (scale to zero when idle)

### Cost Monitoring
```bash
# Set up budget alerts
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT \
  --display-name="BharatAgent Budget" \
  --budget-amount=100USD
```

## Security Best Practices

1. **Never commit credentials**: Use Secret Manager
2. **Enable HTTPS only**: Already enforced by Cloud Functions/Run
3. **Validate WhatsApp webhooks**: Verify Twilio signatures
4. **Rate limiting**: Use Cloud Armor or API Gateway
5. **Firestore rules**: Implement strict access controls

## Troubleshooting

### Common Issues

**1. Firebase credentials not found**
```bash
# Ensure firebase-creds.json exists
ls -la backend/config/firebase-creds.json

# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="backend/config/firebase-creds.json"
```

**2. WhatsApp messages not received**
- Check webhook URL is publicly accessible
- Verify Twilio webhook configuration
- Check Cloud Functions logs for errors

**3. Gemini API errors**
- Verify Vertex AI is enabled
- Check quota limits
- Ensure proper authentication

### Debug Mode

Enable debug logging:
```bash
# Set environment variable
gcloud functions deploy bharat-agent-api \
  --set-env-vars DEBUG=true,LOG_LEVEL=DEBUG
```

## Production Checklist

- [ ] All API keys configured
- [ ] Firebase credentials uploaded
- [ ] WhatsApp webhook configured
- [ ] Firestore security rules deployed
- [ ] Cloud Functions/Run deployed
- [ ] Frontend dashboard deployed
- [ ] Monitoring and alerts configured
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Documentation updated

## Support

For issues or questions:
- Check logs: `gcloud functions logs read`
- Review documentation: `/docs`
- Contact: support@bharatagent.com
