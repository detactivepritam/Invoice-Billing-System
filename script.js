<<<<<<< HEAD
// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('invoiceDate').value = today;

  // Load customers for dropdown
  loadCustomers();

  // Check if editing existing invoice
  checkForEditMode();

  // Add initial row
  addItemRow();

  // Add keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
});

// Load customers from API
async function loadCustomers() {
  console.log('🔄 Loading customers and checking backend connection...');
  try {
    const result = await apiService.getCustomers();
    if (result.success) {
      console.log('✅ Backend connected - loaded', result.data.length, 'customers');
      populateCustomerDropdown(result.data);
      showConnectionStatus('connected');
    } else if (result.skipped) {
      // User chose to skip backend configuration - load local customers
      const localCustomers = JSON.parse(localStorage.getItem('localCustomers') || '[]');
      console.log('📱 Running in local mode - loaded', localCustomers.length, 'local customers');
      populateCustomerDropdown(localCustomers);
    } else if (result.noBackend) {
      // Backend not available - load any local customers
      const localCustomers = JSON.parse(localStorage.getItem('localCustomers') || '[]');
      console.log('🔴 Backend unavailable - loaded', localCustomers.length, 'local customers');
      populateCustomerDropdown(localCustomers);
      showConnectionStatus('disconnected');
    } else {
      console.warn('Failed to load customers:', result.error);
      showConnectionStatus('disconnected');
      populateCustomerDropdown([]);
    }
  } catch (error) {
    console.error('Error loading customers:', error);
    showConnectionStatus('disconnected');
    // Still try to load local customers
    const localCustomers = JSON.parse(localStorage.getItem('localCustomers') || '[]');
    populateCustomerDropdown(localCustomers);
  }
}

// Manual function to recheck backend connection
async function recheckConnection() {
  console.log('🔍 Manually rechecking backend connection...');

  // Remove existing status
  const existingStatus = document.getElementById('connectionStatus');
  if (existingStatus) {
    existingStatus.remove();
  }

  // Show checking status
  showConnectionStatus('checking');

  // Wait a moment then recheck
  setTimeout(async () => {
    await loadCustomers();
  }, 1000);
}

