# Quizcraze Backend Deployment Guide

## Prerequisites

1. Node.js (v14 or higher)
2. MongoDB (v4.4 or higher)
3. Redis (v6 or higher)
4. PM2 (for process management)
5. Gmail account (for email OTP)
6. Twilio account (for SMS OTP)

## Environment Setup

1. Create `.env` file in the root directory:
```env
# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB Configuration
MONGODB_URI=your_mongodb_uri

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Redis Configuration
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-url.com
```

## Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/your-repo/quizcraze-backend.git
cd quizcraze-backend
```

2. Install dependencies:
```bash
npm install --production
```

3. Create required directories:
```bash
mkdir logs
```

4. Install PM2 globally:
```bash
npm install -g pm2
```

5. Start the application:
```bash
pm2 start ecosystem.config.js
```

## MongoDB Setup

1. Create indexes for better performance:
```javascript
// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "phone": 1 })
db.users.createIndex({ "prn": 1 }, { sparse: true })

// Classes collection
db.classes.createIndex({ "enrollmentKey": 1 }, { unique: true })
db.classes.createIndex({ "teacher": 1 })

// Quizzes collection
db.quizzes.createIndex({ "teacher": 1 })
db.quizzes.createIndex({ "classes": 1 })
db.quizzes.createIndex({ "scheduledFor": 1 })
```

## Redis Setup

1. Configure Redis password:
```bash
redis-cli
CONFIG SET requirepass "your_redis_password"
```

2. Enable persistence:
```bash
redis-cli
CONFIG SET appendonly yes
```

## Security Considerations

1. Enable MongoDB Authentication
2. Configure Redis Password
3. Set up SSL/TLS
4. Configure Firewall Rules
5. Regular Security Updates

## Monitoring

1. Monitor application logs:
```bash
pm2 logs
```

2. Monitor application metrics:
```bash
pm2 monit
```

3. Check application status:
```bash
pm2 status
```

## Backup Strategy

1. MongoDB Backup (daily):
```bash
mongodump --uri="your_mongodb_uri" --out=/backup/mongodb/$(date +%Y%m%d)
```

2. Redis Backup (daily):
```bash
redis-cli SAVE
cp /var/lib/redis/dump.rdb /backup/redis/dump_$(date +%Y%m%d).rdb
```

## Troubleshooting

1. Check application logs:
```bash
tail -f logs/error.log
tail -f logs/combined.log
```

2. Check PM2 logs:
```bash
pm2 logs
```

3. Monitor Redis:
```bash
redis-cli monitor
```

4. Monitor MongoDB:
```bash
mongotop
mongostat
```

## Performance Optimization

1. Enable MongoDB indexes
2. Configure Redis caching
3. Use PM2 cluster mode
4. Enable compression
5. Implement rate limiting

## Scaling Guidelines

1. Use MongoDB replica sets
2. Set up Redis cluster
3. Configure load balancer
4. Implement horizontal scaling
5. Use CDN for static assets
