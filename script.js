// Add a new item row
function addItemRow() {
  const table = document.getElementById("tableBody");
  const row = document.createElement("tr");

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
function updateTotals() {
  const rows = document.querySelectorAll("#tableBody tr");
  let subtotal = 0;

  rows.forEach(row => {
    const qty = row.querySelector(".qty").value;
    const price = row.querySelector(".price").value;
    const total = parseFloat(qty) * parseFloat(price);
    row.querySelector(".total").textContent = total.toFixed(2);
    subtotal += total;
  });

  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("tax").textContent = tax.toFixed(2);
  document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);
}

// Print the invoice
function printInvoice() {
  window.print();
}