// Add recheck button (called after API config changes)
function addRecheckButton() {
  const existingBtn = document.getElementById('recheckBtn');
  if (existingBtn) return; // Already exists

  const button = document.createElement('button');
  button.id = 'recheckBtn';
  button.innerHTML = '🔄 Recheck Connection';
  button.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    padding: var(--space-2) var(--space-3);
    background: var(--primary-500);
    color: white;
    border: none;
    border-radius: var(--radius-base);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    box-shadow: var(--shadow-md);
    z-index: 1000;
    transition: all var(--transition-base);
  `;

  button.addEventListener('click', recheckConnection);

  button.addEventListener('mouseenter', () => {
    button.style.background = 'var(--primary-600)';
    button.style.transform = 'scale(1.05)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.background = 'var(--primary-500)';
    button.style.transform = 'scale(1)';
  });

  document.body.appendChild(button);

  // Auto-remove after 30 seconds
  setTimeout(() => {
    if (button && button.parentNode) {
      button.remove();
    }
  }, 30000);
}

// Populate customer dropdown
function populateCustomerDropdown(customers) {
  const select = document.getElementById('customerSelect');

  // Clear existing options except the first one and create new option
  select.innerHTML = `
    <option value="">Select existing customer...</option>
    <option value="__create_new__">+ Create New Customer</option>
  `;

  // Add customers before the create new option
  const createNewOption = select.querySelector('option[value="__create_new__"]');

  if (customers && customers.length > 0) {
    customers.forEach(customer => {
      const option = document.createElement('option');
      const formatted = APIUtils.formatCustomerForDropdown(customer);
      option.value = formatted.value;
      option.textContent = formatted.label;
      option.dataset.customerData = JSON.stringify(formatted.data);
      select.insertBefore(option, createNewOption);
    });
  } else {
    // If no customers, add a disabled option indicating this
    const noCustomersOption = document.createElement('option');
    noCustomersOption.value = '';
    noCustomersOption.textContent = 'No customers found - create one below';
    noCustomersOption.disabled = true;
    select.insertBefore(noCustomersOption, createNewOption);
  }
}

// Handle customer selection
function onCustomerChange() {
  const select = document.getElementById('customerSelect');
  const clientNameInput = document.getElementById('clientName');

  if (select.value === '__create_new__') {
    // Show create customer modal
    showCreateCustomerModal();
    // Reset selection
    select.value = '';
  } else if (select.value) {
    const customerData = JSON.parse(select.options[select.selectedIndex].dataset.customerData);
    clientNameInput.value = customerData.name;
    clientNameInput.dataset.customerId = customerData.id;
  } else {
    clientNameInput.value = '';
    delete clientNameInput.dataset.customerId;
  }
}

// Check for edit mode (editing existing invoice)
async function checkForEditMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');

  if (editId) {
    await loadInvoiceForEdit(editId);
  }
}

// Load existing invoice for editing
async function loadInvoiceForEdit(invoiceId) {
  try {
    showLoadingState();
    const result = await apiService.getInvoice(invoiceId);

    if (result.success) {
      populateFormWithInvoice(result.data);
      hideLoadingState();
    } else {
      hideLoadingState();
      alert('Failed to load invoice: ' + result.error);
    }
  } catch (error) {
    hideLoadingState();
    console.error('Error loading invoice:', error);
    alert('Failed to load invoice data');
  }
}

// Populate form with existing invoice data
function populateFormWithInvoice(invoice) {
  const formatted = APIUtils.formatInvoiceForDisplay(invoice);

  // Set basic info
  document.getElementById('clientName').value = formatted.customerName;
  document.getElementById('invoiceDate').value = invoice.date || '';

  if (invoice.customer_id) {
    document.getElementById('clientName').dataset.customerId = invoice.customer_id;
    // Try to select the customer in dropdown
    const customerSelect = document.getElementById('customerSelect');
    for (let option of customerSelect.options) {
      if (option.value == invoice.customer_id) {
        option.selected = true;
        break;
      }
    }
  }

  // Clear existing rows
  document.getElementById('tableBody').innerHTML = '';

  // Add invoice items
  if (formatted.items && formatted.items.length > 0) {
    formatted.items.forEach(item => {
      addItemRow();
      const lastRow = document.querySelector('#tableBody tr:last-child');
      lastRow.querySelector('.item').value = item.description || item.item || '';
      lastRow.querySelector('.qty').value = item.quantity || item.qty || 1;
      lastRow.querySelector('.price').value = item.unit_price || item.price || 0;
    });
  } else {
    addItemRow();
  }

  updateTotals();

  // Update page title and save button
  document.title = `Edit Invoice ${formatted.number} - Professional Invoice System`;
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.innerHTML = saveBtn.innerHTML.replace('Save Invoice', 'Update Invoice');
  saveBtn.dataset.invoiceId = invoice.id;
}

// Enhanced add item row with animation
=======
// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('invoiceDate').value = today;

  // Load customers for dropdown
  loadCustomers();

  // Check if editing existing invoice
  checkForEditMode();

  // Add initial row
  addItemRow();

  // Add keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
});

// Load customers from API
async function loadCustomers() {
  console.log('🔄 Loading customers and checking backend connection...');
  try {
    const result = await apiService.getCustomers();
    if (result.success) {
      console.log('✅ Backend connected - loaded', result.data.length, 'customers');
      populateCustomerDropdown(result.data);
      showConnectionStatus('connected');
    } else if (result.skipped) {
      // User chose to skip backend configuration - load local customers
      const localCustomers = JSON.parse(localStorage.getItem('localCustomers') || '[]');
      console.log('📱 Running in local mode - loaded', localCustomers.length, 'local customers');
      populateCustomerDropdown(localCustomers);
    } else if (result.noBackend) {
      // Backend not available - load any local customers
      const localCustomers = JSON.parse(localStorage.getItem('localCustomers') || '[]');
      console.log('🔴 Backend unavailable - loaded', localCustomers.length, 'local customers');
      populateCustomerDropdown(localCustomers);
      showConnectionStatus('disconnected');
    } else {
      console.warn('Failed to load customers:', result.error);
      showConnectionStatus('disconnected');
      populateCustomerDropdown([]);
    }
  } catch (error) {
    console.error('Error loading customers:', error);
    showConnectionStatus('disconnected');
    // Still try to load local customers
    const localCustomers = JSON.parse(localStorage.getItem('localCustomers') || '[]');
    populateCustomerDropdown(localCustomers);
  }
}

// Manual function to recheck backend connection
async function recheckConnection() {
  console.log('🔍 Manually rechecking backend connection...');

  // Remove existing status
  const existingStatus = document.getElementById('connectionStatus');
  if (existingStatus) {
    existingStatus.remove();
  }

  // Show checking status
  showConnectionStatus('checking');

  // Wait a moment then recheck
  setTimeout(async () => {
    await loadCustomers();
  }, 1000);
}

// Add recheck button (called after API config changes)
function addRecheckButton() {
  const existingBtn = document.getElementById('recheckBtn');
  if (existingBtn) return; // Already exists

  const button = document.createElement('button');
  button.id = 'recheckBtn';
  button.innerHTML = '🔄 Recheck Connection';
  button.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    padding: var(--space-2) var(--space-3);
    background: var(--primary-500);
    color: white;
    border: none;
    border-radius: var(--radius-base);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    box-shadow: var(--shadow-md);
    z-index: 1000;
    transition: all var(--transition-base);
  `;

  button.addEventListener('click', recheckConnection);

  button.addEventListener('mouseenter', () => {
    button.style.background = 'var(--primary-600)';
    button.style.transform = 'scale(1.05)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.background = 'var(--primary-500)';
    button.style.transform = 'scale(1)';
  });

  document.body.appendChild(button);

  // Auto-remove after 30 seconds
  setTimeout(() => {
    if (button && button.parentNode) {
      button.remove();
    }
  }, 30000);
}

