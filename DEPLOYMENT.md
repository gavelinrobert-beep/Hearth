# Deployment Guide

This guide covers various deployment options for NoIDchat.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Docker Compose Deployment](#docker-compose-deployment)
- [Manual Deployment](#manual-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Environment Configuration](#environment-configuration)
- [SSL/TLS Setup](#ssltls-setup)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)

## Prerequisites

Before deploying, ensure you have:

- A server with Docker and Docker Compose installed
- Domain name (optional, but recommended for production)
- SSL certificate (for HTTPS)
- PostgreSQL database
- Redis instance
- Sufficient resources:
  - Minimum: 2 CPU cores, 4GB RAM, 20GB storage
  - Recommended: 4 CPU cores, 8GB RAM, 50GB storage

## Docker Compose Deployment

The easiest way to deploy NoIDchat is using Docker Compose.

### 1. Clone the Repository

```bash
git clone https://github.com/gavelinrobert-beep/NoIDchat.git
cd NoIDchat
```

### 2. Configure Environment

Create production environment file:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with production values:

```env
DATABASE_URL="postgresql://noidchat:STRONG_PASSWORD@postgres:5432/noidchat"
REDIS_URL="redis://redis:6379"
JWT_SECRET="GENERATE_A_STRONG_SECRET_KEY"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="production"
LLAMA_API_URL="http://host.docker.internal:11434"
MAX_FILE_SIZE=10485760
CORS_ORIGIN="https://yourdomain.com"
```

Update `docker-compose.yml` for production:
- Change database password
- Update CORS_ORIGIN
- Configure volumes for persistent data

### 3. Deploy

```bash
docker-compose up -d
```

### 4. Initialize Database

```bash
docker-compose exec backend npx prisma migrate deploy
```

### 5. Access Application

- Frontend: http://your-server-ip:5173
- Backend: http://your-server-ip:3000

## Manual Deployment

For more control, you can deploy each component manually.

### Backend Deployment

1. **Install Dependencies**
```bash
cd backend
npm ci --only=production
```

2. **Build Application**
```bash
npm run build
```

3. **Setup Database**
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. **Start Server**
```bash
npm start
```

Or use a process manager like PM2:
```bash
npm install -g pm2
pm2 start dist/index.js --name noidchat-backend
pm2 save
pm2 startup
```

### Frontend Deployment

1. **Install Dependencies**
```bash
cd frontend
npm ci --only=production
```

2. **Build Application**
```bash
npm run build
```

3. **Serve with Nginx**

Install Nginx and configure:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/NoIDchat/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

## Cloud Deployment

### AWS Deployment

#### Using ECS (Elastic Container Service)

1. Build and push Docker images to ECR
2. Create ECS cluster
3. Define task definitions for backend and frontend
4. Create services with load balancers
5. Setup RDS for PostgreSQL
6. Setup ElastiCache for Redis

#### Using EC2

1. Launch EC2 instance (t3.medium or larger)
2. Install Docker and Docker Compose
3. Follow Docker Compose deployment steps
4. Configure security groups:
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 22 (SSH)

### DigitalOcean Deployment

1. Create a Droplet (4GB RAM minimum)
2. SSH into droplet
3. Install Docker and Docker Compose:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo apt-get install docker-compose-plugin
```
4. Follow Docker Compose deployment steps

### Heroku Deployment

Not recommended due to WebSocket requirements, but possible with addons.

## Environment Configuration

### Production Environment Variables

**Backend (.env)**
```env
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
LLAMA_API_URL=http://llama-host:11434
MAX_FILE_SIZE=10485760
CORS_ORIGIN=https://yourdomain.com
```

**Frontend (.env.production)**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### Generating Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 24
```

## SSL/TLS Setup

### Using Let's Encrypt (Certbot)

1. **Install Certbot**
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. **Obtain Certificate**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Auto-renewal**
```bash
sudo certbot renew --dry-run
```

### Update Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Rest of configuration...
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring and Logging

### Application Logs

**View Docker logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**PM2 logs:**
```bash
pm2 logs noidchat-backend
```

### Health Checks

Backend health endpoint:
```bash
curl http://localhost:3000/health
```

### Monitoring Tools

Recommended monitoring solutions:
- **Prometheus + Grafana** - Metrics and dashboards
- **ELK Stack** - Log aggregation
- **Sentry** - Error tracking
- **Uptime Robot** - Uptime monitoring

### Setting up Prometheus

Add to `docker-compose.yml`:
```yaml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
```

## Backup and Recovery

### Database Backup

**Manual backup:**
```bash
docker-compose exec postgres pg_dump -U noidchat noidchat > backup.sql
```

**Automated daily backups:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec postgres pg_dump -U noidchat noidchat > backup_$DATE.sql
# Upload to S3 or cloud storage
aws s3 cp backup_$DATE.sql s3://your-bucket/backups/
```

Add to crontab:
```bash
0 2 * * * /path/to/backup-script.sh
```

### Database Restore

```bash
docker-compose exec -T postgres psql -U noidchat noidchat < backup.sql
```

### File Uploads Backup

```bash
tar -czf uploads_backup.tar.gz backend/uploads/
# Upload to cloud storage
```

## Performance Optimization

### Nginx Caching

Add to Nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g;

location /api {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    # Other proxy settings...
}
```

### Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_messages_channel_id ON messages(channel_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

### Redis Caching

Implement caching for:
- User sessions
- Frequently accessed data
- Rate limiting

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall (UFW or security groups)
- [ ] Setup fail2ban for SSH protection
- [ ] Regular security updates
- [ ] Implement rate limiting
- [ ] Enable CORS only for your domain
- [ ] Use environment variables for secrets
- [ ] Regular database backups
- [ ] Monitor application logs
- [ ] Scan Docker images for vulnerabilities

## Scaling

### Horizontal Scaling

1. Deploy multiple backend instances
2. Use a load balancer (Nginx, HAProxy, AWS ALB)
3. Ensure session stickiness for WebSocket connections
4. Scale PostgreSQL with read replicas
5. Use Redis cluster for distributed caching

### Vertical Scaling

- Upgrade server resources (CPU, RAM)
- Optimize database queries
- Implement caching strategies
- Use CDN for static assets

## Troubleshooting

### Application Won't Start

- Check logs: `docker-compose logs`
- Verify environment variables
- Ensure database is accessible
- Check port availability

### Database Connection Issues

- Verify DATABASE_URL
- Check PostgreSQL is running
- Verify network connectivity
- Check firewall rules

### WebSocket Connection Issues

- Ensure WebSocket proxy is configured
- Check for SSL/TLS issues
- Verify CORS settings
- Check for network firewalls blocking WebSocket

## Support

For deployment issues:
- Check documentation
- Review GitHub issues
- Contact support team

## Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run migrations if needed
docker-compose exec backend npx prisma migrate deploy
```

### Database Migrations

```bash
docker-compose exec backend npx prisma migrate deploy
```

---

For additional help, refer to the [Development Guide](DEVELOPMENT.md) or open an issue on GitHub.
