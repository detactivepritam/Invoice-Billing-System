/**
 * API Service Layer for Django REST API Integration
 * Handles all communication with ug-backend.com
 */

class APIService {
  /**
   * Get stored API configuration
   */
  getStoredConfig() {
    try {
      const stored = localStorage.getItem('invoiceApiConfig');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  constructor() {
    // Load configured URL or use placeholder
    const config = this.getStoredConfig();
    this.baseURL = (config && config.apiUrl) ?
      config.apiUrl.replace(/\/$/, '') + '/api' :
      'https://ug-backend.com/api'; // Placeholder URL

    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    this.isAvailable = false;

    // Set auth token if configured
    if (config && config.authToken) {
      this.setAuthToken(config.authToken);
    }

    console.log('🔧 API Service initialized with URL:', this.baseURL);
  }

  /**
   * Check if API is available
   */
  async checkAPIAvailability() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${this.baseURL}/health/`, {
        method: 'GET',
        signal: controller.signal,
        headers: this.defaultHeaders
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log('✅ API backend is available');
        this.isAvailable = true;
        return true;
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('⚠️ API backend unavailable: Request timeout');
      } else {
        console.warn('⚠️ API backend unavailable:', error.message);
      }
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Generic HTTP request method
   */
  async request(endpoint, options = {}) {
    // Check if user has configured to skip API (no backend)
    const config = this.getStoredConfig();
    if (config && config.skipped) {
      console.log('📴 API request skipped - user chose to use app without backend');
      return {
        success: false,
        error: 'No backend configured',
        skipped: true
      };
    }

    // Check if we're using the default placeholder URL
    if (this.baseURL.includes('ug-backend.com')) {
      console.log('📡 No backend configured yet - using placeholder URL');
      return {
        success: false,
        error: 'No backend configured',
        noBackend: true
      };
    }

    // Pre-flight check: validate URL before attempting fetch
    try {
      const testUrl = new URL(this.baseURL);
      if (!testUrl.protocol.startsWith('http')) {
        return {
          success: false,
          error: 'Invalid backend URL protocol',
          noBackend: true
        };
      }
    } catch (e) {
      console.log('📡 Invalid backend URL format:', this.baseURL);
      return {
        success: false,
        error: 'Invalid backend URL format',
        noBackend: true
      };
    }

    const url = `${this.baseURL}${endpoint}`;
    const requestConfig = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options
    };

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      // Silently handle expected errors when no backend is configured
      if (error.message.includes('Failed to fetch') || error.name === 'AbortError') {
        console.log('📡 Backend not available for:', endpoint);
        return {
          success: false,
          error: 'Backend not available',
          noBackend: true
        };
      }

      console.error('API request failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Invoice Management
   */
  async getInvoices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/invoices/?${queryString}` : '/invoices/';
    return this.request(endpoint);
  }

  async getInvoice(id) {
    return this.request(`/invoices/${id}/`);
  }

  async createInvoice(invoiceData) {
    return this.request('/invoices/', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }

  async updateInvoice(id, invoiceData) {
    return this.request(`/invoices/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData)
    });
  }

  async deleteInvoice(id) {
    return this.request(`/invoices/${id}/`, {
      method: 'DELETE'
    });
  }

  /**
   * Customer Management
   */
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/customers/?${queryString}` : '/customers/';
    return this.request(endpoint);
  }

  async getCustomer(id) {
    return this.request(`/customers/${id}/`);
  }

  async createCustomer(customerData) {
    return this.request('/customers/', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  }

  /**
   * Product Management
   */
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products/?${queryString}` : '/products/';
    return this.request(endpoint);
  }

  async getProduct(id) {
    return this.request(`/products/${id}/`);
  }

  /**
   * Authentication (if needed)
   */
  setAuthToken(token) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }
}

// Create global instance
window.apiService = new APIService();

/**
 * Utility functions for data formatting
 */
const APIUtils = {
  /**
   * Format invoice data for display
   */
  formatInvoiceForDisplay(invoice) {
    return {
      id: invoice.id,
      number: invoice.invoice_number || `INV-${invoice.id}`,
      customerName: invoice.customer?.name || invoice.customer_name || 'Unknown Customer',
      totalAmount: parseFloat(invoice.total_amount || 0).toFixed(2),
      date: this.formatDate(invoice.date || invoice.created_at),
      status: invoice.status || 'draft',
      items: invoice.items || []
    };
  },

  /**
   * Format customer data for dropdown
   */
  formatCustomerForDropdown(customer) {
    return {
      value: customer.id,
      label: `${customer.name} (${customer.email || customer.phone || ''})`,
      data: customer
    };
  },

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Format currency for display
   */
  formatCurrency(amount) {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  },

  /**
   * Prepare invoice data for API submission
   */
  prepareInvoiceForSubmission(formData, items) {
    return {
      customer_name: formData.clientName,
      customer_id: formData.customerId || null,
      date: formData.invoiceDate,
      items: items.map(item => ({
        description: item.item,
        quantity: parseInt(item.qty),
        unit_price: parseFloat(item.price),
        total_price: parseFloat(item.qty) * parseFloat(item.price)
      })),
      subtotal: items.reduce((sum, item) => sum + (parseFloat(item.qty) * parseFloat(item.price)), 0),
      tax_rate: 0.18,
      tax_amount: items.reduce((sum, item) => sum + (parseFloat(item.qty) * parseFloat(item.price)), 0) * 0.18,
      total_amount: items.reduce((sum, item) => sum + (parseFloat(item.qty) * parseFloat(item.price)), 0) * 1.18,
      status: 'draft'
    };
  }
};

window.APIUtils = APIUtils;