// Populate customer dropdown
function populateCustomerDropdown(customers) {
  const select = document.getElementById('customerSelect');

  // Clear existing options except the first one and create new option
  select.innerHTML = `
    <option value="">Select existing customer...</option>
    <option value="__create_new__">+ Create New Customer</option>
  `;

  // Add customers before the create new option
  const createNewOption = select.querySelector('option[value="__create_new__"]');

  if (customers && customers.length > 0) {
    customers.forEach(customer => {
      const option = document.createElement('option');
      const formatted = APIUtils.formatCustomerForDropdown(customer);
      option.value = formatted.value;
      option.textContent = formatted.label;
      option.dataset.customerData = JSON.stringify(formatted.data);
      select.insertBefore(option, createNewOption);
    });
  } else {
    // If no customers, add a disabled option indicating this
    const noCustomersOption = document.createElement('option');
    noCustomersOption.value = '';
    noCustomersOption.textContent = 'No customers found - create one below';
    noCustomersOption.disabled = true;
    select.insertBefore(noCustomersOption, createNewOption);
  }
}

// Handle customer selection
function onCustomerChange() {
  const select = document.getElementById('customerSelect');
  const clientNameInput = document.getElementById('clientName');

  if (select.value === '__create_new__') {
    // Show create customer modal
    showCreateCustomerModal();
    // Reset selection
    select.value = '';
  } else if (select.value) {
    const customerData = JSON.parse(select.options[select.selectedIndex].dataset.customerData);
    clientNameInput.value = customerData.name;
    clientNameInput.dataset.customerId = customerData.id;
  } else {
    clientNameInput.value = '';
    delete clientNameInput.dataset.customerId;
  }
}

// Check for edit mode (editing existing invoice)
async function checkForEditMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');

  if (editId) {
    await loadInvoiceForEdit(editId);
  }
}

// Load existing invoice for editing
async function loadInvoiceForEdit(invoiceId) {
  try {
    showLoadingState();
    const result = await apiService.getInvoice(invoiceId);

    if (result.success) {
      populateFormWithInvoice(result.data);
      hideLoadingState();
    } else {
      hideLoadingState();
      alert('Failed to load invoice: ' + result.error);
    }
  } catch (error) {
    hideLoadingState();
    console.error('Error loading invoice:', error);
    alert('Failed to load invoice data');
  }
}

