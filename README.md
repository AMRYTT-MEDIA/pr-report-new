# GuestPostLinks PR Boost

A professional PR distribution and reporting platform built with Next.js 14, Firebase authentication, and Tailwind CSS.

## 🚀 Features

- **Firebase Authentication** with 3-tier role system (Admin, Manager, User)
- **CSV Import & Processing** for PR distribution reports
- **Public/Private Report Sharing** with email verification
- **Local Database Storage** for reports and user data
- **Responsive Design** with Tailwind CSS
- **Role-based Access Control** for different user permissions

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router
- **Authentication**: Firebase Auth
- **Database**: Local Storage + Firestore (user management)
- **Styling**: Tailwind CSS
- **Deployment**: Ubuntu Server + Nginx + PM2

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Firebase project
- Ubuntu server (for production deployment)

## 🛠️ Local Development Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd guestpostlinks-pr-boost
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment template and fill in your Firebase credentials:

```bash
cp env.example .env.local
```

Edit `.env.local` with your Firebase project details:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Get your project configuration from Project Settings

### 5. Create Initial Admin User

In Firebase Console:

1. Go to Authentication > Users
2. Add a new user with admin email
3. Go to Firestore > Data
4. Create a document in `users` collection:
   ```json
   {
     "email": "admin@yourdomain.com",
     "role": "admin",
     "createdAt": "2024-01-01T00:00:00.000Z",
     "lastLogin": "2024-01-01T00:00:00.000Z"
   }
   ```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Production Deployment

### Ubuntu Server Setup

#### 1. Run the deployment script

```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

#### 2. Upload project files

```bash
# From your local machine
scp -r ./* user@your-server:/var/www/guestpostlinks-pr-boost/
```

#### 3. Configure Nginx

```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/guestpostlinks-pr-boost

# Create symlink
sudo ln -s /etc/nginx/sites-available/guestpostlinks-pr-boost /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

#### 4. Build and start the application

```bash
cd /var/www/guestpostlinks-pr-boost

# Install dependencies
npm install

# Build the project
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Enable PM2 startup
pm2 startup
pm2 save
```

#### 5. Setup SSL Certificate

```bash
sudo certbot --nginx -d pr.guestpostlinks.net
```

#### 6. Final Nginx reload

```bash
sudo systemctl reload nginx
```

## 🔐 User Roles & Permissions

### Admin

- All Manager permissions
- Create/Delete/Manage users
- Assign roles
- System settings

### Manager

- All User permissions
- Delete reports
- Rename reports
- View all user reports

### User

- Import CSV
- Create reports
- Share reports (Public/Private)
- View own reports

## 📊 CSV Import Format

The system expects CSV files with the following structure:

```csv
Exchange Symbol,Recipient,URL,Potential Reach,About,Value
PrivateCompany,Business Insider,https://example.com/article,88000000,Description,Value
```

**Required Columns:**

- **Recipient**: Media outlet name
- **URL**: Published article URL
- **Potential Reach**: Audience size (can include commas)

## 🔄 Report Sharing

### Public Reports

- Accessible via direct URL
- No authentication required
- Full report view
- Can be indexed by search engines

### Private Reports

- Requires email confirmation
- Email verification before access
- Full report view after verification
- Not publicly accessible

## 🛡️ Security Features

- Firebase Authentication
- Role-based access control
- Email verification for private reports
- Secure headers with Nginx
- SSL/TLS encryption

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS for styling
- Responsive tables and components
- Touch-friendly interface

## 🔧 Configuration Files

- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `ecosystem.config.js` - PM2 process management
- `nginx.conf` - Nginx reverse proxy configuration
- `deploy.sh` - Ubuntu server setup script

## 📁 Project Structure

```
app/
├── (auth)/
│   ├── login/page.jsx          # Login page
│   └── dashboard/page.jsx      # User dashboard
├── report/
│   └── [id]/page.jsx          # Report viewing page
├── layout.jsx                  # Root layout
├── page.jsx                    # Landing page
└── globals.css                 # Global styles

components/
├── ui/                         # shadcn/ui components
├── Header.jsx                  # Navigation header
├── HeroSection.jsx             # Landing hero
├── ServicesSection.jsx         # Services overview
└── ...                         # Other components

lib/
├── auth.js                     # Authentication context
├── firebase.js                 # Firebase configuration
└── utils.js                    # Utility functions

utils/
└── logoMapping.js              # Media outlet logos
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Firebase Authentication Errors

- Verify environment variables are correct
- Check Firebase project settings
- Ensure Authentication is enabled

#### 2. Build Errors

- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

#### 3. Nginx Issues

- Check configuration: `nginx -t`
- View logs: `tail -f /var/log/nginx/error.log`
- Verify firewall settings

#### 4. PM2 Issues

- Check status: `pm2 status`
- View logs: `pm2 logs`
- Restart: `pm2 restart guestpostlinks-pr-boost`

## 📞 Support

For technical support or questions:

- Check the troubleshooting section
- Review Firebase documentation
- Check Next.js documentation

## 📄 License

This project is proprietary software. All rights reserved.

## 🔄 Updates

To update the application:

1. Pull latest changes: `git pull origin main`
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Restart PM2: `pm2 restart guestpostlinks-pr-boost`

---

**Built with ❤️ using Next.js 14, Firebase, and Tailwind CSS**
