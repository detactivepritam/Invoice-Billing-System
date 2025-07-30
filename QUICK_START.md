# 🚀 Quick Start Guide

Get your invoice system running in minutes!

## 📱 **Option 1: Use Immediately (No Backend Required)**

Perfect for testing and immediate use:

1. **Open the app** in your browser:
   - Download/clone the repository
   - Open `index.html` in your browser
   - OR serve with: `python -m http.server 3000`

2. **Skip backend configuration**:
   - Click the ⚙️ API Settings button
   - Click "Skip for Now"
   - Start creating invoices immediately!

3. **Features available**:
   - ✅ Create invoices
   - ✅ Add customers
   - ✅ Print invoices
   - ✅ Auto-save to browser storage
   - ✅ Responsive design

## 🗄️ **Option 2: Full Setup with Database (Recommended)**

For production use with data persistence:

### **Step 1: Deploy Backend**
```bash
# Deploy to Railway (easiest)
1. Sign up at railway.app
2. Connect your GitHub repo
3. Deploy the backend/ folder
4. Add PostgreSQL database
5. Get your Railway URL
```

### **Step 2: Configure Frontend**
```bash
1. Open your invoice app
2. Click ⚙️ API Settings
3. Enter your Railway URL (e.g., https://yourapp.railway.app)
4. Click "Validate URL"
5. Save configuration
```

### **Step 3: You're Done!**
- ✅ Backend database storage
- ✅ Multi-device access
- ✅ Real-time data sync
- ✅ Backup and recovery

## 🔧 **Configuration Examples**

### **Local Development**
```
Backend URL: http://localhost:8000
Auth Token: (leave empty)
```

### **Railway Production**
```
Backend URL: https://myinvoice.railway.app
Auth Token: (optional)
```

### **Render Production**
```
Backend URL: https://myinvoice.onrender.com
Auth Token: (optional)
```

## 📋 **Need Help?**

- **Frontend Issues**: Check browser console
- **Backend Issues**: See `backend/DEPLOYMENT_GUIDE.md`
- **API Integration**: See `INTEGRATION_GUIDE.md`
- **General Setup**: See `README.md`

## 🎯 **Common Solutions**

**"Backend unavailable"**
→ Either use Skip for Now, or deploy backend first

**"CORS errors"**
→ Add your frontend domain to Django CORS settings

**"No customers loading"**
→ Create customers manually or check API configuration

---

**🎉 Start with Option 1 to test immediately, then upgrade to Option 2 for production!**