// Populate form with existing invoice data
function populateFormWithInvoice(invoice) {
  const formatted = APIUtils.formatInvoiceForDisplay(invoice);

  // Set basic info
  document.getElementById('clientName').value = formatted.customerName;
  document.getElementById('invoiceDate').value = invoice.date || '';

  if (invoice.customer_id) {
    document.getElementById('clientName').dataset.customerId = invoice.customer_id;
    // Try to select the customer in dropdown
    const customerSelect = document.getElementById('customerSelect');
    for (let option of customerSelect.options) {
      if (option.value == invoice.customer_id) {
        option.selected = true;
        break;
      }
    }
  }

  // Clear existing rows
  document.getElementById('tableBody').innerHTML = '';

  // Add invoice items
  if (formatted.items && formatted.items.length > 0) {
    formatted.items.forEach(item => {
      addItemRow();
      const lastRow = document.querySelector('#tableBody tr:last-child');
      lastRow.querySelector('.item').value = item.description || item.item || '';
      lastRow.querySelector('.qty').value = item.quantity || item.qty || 1;
      lastRow.querySelector('.price').value = item.unit_price || item.price || 0;
    });
  } else {
    addItemRow();
  }

  updateTotals();

  // Update page title and save button
  document.title = `Edit Invoice ${formatted.number} - Professional Invoice System`;
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.innerHTML = saveBtn.innerHTML.replace('Save Invoice', 'Update Invoice');
  saveBtn.dataset.invoiceId = invoice.id;
}

// Enhanced add item row with animation
>>>>>>> 4b709ec (Initial commit of Invoice Billing System code)
function addItemRow() {
  const table = document.getElementById("tableBody");
  const row = document.createElement("tr");

<<<<<<< HEAD
  row.innerHTML = `
    <td><input type="text" class="item" placeholder="Item Name"></td>
    <td><input type="number" class="qty" value="1" min="1" onchange="updateTotals()"></td>
    <td><input type="number" class="price" value="0" min="0" onchange="updateTotals()"></td>
    <td class="total">0.00</td>
    <td><button onclick="removeRow(this)">❌</button></td>
  `;

  table.appendChild(row);
  updateTotals();
}

// Remove item row
function removeRow(button) {
  const row = button.parentElement.parentElement;
  row.remove();
  updateTotals();
}

// Update totals whenever inputs change
=======
  // Create unique ID for this row
  const rowId = 'row-' + Date.now();
  row.id = rowId;

  row.innerHTML = `
    <td>
      <input type="text" class="table-input item" placeholder="Enter item description"
             oninput="validateInput(this)" required>
    </td>
    <td>
      <input type="number" class="table-input qty" value="1" min="1" step="1"
             onchange="updateTotals()" onkeyup="updateTotals()" required>
    </td>
    <td>
      <input type="number" class="table-input price" value="0.00" min="0" step="0.01"
             onchange="updateTotals()" onkeyup="updateTotals()" required>
    </td>
    <td class="total-cell total">0.00</td>
    <td>
      <button class="btn btn-danger" onclick="removeRow(this)" title="Remove this item">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3,6 5,6 21,6"></polyline>
          <path d="m19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </td>
  `;

  // Add with smooth animation
  row.style.opacity = '0';
  row.style.transform = 'translateY(-10px)';
  table.appendChild(row);

  // Trigger animation
  requestAnimationFrame(() => {
    row.style.transition = 'all 0.3s ease';
    row.style.opacity = '1';
    row.style.transform = 'translateY(0)';
  });

  // Focus on the item input
  setTimeout(() => {
    row.querySelector('.item').focus();
  }, 100);

  updateTotals();
}

// Enhanced remove row with confirmation
function removeRow(button) {
  const row = button.closest('tr');
  const itemName = row.querySelector('.item').value;

  // Show confirmation for rows with data
  if (itemName.trim() && !confirm(`Remove "${itemName}"?`)) {
    return;
  }

  // Animate removal
  row.style.transition = 'all 0.3s ease';
  row.style.opacity = '0';
  row.style.transform = 'translateX(-20px)';

  setTimeout(() => {
    row.remove();
    updateTotals();

    // Ensure at least one row exists
    const remainingRows = document.querySelectorAll('#tableBody tr');
    if (remainingRows.length === 0) {
      addItemRow();
    }
  }, 300);
}

