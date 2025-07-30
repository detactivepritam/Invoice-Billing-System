/**
 * API Configuration Manager
 * Allows users to configure their Django backend endpoint
 */

class APIConfigManager {
  constructor() {
    this.storageKey = 'invoiceApiConfig';
    this.loadConfig();
  }

  // Load configuration from localStorage
  loadConfig() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        this.applyConfig(config);
      } catch (error) {
        console.warn('Failed to load API config:', error);
      }
    }
  }

  // Save configuration to localStorage
  saveConfig(config) {
    localStorage.setItem(this.storageKey, JSON.stringify(config));
    this.applyConfig(config);
  }

  // Apply configuration to API service
  applyConfig(config) {
    if (window.apiService && config.apiUrl) {
      window.apiService.baseURL = config.apiUrl.replace(/\/$/, '') + '/api';

      console.log('🔧 API configuration updated:', config.apiUrl);

      // Trigger a connection recheck after configuration
      if (typeof window.recheckConnection === 'function') {
        setTimeout(() => {
          window.recheckConnection();
        }, 2000); // Give the page reload time to complete
      }
    }
  }

  // Show configuration modal
  showConfigModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('apiConfigModal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'apiConfigModal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    const currentConfig = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    
    modal.innerHTML = `
      <div style="background: white; border-radius: var(--radius-xl); padding: var(--space-8); max-width: 500px; width: 90%; box-shadow: var(--shadow-xl);">
        <h2 style="margin: 0 0 var(--space-6) 0; color: var(--neutral-900); font-size: var(--font-size-xl);">
          🔧 API Configuration
        </h2>
        
        <div style="margin-bottom: var(--space-6);">
          <label style="display: block; margin-bottom: var(--space-2); font-weight: var(--font-weight-semibold); color: var(--neutral-700);">
            Django Backend URL
          </label>
          <input type="url" id="apiUrlInput" placeholder="https://your-backend.com" 
                 value="${currentConfig.apiUrl || 'http://127.0.0.1:8000'}"
                 style="width: 100%; padding: var(--space-3) var(--space-4); border: 2px solid var(--neutral-200); border-radius: var(--radius-base); font-size: var(--font-size-base);">
          <small style="color: var(--neutral-500); font-size: var(--font-size-sm);">
            Enter your Django REST API base URL (without /api/)
          </small>
        </div>

        <div style="margin-bottom: var(--space-6);">
          <label style="display: block; margin-bottom: var(--space-2); font-weight: var(--font-weight-semibold); color: var(--neutral-700);">
            Authentication Token (Optional)
          </label>
          <input type="password" id="authTokenInput" placeholder="Bearer token or API key" 
                 value="${currentConfig.authToken || ''}"
                 style="width: 100%; padding: var(--space-3) var(--space-4); border: 2px solid var(--neutral-200); border-radius: var(--radius-base); font-size: var(--font-size-base);">
          <small style="color: var(--neutral-500); font-size: var(--font-size-sm);">
            Leave empty if your API doesn't require authentication
          </small>
        </div>

        <div style="background: var(--primary-50); border: 2px solid var(--primary-200); border-radius: var(--radius-base); padding: var(--space-4); margin-bottom: var(--space-6);">
          <h4 style="margin: 0 0 var(--space-2) 0; color: var(--primary-800);">🚀 Quick Setup Guide</h4>
          <p style="margin: 0 0 var(--space-2) 0; color: var(--primary-700); font-size: var(--font-size-sm);">
            <strong>Option 1:</strong> Use locally without backend (Skip for Now)<br>
            <strong>Option 2:</strong> Deploy backend first, then configure
          </p>
          <ol style="margin: 0; padding-left: var(--space-5); color: var(--primary-600); font-size: var(--font-size-sm);">
            <li><strong>Deploy Django backend</strong> using Railway/Render</li>
            <li><strong>Get your backend URL</strong> (e.g., https://yourapp.railway.app)</li>
            <li><strong>Validate URL</strong> using the button below</li>
            <li><strong>Save configuration</strong> to connect your app</li>
          </ol>
          <p style="margin: var(--space-2) 0 0 0; color: var(--primary-600); font-size: var(--font-size-sm);">
            📋 See <strong>backend/DEPLOYMENT_GUIDE.md</strong> for deployment instructions.
          </p>
        </div>

        <div style="display: flex; gap: var(--space-3); justify-content: space-between; align-items: center;">
          <button onclick="skipConfiguration()"
                  style="padding: var(--space-3) var(--space-4); border: 2px solid var(--warning-300); background: var(--warning-50); color: var(--warning-700); border-radius: var(--radius-base); cursor: pointer; font-weight: var(--font-weight-medium); font-size: var(--font-size-sm);">
            Skip for Now
          </button>

          <div style="display: flex; gap: var(--space-3);">
            <button onclick="closeConfigModal()"
                    style="padding: var(--space-3) var(--space-6); border: 2px solid var(--neutral-300); background: white; border-radius: var(--radius-base); cursor: pointer; font-weight: var(--font-weight-medium);">
              Cancel
            </button>
            <button onclick="testConnection()"
                    style="padding: var(--space-3) var(--space-6); border: 2px solid var(--primary-500); background: var(--primary-50); color: var(--primary-700); border-radius: var(--radius-base); cursor: pointer; font-weight: var(--font-weight-medium);">
              Validate URL
            </button>
            <button onclick="saveApiConfig()"
                    style="padding: var(--space-3) var(--space-6); border: 2px solid var(--primary-500); background: var(--primary-500); color: white; border-radius: var(--radius-base); cursor: pointer; font-weight: var(--font-weight-medium);">
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Focus on URL input
    document.getElementById('apiUrlInput').focus();
  }
}

// Global functions for modal interaction
window.closeConfigModal = function() {
  const modal = document.getElementById('apiConfigModal');
  if (modal) {
    modal.remove();
  }
};

window.testConnection = async function() {
  const apiUrl = document.getElementById('apiUrlInput').value.trim();
  const authToken = document.getElementById('authTokenInput').value.trim();

  if (!apiUrl) {
    alert('Please enter an API URL');
    return;
  }

  // Validate URL format
  let validUrl;
  try {
    validUrl = new URL(apiUrl);

    // Check if it's a reasonable URL
    if (!validUrl.protocol.startsWith('http')) {
      throw new Error('URL must use HTTP or HTTPS protocol');
    }
  } catch (e) {
    alert('❌ Please enter a valid URL\n\nExample: https://your-backend.railway.app\nExample: https://your-app.onrender.com');
    return;
  }

  // Show validation state
  const testBtn = event.target;
  const originalText = testBtn.textContent;
  testBtn.textContent = 'Validating...';
  testBtn.disabled = true;

  // Simulate validation delay
  setTimeout(() => {
    // Validate URL characteristics
    let validationMessage = '🔍 URL Validation Results:\n\n';

    // Check URL structure
    validationMessage += `✅ URL Format: Valid\n`;
    validationMessage += `✅ Protocol: ${validUrl.protocol}\n`;
    validationMessage += `✅ Domain: ${validUrl.hostname}\n`;

    // Check for common deployment patterns
    const isRailway = validUrl.hostname.includes('railway.app');
    const isRender = validUrl.hostname.includes('onrender.com');
    const isHeroku = validUrl.hostname.includes('herokuapp.com');
    const isNetlify = validUrl.hostname.includes('netlify.app');
    const isVercel = validUrl.hostname.includes('vercel.app');

    if (isRailway) {
      validationMessage += `✅ Platform: Railway (Good choice!)\n`;
    } else if (isRender) {
      validationMessage += `✅ Platform: Render (Good choice!)\n`;
    } else if (isHeroku) {
      validationMessage += `✅ Platform: Heroku (Legacy platform)\n`;
    } else if (isNetlify || isVercel) {
      validationMessage += `⚠️ Platform: Frontend hosting (This should be your backend URL)\n`;
    } else if (validUrl.hostname === 'localhost' || validUrl.hostname === '127.0.0.1') {
      validationMessage += `⚠️ Platform: Local development\n`;
    } else {
      validationMessage += `✅ Platform: Custom domain\n`;
    }

    // Check path structure
    if (apiUrl.includes('/api')) {
      validationMessage += `✅ API Path: Includes /api\n`;
    } else {
      validationMessage += `ℹ️ API Path: Will append /api automatically\n`;
    }

    validationMessage += '\n📋 Next Steps:\n';

    if (isNetlify || isVercel) {
      validationMessage += '❌ This appears to be a frontend URL.\n';
      validationMessage += 'You need to deploy your Django backend first.\n\n';
      validationMessage += '1. Deploy the backend/ folder to Railway or Render\n';
      validationMessage += '2. Get the backend URL (ends with .railway.app or .onrender.com)\n';
      validationMessage += '3. Come back and enter that URL here\n';
    } else if (validUrl.hostname === 'localhost') {
      validationMessage += '⚠️ This is a local URL.\n';
      validationMessage += 'Make sure your Django server is running locally.\n\n';
      validationMessage += '1. cd backend/\n';
      validationMessage += '2. python manage.py runserver\n';
      validationMessage += '3. Ensure CORS is configured for this domain\n';
    } else {
      validationMessage += '✅ URL looks good for a backend API!\n\n';
      validationMessage += 'If you just deployed:\n';
      validationMessage += '• Wait 1-2 minutes for deployment to complete\n';
      validationMessage += '• Ensure your Django server includes /api/health/ endpoint\n';
      validationMessage += '• Verify CORS allows this frontend domain\n\n';
      validationMessage += 'You can save this configuration and test it in the app.';
    }

    // Add auth token validation
    if (authToken) {
      validationMessage += '\n\n🔐 Authentication:\n';
      if (authToken.startsWith('Bearer ')) {
        validationMessage += '✅ Auth token format looks correct\n';
      } else {
        validationMessage += 'ℹ️ Auth token will be formatted as "Bearer [token]"\n';
      }
    } else {
      validationMessage += '\n\nℹ️ No authentication token provided (optional)\n';
    }

    alert(validationMessage);

    testBtn.textContent = originalText;
    testBtn.disabled = false;
  }, 1000);
};

window.saveApiConfig = function() {
  const apiUrl = document.getElementById('apiUrlInput').value.trim();
  const authToken = document.getElementById('authTokenInput').value.trim();

  if (!apiUrl) {
    alert('Please enter an API URL');
    return;
  }

  // Validate URL format
  try {
    new URL(apiUrl);
  } catch (e) {
    alert('❌ Please enter a valid URL (e.g., https://your-backend.com)');
    return;
  }

  const config = {
    apiUrl: apiUrl,
    authToken: authToken,
    savedAt: new Date().toISOString()
  };

  try {
    // Save configuration
    window.apiConfigManager.saveConfig(config);

    // Set auth token if provided
    if (authToken && window.apiService) {
      window.apiService.setAuthToken(authToken);
    }

    alert('✅ Configuration saved! The page will reload to apply changes.');

    // Close modal and reload
    closeConfigModal();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (error) {
    alert('❌ Failed to save configuration: ' + error.message);
  }
};

// Initialize the config manager
window.apiConfigManager = new APIConfigManager();

// Skip configuration for users without backend
window.skipConfiguration = function() {
  const confirmed = confirm(
    '⚠️ Skip API Configuration?\n\n' +
    'You can use the invoice system locally without a backend, but:\n' +
    '• Customer data won\'t be saved permanently\n' +
    '• Invoices won\'t be stored in a database\n' +
    '• No data sharing between devices\n\n' +
    'You can always configure the backend later.\n\n' +
    'Continue without backend?'
  );

  if (confirmed) {
    // Store a flag indicating user chose to skip
    localStorage.setItem('invoiceApiConfig', JSON.stringify({
      skipped: true,
      skippedAt: new Date().toISOString()
    }));

    closeConfigModal();
    alert('✅ Continuing without backend.\n\nYou can access API settings anytime via the ⚙️ button.');
  }
};

// Add a button to access API config (call this from your pages)
window.addApiConfigButton = function() {
  const button = document.createElement('button');
  button.innerHTML = '⚙️ API Settings';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: var(--space-3) var(--space-4);
    background: var(--neutral-700);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    transition: all var(--transition-base);
  `;
  
  button.addEventListener('click', () => {
    window.apiConfigManager.showConfigModal();
  });

  button.addEventListener('mouseenter', () => {
    button.style.background = 'var(--neutral-600)';
    button.style.transform = 'scale(1.05)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.background = 'var(--neutral-700)';
    button.style.transform = 'scale(1)';
  });

  document.body.appendChild(button);
};
