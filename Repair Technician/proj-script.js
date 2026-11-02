// Function to switch between tabs
function showTab(tabId) {
    // Hide all tab content
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // Remove active style from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab and highlight button
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// 1. Handle Registration Form Submit
document.getElementById('techForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    document.getElementById('regMessage').textContent = `Registration submitted successfully for ${name}!`;
});

// 2. Handle Appointment Scheduling
document.getElementById('scheduleForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const customer = document.getElementById('customerName').value;
    const date = document.getElementById('appDate').value;
    const time = document.getElementById('appTime').value;
    document.getElementById('scheduleMessage').textContent = `Job scheduled for ${customer} on ${date} at ${time}.`;
});

// 3. Calculate Estimate (Feature 2)
function calculateTotal() {
    const parts = parseFloat(document.getElementById('partsCost').value) || 0;
    const labor = parseFloat(document.getElementById('laborCost').value) || 0;
    const total = parts + labor;
    document.getElementById('estimateResult').textContent = `Total Estimated Cost: ${total} BDT (Parts: ${parts} + Labor: ${labor})`;
}

// 4. Handle Repair Progress Update
document.getElementById('progressForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const vehicle = document.getElementById('vehicleId').value;
    const status = document.getElementById('repairStatus').value;
    document.getElementById('progressMessage').textContent = `Vehicle ${vehicle} status updated to: "${status}".`;
});

// 5. Handle Vehicle History Record
document.getElementById('historyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const vehicle = document.getElementById('historyVehicle').value;
    document.getElementById('historyMessage').textContent = `Service history updated for Vehicle: ${vehicle}.`;
});