// Enhanced totals calculation with formatting
>>>>>>> 4b709ec (Initial commit of Invoice Billing System code)
function updateTotals() {
  const rows = document.querySelectorAll("#tableBody tr");
  let subtotal = 0;

  rows.forEach(row => {
<<<<<<< HEAD
    const qty = row.querySelector(".qty").value;
    const price = row.querySelector(".price").value;
    const total = parseFloat(qty) * parseFloat(price);
    row.querySelector(".total").textContent = total.toFixed(2);
    subtotal += total;
=======
    const qtyInput = row.querySelector(".qty");
    const priceInput = row.querySelector(".price");
    const totalCell = row.querySelector(".total");

    const qty = parseFloat(qtyInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    const total = qty * price;

    // Format and display row total
    totalCell.textContent = formatCurrency(total);
    subtotal += total;

    // Add visual feedback for valid/invalid inputs
    validateInput(qtyInput);
    validateInput(priceInput);
>>>>>>> 4b709ec (Initial commit of Invoice Billing System code)
  });

  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

<<<<<<< HEAD
  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("tax").textContent = tax.toFixed(2);
  document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);
}

// Print the invoice
function printInvoice() {
  window.print();
=======
  // Update totals with animation
  updateElementWithAnimation('subtotal', formatCurrency(subtotal));
  updateElementWithAnimation('tax', formatCurrency(tax));
  updateElementWithAnimation('grandTotal', formatCurrency(grandTotal));
}

// Format currency with proper decimal places
function formatCurrency(amount) {
  return amount.toFixed(2);
}

// Update element with subtle animation
function updateElementWithAnimation(elementId, newValue) {
  const element = document.getElementById(elementId);
  if (element.textContent !== newValue) {
    element.style.transform = 'scale(1.05)';
    element.textContent = newValue;
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 150);
  }
}

// Input validation with visual feedback
function validateInput(input) {
  const isValid = input.checkValidity() && input.value.trim() !== '';

  if (isValid) {
    input.style.borderColor = 'var(--success-500)';
    input.style.backgroundColor = 'var(--success-50)';
  } else {
    input.style.borderColor = 'var(--neutral-200)';
    input.style.backgroundColor = 'var(--neutral-50)';
  }
}

// Enhanced print function with validation
function printInvoice() {
  const clientName = document.getElementById('clientName').value.trim();
  const invoiceDate = document.getElementById('invoiceDate').value;
  const rows = document.querySelectorAll('#tableBody tr');

  // Validation
  if (!clientName) {
    alert('Please enter a client name before printing.');
    document.getElementById('clientName').focus();
    return;
  }

  if (!invoiceDate) {
    alert('Please select an invoice date before printing.');
    document.getElementById('invoiceDate').focus();
    return;
  }

  // Check if there are valid items
  let hasValidItems = false;
  rows.forEach(row => {
    const item = row.querySelector('.item').value.trim();
    const qty = parseFloat(row.querySelector('.qty').value) || 0;
    const price = parseFloat(row.querySelector('.price').value) || 0;

    if (item && qty > 0 && price > 0) {
      hasValidItems = true;
    }
  });

  if (!hasValidItems) {
    alert('Please add at least one valid item before printing.');
    return;
  }

  // Change title for print
  const originalTitle = document.title;
  document.title = `Invoice - ${clientName} - ${invoiceDate}`;

  // Print
  window.print();

  // Restore title
  document.title = originalTitle;
}

// Keyboard shortcuts
function handleKeyboard(event) {
  // Ctrl/Cmd + Enter to add new row
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    addItemRow();
  }

  // Ctrl/Cmd + P to print
  if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
    event.preventDefault();
    printInvoice();
  }
}

// Auto-save to localStorage
function saveToLocalStorage() {
  const data = {
    clientName: document.getElementById('clientName').value,
    invoiceDate: document.getElementById('invoiceDate').value,
    items: []
  };

  document.querySelectorAll('#tableBody tr').forEach(row => {
    const item = row.querySelector('.item').value;
    const qty = row.querySelector('.qty').value;
    const price = row.querySelector('.price').value;

    if (item.trim()) {
      data.items.push({ item, qty, price });
    }
  });

  localStorage.setItem('invoiceData', JSON.stringify(data));
}

