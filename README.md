# 🧾 Professional Invoice Management System

A modern, responsive invoice management system built with HTML, CSS, JavaScript frontend and Django REST API backend.

## ✨ Features

- **Professional Design** - Modern UI with smooth animations and responsive layout
- **Customer Management** - Create and manage customer database
- **Invoice Creation** - Dynamic invoice creation with line items
- **Real-time Calculations** - Automatic tax and total calculations
- **Print Support** - Professional print-ready invoice layouts
- **API Integration** - Full REST API backend integration
- **Data Persistence** - Local storage backup and auto-save

## 🚀 Quick Start

### Frontend (Static Files)

1. **Serve the files** using any web server:
   ```bash
   # Using Python (built-in)
   python -m http.server 3000
   
   # Using Node.js (if you have live-server)
   npx live-server --port=3000
   
   # Using any web server
   ```

2. **Configure API endpoint** in `api-service.js`:
   ```javascript
   this.baseURL = 'https://your-backend-url.com/api';
   ```

3. **Access the application**:
   - Main invoice creator: `http://localhost:3000`
   - Invoice list: `http://localhost:3000/invoices.html`

### Backend Setup

See the [backend deployment guide](backend/DEPLOYMENT_GUIDE.md) for complete Django setup.

## 📁 Project Structure

```
├── index.html              # Main invoice creation page
├── invoices.html           # Invoice list and management
├── style.css               # All styling and design system
├── script.js               # Main application logic
├── api-service.js          # API integration layer
├── api-config.js           # API configuration modal
└── backend/                # Django REST API backend
    ├── invoice_system/     # Django project
    ├── invoices/           # Django app
    ├── requirements.txt    # Python dependencies
    └── DEPLOYMENT_GUIDE.md # Backend setup guide
```

## 🔧 Configuration

### API Configuration

The application includes an API configuration modal accessible via the "⚙️ API Settings" button:

- **Backend URL**: Your Django API base URL
- **Authentication**: Optional Bearer token support
- **Connection Testing**: Built-in connectivity validation

### Environment Variables

For production deployment, configure:

```bash
# Frontend
API_BASE_URL=https://your-backend.com/api

# Backend (Django)
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db
ALLOWED_HOSTS=your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend.com
```

## 🌐 Deployment Options

### Frontend Deployment

**Netlify:**
1. Connect your GitHub repository
2. Set build command: `echo "Static site"`
3. Set publish directory: `/`

**Vercel:**
1. Import GitHub repository
2. Framework preset: Other
3. Build command: `echo "Static site"`

**GitHub Pages:**
1. Enable GitHub Pages in repository settings
2. Source: Deploy from branch `main`

### Backend Deployment

**Railway:**
```bash
railway login
railway new
railway add postgresql
railway up
```

**Render:**
1. Connect GitHub repository
2. Add PostgreSQL database
3. Deploy web service

See [backend/DEPLOYMENT_GUIDE.md](backend/DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📊 API Endpoints

The backend provides these REST API endpoints:

- `GET/POST /api/customers/` - Customer management
- `GET/POST /api/invoices/` - Invoice management
- `GET/POST /api/invoices/{id}/items/` - Invoice items
- `GET /api/dashboard/stats/` - Dashboard statistics
- `GET /health/` - Health check

## 🎨 Design System

The application uses a comprehensive design system with:

- **CSS Custom Properties** for consistent theming
- **Modern Color Palette** with semantic color meanings
- **Typography Scale** for proper text hierarchy
- **Spacing System** for consistent layouts
- **Component Library** for reusable UI elements

## 🛡️ Security Features

- **Input Validation** on all forms
- **XSS Protection** with proper data sanitization
- **CORS Configuration** for secure API access
- **Environment-based Configuration** for sensitive data
- **UUID Primary Keys** to prevent enumeration attacks

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🆘 Support

- **Documentation**: [Backend Deployment Guide](backend/DEPLOYMENT_GUIDE.md)
- **Issues**: GitHub Issues
- **API Reference**: See backend documentation

---
 
**Builtwith by pritam


