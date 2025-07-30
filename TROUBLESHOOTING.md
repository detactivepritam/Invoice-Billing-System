# 🔧 Troubleshooting Guide

Common issues and solutions for the Invoice Management System.

## 🚨 **Common Frontend Issues**

### **"Backend unavailable" Status**

**Symptoms:** Red status indicator, no customers loading
**Solutions:**
1. **No backend needed**: Click "Skip for Now" in API settings
2. **Deploy backend**: Follow `backend/DEPLOYMENT_GUIDE.md`
3. **Check URL**: Ensure correct backend URL in API settings
4. **Wait for deployment**: Backend services take 1-2 minutes to start

### **"Failed to fetch" Errors**

**Symptoms:** Console errors about fetch failures
**Solutions:**
1. **Expected behavior**: This happens when no backend is configured
2. **Check configuration**: Verify API settings URL format
3. **CORS issues**: Add frontend domain to Django CORS_ALLOWED_ORIGINS
4. **Network issues**: Check internet connection

### **Customers Not Loading**

**Symptoms:** Empty customer dropdown, can't save invoices
**Solutions:**
1. **Create manually**: Use "Create New Customer" button
2. **Check API**: Verify backend API endpoint `/api/customers/`
3. **Local mode**: Works offline with local storage
4. **Database empty**: Create customers via Django admin

## 🗄️ **Common Backend Issues**

### **Deployment Failures**

**Railway Issues:**
```bash
# Check logs
railway logs

# Common fixes
railway restart
railway run python manage.py migrate
```

**Render Issues:**
```bash
# Check build logs in dashboard
# Common fixes:
- Increase build timeout
- Check requirements.txt
- Verify Python version
```

### **Database Connection Errors**

**Symptoms:** 500 errors, migration failures
**Solutions:**
```bash
# Railway
railway add postgresql
railway run python manage.py migrate

# Render
# Add PostgreSQL in dashboard
# Check DATABASE_URL environment variable
```

### **CORS Errors**

**Symptoms:** Browser blocks API requests
**Solutions:**
```python
# In Django settings.py
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
    "http://localhost:3000",  # For local development
]
```

## 🔧 **API Configuration Issues**

### **Invalid URL Format**

**Problem:** URL validation fails
**Solutions:**
```
❌ Wrong: https://myapp.railway.app/api
✅ Correct: https://myapp.railway.app

❌ Wrong: myapp.railway.app
✅ Correct: https://myapp.railway.app
```

### **Authentication Errors**

**Problem:** 401/403 errors
**Solutions:**
1. **Remove auth token**: Leave blank if not using authentication
2. **Check format**: Should be "Bearer your-token" or just "your-token"
3. **Django settings**: Ensure auth is configured correctly

## 🎨 **UI/Display Issues**

### **Broken Layout**

**Symptoms:** CSS not loading, broken styling
**Solutions:**
1. **Clear browser cache**: Ctrl+F5 or Cmd+Shift+R
2. **Check file paths**: Ensure style.css is in same directory
3. **Server configuration**: Serve static files correctly

### **Print Issues**

**Symptoms:** Print layout broken, missing content
**Solutions:**
1. **Use print preview**: Check before printing
2. **Modern browser**: Chrome/Firefox recommended
3. **Print settings**: Ensure "Background graphics" enabled

## 📱 **Mobile/Responsive Issues**

### **Mobile Layout Problems**

**Solutions:**
1. **Viewport meta tag**: Check it's in HTML head
2. **CSS media queries**: Use responsive design system
3. **Touch targets**: Ensure buttons are large enough

## 🔍 **Debugging Steps**

### **General Debugging Process**

1. **Check browser console**: Look for JavaScript errors
2. **Check network tab**: See failed API requests
3. **Check API status**: Use ⚙️ API Settings to test
4. **Try incognito mode**: Rule out cache/extension issues
5. **Check backend logs**: Use platform logging tools

### **Backend Debugging**

```bash
# Railway
railway logs --tail

# Render
# Check logs in dashboard

# Local development
python manage.py runserver --verbosity=2
```

### **Frontend Debugging**

```javascript
// Enable debug mode in browser console
localStorage.setItem('debug', 'true');

// Check API service status
console.log(window.apiService);

// Check stored configuration
console.log(localStorage.getItem('invoiceApiConfig'));
```

## 🆘 **Getting Help**

### **Before Asking for Help**

1. **Check this guide**: Most issues are covered here
2. **Check browser console**: Note any error messages
3. **Check backend logs**: Note any server errors
4. **Try basic steps**: Clear cache, try different browser

### **What Information to Include**

- **Browser**: Chrome 91, Firefox 89, etc.
- **Platform**: Railway, Render, local development
- **Error messages**: Copy exact text from console
- **Steps to reproduce**: What you did before the error
- **Configuration**: Backend URL (without sensitive data)

### **Resources**

- **Main README**: `README.md`
- **Backend Setup**: `backend/DEPLOYMENT_GUIDE.md`
- **API Integration**: `INTEGRATION_GUIDE.md`
- **Quick Start**: `QUICK_START.md`

---

**💡 Most issues are configuration-related and can be solved by following the deployment guides carefully!**