// Load from localStorage
function loadFromLocalStorage() {
  const saved = localStorage.getItem('invoiceData');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      document.getElementById('clientName').value = data.clientName || '';
      document.getElementById('invoiceDate').value = data.invoiceDate || '';

      // Clear existing rows
      document.getElementById('tableBody').innerHTML = '';

      // Add saved items
      if (data.items && data.items.length > 0) {
        data.items.forEach(itemData => {
          addItemRow();
          const lastRow = document.querySelector('#tableBody tr:last-child');
          lastRow.querySelector('.item').value = itemData.item;
          lastRow.querySelector('.qty').value = itemData.qty;
          lastRow.querySelector('.price').value = itemData.price;
        });
      } else {
        addItemRow();
      }

      updateTotals();
    } catch (e) {
      console.warn('Failed to load saved data:', e);
    }
  }
}

// Auto-save on input changes
document.addEventListener('input', () => {
  setTimeout(saveToLocalStorage, 500);
});

// Load saved data on page load
window.addEventListener('load', loadFromLocalStorage);

// Customer Creation Modal Functions
function showCreateCustomerModal() {
  const modal = document.getElementById('customerModal');
  modal.style.display = 'flex';

  // Clear form
  document.getElementById('customerForm').reset();

  // Focus on name input
  setTimeout(() => {
    document.getElementById('newCustomerName').focus();
  }, 100);

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeCustomerModal() {
  const modal = document.getElementById('customerModal');
  modal.style.display = 'none';

  // Restore body scroll
  document.body.style.overflow = '';

  // Reset customer select dropdown
  document.getElementById('customerSelect').value = '';
}

// Handle modal backdrop click
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('customerModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeCustomerModal();
      }
    });
  }
});

// Handle escape key to close modal
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('customerModal');
    if (modal && modal.style.display === 'flex') {
      closeCustomerModal();
    }
  }
});

