# MySQL backup to Google Drive Cron Job

Simple cron job that creates a backup from a MySQL DB and uploads it to Google Drive

## Getting Started

1. 📦 Install dependencies
```
npm install 
```

2. ⚙️ Configure .env file
- (You'll need a Google OAuth 2.0 Client ID, Secret & Redirect URI)

3. 🛠️ Build the app
```
npm run build 
```

4. 🚀 Start cron job
```
npm run start 
```
or
```
pm2 start pm2/ecosystem.config.js
```