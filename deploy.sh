#!/bin/bash

# GuestPostLinks PR Boost - Ubuntu Server Deployment Script
# Run this script as root or with sudo privileges

set -e

echo "🚀 Starting GuestPostLinks PR Boost deployment..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18.x
echo "📥 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 globally
echo "📥 Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📥 Installing Nginx..."
apt install -y nginx

# Install Certbot for SSL
echo "📥 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www/guestpostlinks-pr-boost
cd /var/www/guestpostlinks-pr-boost

# Set proper permissions
chown -R $SUDO_USER:$SUDO_USER /var/www/guestpostlinks-pr-boost

echo "✅ Basic system setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your project files to /var/www/guestpostlinks-pr-boost"
echo "2. Copy nginx.conf to /etc/nginx/sites-available/guestpostlinks-pr-boost"
echo "3. Create symlink: ln -s /etc/nginx/sites-available/guestpostlinks-pr-boost /etc/nginx/sites-enabled/"
echo "4. Remove default site: rm /etc/nginx/sites-enabled/default"
echo "5. Test nginx config: nginx -t"
echo "6. Reload nginx: systemctl reload nginx"
echo "7. Install dependencies: npm install"
echo "8. Build the project: npm run build"
echo "9. Start with PM2: pm2 start ecosystem.config.js"
echo "10. Setup SSL: certbot --nginx -d pr.guestpostlinks.net"
echo "11. Enable PM2 startup: pm2 startup && pm2 save"
echo ""
echo "🔧 For detailed instructions, see the README.md file"