// Create new customer
async function createCustomer() {
  const form = document.getElementById('customerForm');
  const createBtn = document.getElementById('createCustomerBtn');

  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Get form data
  const customerData = {
    name: document.getElementById('newCustomerName').value.trim(),
    email: document.getElementById('newCustomerEmail').value.trim(),
    phone: document.getElementById('newCustomerPhone').value.trim(),
    address: document.getElementById('newCustomerAddress').value.trim()
  };

  // Validate required fields
  if (!customerData.name || !customerData.email) {
    showErrorMessage('Name and email are required');
    return;
  }

  // Show loading state
  const originalText = createBtn.innerHTML;
  createBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
    Creating...
  `;
  createBtn.disabled = true;

  try {
    // Create customer via API
    const result = await apiService.createCustomer(customerData);

    if (result.success) {
      const newCustomer = result.data;

      // Add to customer dropdown
      addCustomerToDropdown(newCustomer);

      // Select the new customer
      selectCustomer(newCustomer);

      // Close modal
      closeCustomerModal();

      // Show success message
      showSuccessMessage(`Customer "${customerData.name}" created successfully!`);

    } else if (result.skipped || result.noBackend) {
      // No backend - create customer locally
      const localCustomer = {
        id: Date.now(),
        ...customerData,
        created_at: new Date().toISOString(),
        localOnly: true
      };

      // Store locally
      const localCustomers = JSON.parse(localStorage.getItem('localCustomers') || '[]');
      localCustomers.push(localCustomer);
      localStorage.setItem('localCustomers', JSON.stringify(localCustomers));

      // Add to dropdown
      addCustomerToDropdown(localCustomer);

      // Select the new customer
      selectCustomer(localCustomer);

      // Close modal
      closeCustomerModal();

      // Show success message
      showSuccessMessage(`Customer "${customerData.name}" created locally!\n\nNote: Configure backend API to save to database.`);

    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error('Error creating customer:', error);
    showErrorMessage('Failed to create customer: ' + error.message);
  } finally {
    // Restore button state
    createBtn.innerHTML = originalText;
    createBtn.disabled = false;
  }
}

// Add customer to dropdown
function addCustomerToDropdown(customer) {
  const select = document.getElementById('customerSelect');
  const formatted = APIUtils.formatCustomerForDropdown(customer);

  // Create new option
  const option = document.createElement('option');
  option.value = formatted.value;
  option.textContent = formatted.label;
  option.dataset.customerData = JSON.stringify(formatted.data);

  // Insert before "Create New Customer" option
  const createNewOption = select.querySelector('option[value="__create_new__"]');
  select.insertBefore(option, createNewOption);
}

// Select customer in dropdown and form
function selectCustomer(customer) {
  const select = document.getElementById('customerSelect');
  const clientNameInput = document.getElementById('clientName');

  // Select in dropdown
  select.value = customer.id;

  // Fill in client name
  clientNameInput.value = customer.name;
  clientNameInput.dataset.customerId = customer.id;
}

// Enhanced form validation for customer form
function validateCustomerForm() {
  const name = document.getElementById('newCustomerName').value.trim();
  const email = document.getElementById('newCustomerEmail').value.trim();

  if (!name) {
    showErrorMessage('Customer name is required');
    document.getElementById('newCustomerName').focus();
    return false;
  }

  if (!email) {
    showErrorMessage('Email address is required');
    document.getElementById('newCustomerEmail').focus();
    return false;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showErrorMessage('Please enter a valid email address');
    document.getElementById('newCustomerEmail').focus();
    return false;
  }

  return true;
}

// Handle Enter key in customer form
document.addEventListener('DOMContentLoaded', function() {
  const customerForm = document.getElementById('customerForm');
  if (customerForm) {
    customerForm.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        createCustomer();
      }
    });
  }
});

// Save invoice to backend API
async function saveInvoice() {
  const saveBtn = document.getElementById('saveBtn');
  const isEditing = saveBtn.dataset.invoiceId;

  // Validate form
  if (!validateInvoiceForm()) {
    return;
  }

  // Show loading state
  const originalText = saveBtn.innerHTML;
  saveBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
    Saving...
  `;
  saveBtn.disabled = true;

  try {
    // Collect form data
    const formData = {
      clientName: document.getElementById('clientName').value,
      customerId: document.getElementById('clientName').dataset.customerId || null,
      invoiceDate: document.getElementById('invoiceDate').value
    };

    // Collect items
    const items = [];
    document.querySelectorAll('#tableBody tr').forEach(row => {
      const item = row.querySelector('.item').value.trim();
      const qty = row.querySelector('.qty').value;
      const price = row.querySelector('.price').value;

      if (item && qty && price) {
        items.push({ item, qty, price });
      }
    });

    // Prepare data for API
    const invoiceData = APIUtils.prepareInvoiceForSubmission(formData, items);

    let result;
    if (isEditing) {
      result = await apiService.updateInvoice(isEditing, invoiceData);
    } else {
      result = await apiService.createInvoice(invoiceData);
    }

    if (result.success) {
      // Success feedback
      showSuccessMessage(isEditing ? 'Invoice updated successfully!' : 'Invoice created successfully!');

      // Clear local storage
      localStorage.removeItem('invoiceData');

      // Redirect to invoice list after short delay
      setTimeout(() => {
        window.location.href = 'invoices.html';
      }, 2000);
    } else if (result.skipped || result.noBackend) {
      // No backend available - save locally only
      showSuccessMessage('Invoice saved locally! \n\nNote: Configure backend API to save to database.');

      // Save to local storage as backup
      const localInvoices = JSON.parse(localStorage.getItem('localInvoices') || '[]');
      const localInvoice = {
        id: Date.now(),
        ...invoiceData,
        createdAt: new Date().toISOString(),
        localOnly: true
      };
      localInvoices.push(localInvoice);
      localStorage.setItem('localInvoices', JSON.stringify(localInvoices));

      // Clear form data
      localStorage.removeItem('invoiceData');

    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error('Error saving invoice:', error);
    showErrorMessage('Failed to save invoice: ' + error.message);
  } finally {
    // Restore button state
    saveBtn.innerHTML = originalText;
    saveBtn.disabled = false;
  }
}

// Validate invoice form
function validateInvoiceForm() {
  const clientName = document.getElementById('clientName').value.trim();
  const invoiceDate = document.getElementById('invoiceDate').value;
  const rows = document.querySelectorAll('#tableBody tr');

  if (!clientName) {
    showErrorMessage('Please enter a client name');
    document.getElementById('clientName').focus();
    return false;
  }

  if (!invoiceDate) {
    showErrorMessage('Please select an invoice date');
    document.getElementById('invoiceDate').focus();
    return false;
  }

  // Check for valid items
  let hasValidItems = false;
  rows.forEach(row => {
    const item = row.querySelector('.item').value.trim();
    const qty = parseFloat(row.querySelector('.qty').value) || 0;
    const price = parseFloat(row.querySelector('.price').value) || 0;

    if (item && qty > 0 && price > 0) {
      hasValidItems = true;
    }
  });

  if (!hasValidItems) {
    showErrorMessage('Please add at least one valid item');
    return false;
  }

  return true;
}

// Show success message
function showSuccessMessage(message) {
  const notification = createNotification(message, 'success');
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Show error message
function showErrorMessage(message) {
  const notification = createNotification(message, 'error');
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Create notification element
function createNotification(message, type) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: var(--space-4) var(--space-6);
    border-radius: var(--radius-lg);
    color: white;
    font-weight: var(--font-weight-medium);
    z-index: 1000;
    max-width: 400px;
    box-shadow: var(--shadow-lg);
    animation: slideIn 0.3s ease;
    ${type === 'success' ?
      'background: linear-gradient(135deg, var(--success-500), var(--success-600));' :
      'background: linear-gradient(135deg, var(--danger-500), var(--danger-600));'
    }
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: var(--space-2);">
      ${type === 'success' ?
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>' :
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
      }
      <span>${message}</span>
    </div>
  `;

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  return notification;
}

// Loading state functions
function showLoadingState() {
  const overlay = document.createElement('div');
  overlay.id = 'loadingOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

  overlay.innerHTML = `
    <div style="background: white; padding: var(--space-8); border-radius: var(--radius-xl); text-align: center;">
      <div class="spinner" style="margin: 0 auto var(--space-4);"></div>
      <p>Loading invoice data...</p>
    </div>
  `;

  document.body.appendChild(overlay);
}

function hideLoadingState() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.remove();
  }
}

// Show connection status to user
function showConnectionStatus(status) {
  // Remove existing status indicator
  const existingStatus = document.getElementById('connectionStatus');
  if (existingStatus) {
    existingStatus.remove();
  }

  const statusConfig = {
    connected: {
      text: '🟢 Connected to backend',
      color: 'var(--success-500)',
      background: 'var(--success-50)'
    },
    disconnected: {
      text: '🔴 Backend unavailable',
      color: 'var(--danger-600)',
      background: 'var(--danger-50)'
    },
    checking: {
      text: '🔄 Checking connection...',
      color: 'var(--primary-600)',
      background: 'var(--primary-50)'
    }
  };

  const config = statusConfig[status];
  if (!config) return;

  const statusElement = document.createElement('div');
  statusElement.id = 'connectionStatus';
  statusElement.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    padding: var(--space-2) var(--space-4);
    background: ${config.background};
    color: ${config.color};
    border: 1px solid ${config.color};
    border-radius: var(--radius-base);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    z-index: 1000;
    transition: all var(--transition-base);
    cursor: ${status === 'disconnected' ? 'pointer' : 'default'};
  `;
  statusElement.textContent = config.text;

  // Add click handler for disconnected status
  if (status === 'disconnected') {
    statusElement.addEventListener('click', () => {
      window.apiConfigManager.showConfigModal();
    });
    statusElement.title = 'Click to configure backend';
  }

  // Add to page
  document.body.appendChild(statusElement);

  // Auto-hide after 5 seconds for connected status
  if (status === 'connected') {
    setTimeout(() => {
      if (statusElement) {
        statusElement.style.opacity = '0';
        setTimeout(() => statusElement.remove(), 300);
      }
    }, 5000);
  }

  // Add recheck button for disconnected status
  if (status === 'disconnected') {
    setTimeout(() => {
      addRecheckButton();
    }, 1000);
  }
>>>>>>> 4b709ec (Initial commit of Invoice Billing System code)
}
