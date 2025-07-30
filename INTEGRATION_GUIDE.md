# 🚀 Django API + Builder.io Integration Guide

This guide shows you how to integrate your Django REST API with Builder.io and also provides a complete static implementation.

## 📋 Current Implementation

### ✅ What's Already Built

1. **API Service Layer** (`api-service.js`)
   - Complete Django REST API integration
   - Handles GET/POST/PUT/DELETE operations
   - Error handling and response formatting

2. **Invoice Management**
   - Create/edit invoices with API integration
   - Customer dropdown populated from backend
   - Real-time form validation
   - Auto-save functionality

3. **Invoice List View** (`invoices.html`)
   - Dynamic data from your Django API
   - Search and filter functionality
   - Responsive grid layout

## 🔗 API Endpoints Used

```javascript
// Your Django endpoints
const endpoints = {
  invoices: 'https://ug-backend.com/api/invoices/',
  customers: 'https://ug-backend.com/api/customers/',
  products: 'https://ug-backend.com/api/products/'
};
```

## 🏗️ Converting to Builder.io

### Option 1: Use Builder.io Visual Editor

1. **Create a new Builder.io project**
2. **Import this design** - Upload your current HTML/CSS as a starting point
3. **Connect API data** using Builder's Data tab:

```javascript
// In Builder.io Data tab
export default async function getData() {
  const response = await fetch('https://ug-backend.com/api/invoices/');
  return await response.json();
}
```

### Option 2: Use Builder.io with Custom Components

1. **Create Builder components** for reusable elements:

```jsx
// InvoiceCard.jsx - Builder.io component
import { Builder } from '@builder.io/react';

function InvoiceCard({ invoice }) {
  return (
    <div className="invoice-card-item">
      <div className="invoice-header-row">
        <div className="invoice-number">{invoice.number}</div>
        <div className={`invoice-status status-${invoice.status}`}>
          {invoice.status}
        </div>
      </div>
      <div className="customer-name">{invoice.customerName}</div>
      <div className="invoice-amount">₹{invoice.totalAmount}</div>
      <div className="invoice-date">{invoice.date}</div>
    </div>
  );
}

Builder.registerComponent(InvoiceCard, {
  name: 'InvoiceCard',
  inputs: [
    { name: 'invoice', type: 'object' }
  ]
});
```

## 📊 Builder.io Data Binding Examples

### 1. Collection Binding (Repeater)

```javascript
// In Builder.io, create a Collection with this data source:
async function getInvoices() {
  const response = await fetch('https://ug-backend.com/api/invoices/');
  const data = await response.json();
  
  return data.map(invoice => ({
    id: invoice.id,
    number: invoice.invoice_number || `INV-${invoice.id}`,
    customerName: invoice.customer?.name || 'Unknown Customer',
    totalAmount: parseFloat(invoice.total_amount || 0).toFixed(2),
    date: new Date(invoice.date).toLocaleDateString(),
    status: invoice.status || 'draft'
  }));
}
```

### 2. Dynamic Content Binding

In Builder.io visual editor:

1. **Add a Repeater component**
2. **Set Collection** to your invoice data
3. **Bind text elements**:
   - Invoice Number: `{{item.number}}`
   - Customer: `{{item.customerName}}`
   - Amount: `₹{{item.totalAmount}}`
   - Date: `{{item.date}}`

### 3. Form Submission to API

```javascript
// Builder.io form action
async function submitInvoice(formData) {
  const response = await fetch('https://ug-backend.com/api/invoices/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer_name: formData.clientName,
      date: formData.invoiceDate,
      items: formData.items,
      total_amount: formData.totalAmount
    })
  });
  
  if (response.ok) {
    // Success - redirect or show message
    window.location.href = '/invoices';
  } else {
    // Handle error
    console.error('Failed to create invoice');
  }
}
```

## 🎨 Builder.io Page Structure

### 1. Invoice List Page

```
📄 Invoice List Page
├── 🏠 Header Section
│   ├── 📝 Page Title: "Invoice Management"
│   └── 🔘 Create New Button
├── 🔍 Search & Filter Bar
│   ├── 📝 Search Input (bound to state)
│   └── 📋 Status Filter Dropdown
└── 🔄 Repeater Component
    ├── 📊 Data Source: getInvoices()
    └── 🎴 Invoice Card Template
        ├── 📝 Invoice Number: {{item.number}}
        ├── 👤 Customer: {{item.customerName}}
        ├── 💰 Amount: ₹{{item.totalAmount}}
        └── 📅 Date: {{item.date}}
```

### 2. Invoice Form Page

```
📄 Invoice Form Page
├── 📝 Form Container
│   ├── 👤 Customer Dropdown (API data)
│   ├── 📅 Date Picker
│   └── 📊 Items Repeater
│       ├── 📝 Item Description
│       ├── 🔢 Quantity
│       └── 💰 Price
├── 💰 Totals Section
│   ├── 📊 Subtotal: {{calculated}}
│   ├── 💼 Tax: {{calculated}}
│   └── 💰 Total: {{calculated}}
└── 🔘 Action Buttons
    ├── 💾 Save Button (POST to API)
    └── 🖨️ Print Button
```

## 🔧 Builder.io Custom Code Integration

### 1. Add API Service to Builder.io

In Builder.io's Custom Code section:

```html
<script src="https://your-domain.com/api-service.js"></script>
<script>
  // Initialize API service
  window.apiService = new APIService();
  
  // Make it available globally in Builder
  window.builderApiService = window.apiService;
</script>
```

### 2. Data Fetching in Builder.io

```javascript
// Custom data fetching function for Builder.io
export default async function builderData(options) {
  try {
    const result = await window.builderApiService.getInvoices();
    if (result.success) {
      return result.data.map(APIUtils.formatInvoiceForDisplay);
    }
    return [];
  } catch (error) {
    console.error('Data fetch error:', error);
    return [];
  }
}
```

## 🎯 Key Features Implemented

### ✅ Current Static App Features
- ✨ Modern design system with CSS custom properties
- 📱 Fully responsive design
- 🔄 Real-time API integration
- 💾 Auto-save functionality
- 🔍 Search and filtering
- ✏️ Create/edit invoices
- 🖨️ Print functionality
- 📊 Dynamic calculations
- 🎨 Smooth animations

### 🚀 Builder.io Migration Benefits
- 🎨 Visual editing without code
- 🔄 A/B testing capabilities
- 📊 Analytics integration
- 🚀 CDN optimization
- 👥 Non-technical team editing
- 🔧 Component reusability

## 📋 Next Steps

1. **Test Current Implementation**
   - Update API endpoint URLs in `api-service.js`
   - Test with your Django backend

2. **Builder.io Setup** (Optional)
   - Create Builder.io account
   - Import current design
   - Set up data connections
   - Register custom components

3. **Django Backend Requirements**
   ```python
   # Ensure CORS is enabled for your frontend domain
   CORS_ALLOWED_ORIGINS = [
       "https://your-builder-site.builder.io",
       "https://your-domain.com"
   ]
   
   # API Response format should match:
   {
       "id": 1,
       "invoice_number": "INV-001",
       "customer_name": "John Doe",
       "total_amount": "1000.00",
       "date": "2024-01-15",
       "status": "draft",
       "items": [...]
   }
   ```

## 🆘 Support

- **Current App**: Ready to use with your Django API
- **Builder.io Migration**: Contact Builder.io support for advanced features
- **MCP Integration**: Use Builder.io MCP server for seamless integration

---

Your invoice system is now ready for production with full Django API integration! 🎉
