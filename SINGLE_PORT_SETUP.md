# NetMonitor - Single Port Setup (Port 3003)

This setup runs both frontend and backend on the same port (3003) to avoid connection issues.

## 🚀 Quick Start (Single Command)

```bash
# Install dependencies and start everything on port 3003
npm run setup && npm run start
```

## 📋 Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
npm install express cors multer
```

### 2. Option A: Quick Start Script

```bash
node start.js
```

### 2. Option B: Manual Build and Start

```bash
# Build the frontend
npm run build

# Start the combined server on port 3003
npm run production
```

### 2. Option C: Use npm scripts

```bash
# Build and start in one command
npm run start
```

## 🌐 Access Your Application

Once started, access everything at:
**http://localhost:3003**

- Frontend UI: `http://localhost:3003`
- API endpoints: `http://localhost:3003/api`
- Health check: `http://localhost:3003/api/health`

## 🔧 How It Works

1. **Frontend Build**: React app is built into the `dist/` folder
2. **Express Server**: Serves both static files and API routes on port 3003
3. **API Routes**: All `/api/*` requests go to the backend
4. **Frontend Routes**: All other requests serve the React app
5. **Data Storage**: Inventory stored in `inventory.json`

## 📁 Project Structure After Build

```
your-project/
├── dist/                  # Built frontend (auto-generated)
├── src/                   # Frontend source code
├── server.js             # Express server (serves both)
├── inventory.json        # Data storage
├── start.js              # Single-port startup script
└── package.json
```

## 🛠️ Available Commands

```bash
# Development (separate ports)
npm run dev              # Frontend only (port 8080)
npm run backend          # Backend only (port 3001)
npm run dev:full         # Both servers (separate ports)

# Production (single port 3003)
npm run build            # Build frontend only
npm run start            # Build + start on port 3003
npm run production       # Same as start
node start.js            # Alternative startup script

# Setup
npm run setup            # Install all dependencies
```

## ✅ Advantages of Single Port

- ✅ No CORS issues
- ✅ No connection problems between frontend/backend
- ✅ Simpler deployment
- ✅ Works better on servers and hosting platforms
- ✅ Single URL for everything

## 🐛 Troubleshooting

### Port 3003 already in use:

```bash
# Change port in server.js or use environment variable
PORT=3004 node server.js
```

### Build fails:

```bash
# Clear cache and rebuild
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### API not working:

- Check that `server.js` is running
- Verify `inventory.json` file is created
- Check console for error messages

## 🎯 Ready to Use!

After running `npm run start`, your complete NetMonitor application will be available at **http://localhost:3003** with:

- ✅ Persistent inventory storage
- ✅ Manual IP entry
- ✅ CSV/Excel file upload
- ✅ Configurable auto-ping monitoring
- ✅ Real-time dashboard
- ✅ Full inventory management

No more connection issues between frontend and backend!
