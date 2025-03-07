document.addEventListener('DOMContentLoaded', () => {
  loadCustomers();
});

async function loadCustomers() {
  const container = document.getElementById('customers-container');
  container.innerHTML = '<div class="loading">Loading customers...</div>';
  
  try {
    const response = await fetch('http://localhost:5000/api/customers');
    if (!response.ok) throw new Error('Failed to load customers');
    
    const customers = await response.json();
    renderCustomers(customers);
  } catch (error) {
    container.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    console.error('Error:', error);
  }
}

function renderCustomers(customers) {
  const container = document.getElementById('customers-container');
  if (customers.length === 0) {
    container.innerHTML = '<div class="empty-state">No customers found</div>';
    return;
  }
  
  container.innerHTML = customers.map(customer => `
    <div class="customer-item" data-id="${customer.customer_id}">
      <h3>${customer.name}</h3>
      <p>✉️ ${customer.email}</p>
      <p>☎️ ${customer.phone}</p>
    </div>
  `).join('');
}

async function addCustomer() {
  const newCustomer = {
    name: document.getElementById('customerName').value,
    email: document.getElementById('customerEmail').value,
    phone: document.getElementById('customerPhone').value
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer)
    });
    
    if (response.ok) {
      loadCustomers();
      clearForm();
    } else {
      const errorData = await response.json();
      alert('Error adding customer: ' + (errorData.message || response.statusText));
    }
  } catch (error) {
    alert('Error adding customer: ' + error.message);
    console.error('Error:', error);
  }
}

function clearForm() {
  ['customerName', 'customerEmail', 'customerPhone'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

