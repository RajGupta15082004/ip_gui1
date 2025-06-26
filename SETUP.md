# NetMonitor - Network Monitoring Dashboard

A full-stack React application for monitoring IP addresses and network hosts with persistent data storage.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm

### Setup & Installation

1. **Install dependencies:**

   ```bash
   npm run setup
   ```

2. **Start the backend server:** (Required for data persistence)

   ```bash
   npm run backend
   ```

   The backend server will run on `http://localhost:3001`

3. **Start the frontend development server:** (In a new terminal)
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:8080`

### Alternative: Run Both Servers Together

```bash
npm run dev:full
```

This will start both backend and frontend servers simultaneously.

## 🌟 Features

### ✅ Fixed Issues

- **✅ Data Persistence**: No more data loss on page refresh - all data is stored on the backend
- **✅ Enhanced Auto-Ping**: Configurable intervals from 10 seconds to 1 hour
- **✅ Excel File Support**: Automatically converts Excel files (.xlsx, .xls) to CSV format
- **✅ Better File Parsing**: Improved error handling and validation

### 🆕 New Features

- **📝 Manual IP Entry**: Add individual IP addresses through a user-friendly form
- **📊 Inventory Management**: View, edit, and manage all your IP addresses in one place
- **🔄 Bulk Operations**: Upload CSV/Excel files to add multiple IPs at once
- **📈 Enhanced Dashboard**: Real-time statistics and monitoring status
- **🎛️ Configurable Auto-Ping**: Set custom monitoring intervals
- **💾 Backend API**: RESTful API for inventory management

## 📱 Application Structure

### Frontend Pages

- **Dashboard (`/`)**: Main monitoring interface with real-time status
- **Add Inventory (`/add-inventory`)**: Add IPs manually or via file upload
- **Show Inventory (`/show-inventory`)**: Manage existing IP inventory

### Backend API Endpoints

- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Add single IP
- `POST /api/inventory/bulk` - Bulk add IPs
- `PUT /api/inventory/:id` - Update inventory item
- `PUT /api/inventory/ping-results` - Bulk update ping results
- `DELETE /api/inventory/:id` - Delete inventory item
- `DELETE /api/inventory` - Clear all inventory

## 📁 File Format Support

### CSV Format

```csv
Server Name,IP Address
Web Server,192.168.1.100
Database,10.0.0.50
Mail Server,172.16.0.10
```

### Excel Support

- Supports `.xlsx` and `.xls` formats
- Automatically converts to CSV
- IP addresses can be in any column
- Automatic header detection
- Mixed hostnames and IPs supported

## 🔧 Configuration

### Auto-Ping Intervals

- 10 seconds (Very frequent)
- 20 seconds (Frequent)
- 30 seconds (Default)
- 1-2 minutes (Standard)
- 5-10 minutes (Conservative)
- 30 minutes - 1 hour (Low frequency)

### Data Storage

- Backend uses JSON file storage (`inventory.json`)
- Automatic file creation and management
- Persistent across server restarts

## 🛠️ Development

### Project Structure

```
├── src/
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and API client
│   ├── pages/             # Page components
│   └── types/             # TypeScript type definitions
├── server.js              # Express backend server
├── inventory.json         # Data storage (auto-created)
└── package.json
```

### Adding New Features

1. Backend changes: Modify `server.js` and add API endpoints
2. Frontend changes: Update React components and hooks
3. API integration: Use the `apiClient` from `src/lib/api.ts`

## 🐛 Troubleshooting

### Backend Server Issues

- **Port already in use**: Change the port in `server.js` (default: 3001)
- **CORS errors**: Ensure the backend server is running
- **File permissions**: Make sure the app can write to `inventory.json`

### Frontend Issues

- **API connection errors**: Verify backend server is running on port 3001
- **File upload errors**: Check file format and size
- **Auto-ping not working**: Ensure proper interval configuration

### Common Error Messages

- **"Network error"**: Backend server is not running
- **"Failed to parse Excel file"**: File may be corrupted or wrong format
- **"No valid IP addresses found"**: Check your file format and content

## 📝 License

This project is open source and available under the MIT License.
