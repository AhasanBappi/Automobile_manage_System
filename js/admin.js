// ==================================================
// Administrator pages
// users, settings, reports, activity log
// ==================================================

var admin = null;


// ---------- dashboard ----------

function loadAdminDashboard() {
    admin = checkLogin("admin");
    if (admin == null) {
        return;
    }

    var users = getData("ams_users");
    var staff = 0;
    for (var i = 0; i < users.length; i++) {
        if (users[i].role != "customer") {
            staff++;
        }
    }

    document.getElementById("totalUsers").innerHTML = users.length;
    document.getElementById("totalStaff").innerHTML = staff;
    document.getElementById("totalCars").innerHTML = getData("ams_cars").length;
    document.getElementById("pendingPurchases").innerHTML = countStatus("ams_purchases", "Pending");
    document.getElementById("pendingRentals").innerHTML = countStatus("ams_rentals", "Pending");
    document.getElementById("activeRepairs").innerHTML =
        countStatus("ams_repairs", "Scheduled") + countStatus("ams_repairs", "Received") + countStatus("ams_repairs", "In Progress");

    var logs = getData("ams_log");
    var html = "";
    for (var i = 0; i < logs.length && i < 5; i++) {
        html += "<tr><td>" + logs[i].time + "</td><td>" + safe(logs[i].user) + "</td><td>" + safe(logs[i].action) + "</td></tr>";
    }
    document.getElementById("recentLog").innerHTML = html;
}

function countStatus(key, status) {
    var list = getData(key);
    var count = 0;
    for (var i = 0; i < list.length; i++) {
        if (list[i].status == status) {
            count++;
        }
    }
    return count;
}


// ---------- users ----------

function loadUsersPage() {
    admin = checkLogin("admin");
    if (admin == null) {
        return;
    }
    showUsers();
}

function addStaff() {
    // Get the values from the form
    var name = document.getElementById("fullname").value.trim();
    var email = document.getElementById("email").value.trim().toLowerCase();
    var phone = document.getElementById("phone").value.trim();
    var role = document.getElementById("role").value;
    var password = document.getElementById("password").value;

    // Check each field one by one
    if (name == "") {
        showMessage("message", "Please enter the full name.", true);
        return false;
    }

    if (name.length < 3) {
        showMessage("message", "Full name must be at least 3 characters.", true);
        return false;
    }

    if (email == "") {
        showMessage("message", "Please enter the email.", true);
        return false;
    }

    if (isValidEmail(email) == false) {
        showMessage("message", "Email is not valid (it needs @ and .).", true);
        return false;
    }

    if (emailExists(email, "") == true) {
        showMessage("message", "This email is already used.", true);
        return false;
    }

    if (isValidPhone(phone) == false) {
        showMessage("message", "Phone number must be 11 digits and start with 01.", true);
        return false;
    }

    var error = checkPassword(password);
    if (error != "") {
        showMessage("message", error, true);
        return false;
    }

    var users = getData("ams_users");
    users.push({
        id: nextId("ams_users", "U"),
        name: name,
        email: email,
        phone: phone,
        gender: "",
        dob: "",
        address: "",
        password: password,
        role: role,
        status: "Active",
        joined: todayDate()
    });
    saveData("ams_users", users);
    addLog("Added staff account " + name + " as " + roleName(role));

    document.getElementById("fullname").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("password").value = "";
    showMessage("message", "Staff account added.", false);
    showUsers();
    return false;
}

function showUsers() {
    var filter = document.getElementById("roleFilter").value;
    var users = getData("ams_users");
    var roles = ["admin", "customer", "technician", "manager"];
    var html = "";

    for (var i = 0; i < users.length; i++) {
        var u = users[i];
        if (filter != "all" && u.role != filter) continue;

        var isMe = (u.id == admin.id);
        var disabled = isMe ? " disabled" : "";

        var roleSelect = '<select class="small-input" onchange="changeRole(\'' + u.id + '\', this.value)"' + disabled + ">";
        for (var r = 0; r < roles.length; r++) {
            var selected = (roles[r] == u.role) ? " selected" : "";
            roleSelect += '<option value="' + roles[r] + '"' + selected + ">" + roleName(roles[r]) + "</option>";
        }
        roleSelect += "</select>";

        var buttonText = (u.status == "Active") ? "Deactivate" : "Activate";
        var buttonClass = (u.status == "Active") ? "btn-red" : "btn-green";

        html += "<tr>";
        html += "<td>" + u.id + "</td>";
        html += "<td>" + safe(u.name) + (isMe ? " (you)" : "") + "</td>";
        html += "<td>" + safe(u.email) + "</td>";
        html += "<td>" + safe(u.phone) + "</td>";
        html += "<td>" + roleSelect + "</td>";
        html += "<td>" + statusText(u.status) + "</td>";
        html += '<td><button class="' + buttonClass + '" onclick="toggleStatus(\'' + u.id + '\')"' + disabled + ">" + buttonText + "</button></td>";
        html += "</tr>";
    }
    document.getElementById("userTable").innerHTML = html;
}

function changeRole(id, role) {
    var user = findById("ams_users", id);
    user.role = role;
    updateItem("ams_users", user);
    addLog("Changed role of " + user.name + " to " + roleName(role));
    showUsers();
}

function toggleStatus(id) {
    var user = findById("ams_users", id);
    if (user.status == "Active") {
        user.status = "Inactive";
    } else {
        user.status = "Active";
    }
    updateItem("ams_users", user);
    addLog("Changed status of " + user.name + " to " + user.status);
    showUsers();
}


// ---------- settings ----------

function loadSettingsPage() {
    admin = checkLogin("admin");
    if (admin == null) {
        return;
    }

    var settings = getSettings();
    showCategories();
    showServiceTypes();
    document.getElementById("cancelBeforeDays").value = settings.cancelBeforeDays;
    document.getElementById("lateFeePerDay").value = settings.lateFeePerDay;
    document.getElementById("maxRentalDays").value = settings.maxRentalDays;
}

function showCategories() {
    var list = getSettings().categories;
    var html = "";
    for (var i = 0; i < list.length; i++) {
        html += "<tr><td>" + safe(list[i]) + '</td><td><button class="btn-red" onclick="removeCategory(' + i + ')">Remove</button></td></tr>';
    }
    document.getElementById("categoryTable").innerHTML = html;
}

function addCategory() {
    var name = document.getElementById("category").value.trim();
    var settings = getSettings();
    if (name == "") {
        showMessage("categoryMessage", "Please enter a category name.", true);
        return false;
    }
    if (settings.categories.indexOf(name) > -1) {
        showMessage("categoryMessage", "This category already exists.", true);
        return false;
    }
    settings.categories.push(name);
    saveSettings(settings);
    addLog("Added vehicle category " + name);
    document.getElementById("category").value = "";
    showMessage("categoryMessage", "Category added.", false);
    showCategories();
    return false;
}

function removeCategory(index) {
    var settings = getSettings();
    var name = settings.categories[index];
    if (confirm("Remove category " + name + "?") == false) {
        return;
    }
    settings.categories.splice(index, 1);
    saveSettings(settings);
    addLog("Removed vehicle category " + name);
    showCategories();
}

function showServiceTypes() {
    var list = getSettings().serviceTypes;
    var html = "";
    for (var i = 0; i < list.length; i++) {
        html += "<tr><td>" + safe(list[i]) + '</td><td><button class="btn-red" onclick="removeServiceType(' + i + ')">Remove</button></td></tr>';
    }
    document.getElementById("serviceTable").innerHTML = html;
}

function addServiceType() {
    var name = document.getElementById("serviceType").value.trim();
    var settings = getSettings();
    if (name == "") {
        showMessage("serviceMessage", "Please enter a service type.", true);
        return false;
    }
    if (settings.serviceTypes.indexOf(name) > -1) {
        showMessage("serviceMessage", "This service type already exists.", true);
        return false;
    }
    settings.serviceTypes.push(name);
    saveSettings(settings);
    addLog("Added repair service type " + name);
    document.getElementById("serviceType").value = "";
    showMessage("serviceMessage", "Service type added.", false);
    showServiceTypes();
    return false;
}

function removeServiceType(index) {
    var settings = getSettings();
    var name = settings.serviceTypes[index];
    if (confirm("Remove service type " + name + "?") == false) {
        return;
    }
    settings.serviceTypes.splice(index, 1);
    saveSettings(settings);
    addLog("Removed repair service type " + name);
    showServiceTypes();
}

function saveRules() {
    var cancelDays = parseInt(document.getElementById("cancelBeforeDays").value);
    var lateFee = parseInt(document.getElementById("lateFeePerDay").value);
    var maxDays = parseInt(document.getElementById("maxRentalDays").value);

    if (isNaN(cancelDays) || isNaN(lateFee) || isNaN(maxDays) || cancelDays < 0 || lateFee < 0 || maxDays < 1) {
        showMessage("rulesMessage", "Please enter valid numbers.", true);
        return false;
    }

    var settings = getSettings();
    settings.cancelBeforeDays = cancelDays;
    settings.lateFeePerDay = lateFee;
    settings.maxRentalDays = maxDays;
    saveSettings(settings);
    addLog("Updated rental rules (cancel " + cancelDays + " day(s) before, late fee " + money(lateFee) + "/day, max " + maxDays + " days)");
    showMessage("rulesMessage", "Rental rules saved.", false);
    return false;
}

function resetDemoData() {
    if (confirm("All records in this browser will be deleted. Continue?") == false) {
        return;
    }
    setupDemoData();
    localStorage.removeItem("ams_current_user");
    alert("Demo data has been reset. Please log in again.");
    window.location.href = "../login.html";
}


// ---------- reports ----------

function loadReportsPage() {
    admin = checkLogin("admin");
    if (admin == null) {
        return;
    }

    // sales
    var purchases = getData("ams_purchases");
    var salesAmount = 0;
    for (var i = 0; i < purchases.length; i++) {
        if (purchases[i].status == "Completed") {
            salesAmount += purchases[i].price;
        }
    }
    var html = "";
    html += "<tr><th>Total purchase requests</th><td>" + purchases.length + "</td></tr>";
    html += "<tr><th>Pending</th><td>" + countStatus("ams_purchases", "Pending") + "</td></tr>";
    html += "<tr><th>Approved (waiting for sale)</th><td>" + countStatus("ams_purchases", "Approved") + "</td></tr>";
    html += "<tr><th>Rejected</th><td>" + countStatus("ams_purchases", "Rejected") + "</td></tr>";
    html += "<tr><th>Completed sales</th><td>" + countStatus("ams_purchases", "Completed") + "</td></tr>";
    html += "<tr><th>Total sales amount</th><td>" + money(salesAmount) + "</td></tr>";
    document.getElementById("salesReport").innerHTML = html;

    // rentals
    var rentals = getData("ams_rentals");
    var rentalIncome = 0;
    var lateFees = 0;
    for (var i = 0; i < rentals.length; i++) {
        if (rentals[i].status == "Returned") {
            rentalIncome += rentals[i].totalCharge;
            lateFees += rentals[i].lateFee;
        }
    }
    html = "";
    html += "<tr><th>Total bookings</th><td>" + rentals.length + "</td></tr>";
    html += "<tr><th>Pending</th><td>" + countStatus("ams_rentals", "Pending") + "</td></tr>";
    html += "<tr><th>Approved</th><td>" + countStatus("ams_rentals", "Approved") + "</td></tr>";
    html += "<tr><th>Picked up (on road)</th><td>" + countStatus("ams_rentals", "Picked Up") + "</td></tr>";
    html += "<tr><th>Returned</th><td>" + countStatus("ams_rentals", "Returned") + "</td></tr>";
    html += "<tr><th>Rejected / Cancelled</th><td>" + (countStatus("ams_rentals", "Rejected") + countStatus("ams_rentals", "Cancelled")) + "</td></tr>";
    html += "<tr><th>Total rental income</th><td>" + money(rentalIncome) + "</td></tr>";
    html += "<tr><th>Late return fees (included above)</th><td>" + money(lateFees) + "</td></tr>";
    document.getElementById("rentalReport").innerHTML = html;

    // repairs
    var repairs = getData("ams_repairs");
    var repairAmount = 0;
    for (var i = 0; i < repairs.length; i++) {
        if (repairs[i].status == "Completed") {
            repairAmount += repairs[i].estimate;
        }
    }
    html = "";
    html += "<tr><th>Total repair requests</th><td>" + repairs.length + "</td></tr>";
    html += "<tr><th>New requests</th><td>" + countStatus("ams_repairs", "Requested") + "</td></tr>";
    html += "<tr><th>Scheduled</th><td>" + countStatus("ams_repairs", "Scheduled") + "</td></tr>";
    html += "<tr><th>Received / In progress</th><td>" + (countStatus("ams_repairs", "Received") + countStatus("ams_repairs", "In Progress")) + "</td></tr>";
    html += "<tr><th>Completed</th><td>" + countStatus("ams_repairs", "Completed") + "</td></tr>";
    html += "<tr><th>Rejected</th><td>" + countStatus("ams_repairs", "Rejected") + "</td></tr>";
    html += "<tr><th>Completed repair amount</th><td>" + money(repairAmount) + "</td></tr>";
    document.getElementById("repairReport").innerHTML = html;

    // users
    var users = getData("ams_users");
    var roles = ["admin", "customer", "technician", "manager"];
    html = "";
    for (var r = 0; r < roles.length; r++) {
        var count = 0;
        for (var i = 0; i < users.length; i++) {
            if (users[i].role == roles[r]) count++;
        }
        html += "<tr><th>" + roleName(roles[r]) + "</th><td>" + count + "</td></tr>";
    }
    html += "<tr><th>Inactive accounts</th><td>" + countStatus("ams_users", "Inactive") + "</td></tr>";
    document.getElementById("userReport").innerHTML = html;
}

// columns that go into each CSV file
var csvColumns = {
    cars: ["id", "brand", "model", "year", "category", "fuel", "transmission", "seats", "color", "mileage", "price", "rentRate", "forSale", "forRent", "status"],
    purchases: ["id", "carId", "carName", "price", "customerName", "payment", "requestDate", "status", "managerNote"],
    rentals: ["id", "carId", "carName", "customerName", "startDate", "endDate", "days", "rate", "estimatedCost", "status", "pickupDate", "returnDate", "lateDays", "lateFee", "totalCharge"],
    repairs: ["id", "customerName", "phone", "brand", "model", "year", "regNo", "serviceType", "problem", "status", "slot", "diagnosis", "labor", "estimate"],
    history: ["id", "repairId", "regNo", "brand", "model", "date", "work", "parts", "cost", "recommendation"],
    users: ["id", "name", "email", "phone", "gender", "role", "status", "joined"],
    log: ["time", "user", "role", "action"]
};

function exportCSV() {
    var type = document.getElementById("exportType").value;
    var list = getData("ams_" + type);
    var columns = csvColumns[type];

    if (list.length == 0) {
        alert("There are no records to export.");
        return;
    }

    var csv = columns.join(",") + "\n";
    for (var i = 0; i < list.length; i++) {
        var row = [];
        for (var c = 0; c < columns.length; c++) {
            var value = list[i][columns[c]];
            if (value == undefined) value = "";
            // put every value in quotes so commas inside text are safe
            row.push('"' + String(value).replace(/"/g, '""') + '"');
        }
        csv += row.join(",") + "\n";
    }

    var file = new Blob([csv], { type: "text/csv" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "ams_" + type + "_" + todayDate() + ".csv";
    link.click();
    addLog("Exported " + type + " records as CSV");
}


// ---------- activity log ----------

function loadActivityPage() {
    admin = checkLogin("admin");
    if (admin == null) {
        return;
    }
    showLog();
}

function showLog() {
    var search = document.getElementById("search").value.trim().toLowerCase();
    var logs = getData("ams_log");
    var html = "";
    for (var i = 0; i < logs.length; i++) {
        var text = (logs[i].user + " " + logs[i].action).toLowerCase();
        if (search != "" && text.indexOf(search) == -1) continue;
        html += "<tr><td>" + logs[i].time + "</td><td>" + safe(logs[i].user) + "</td><td>" + logs[i].role + "</td><td>" + safe(logs[i].action) + "</td></tr>";
    }
    if (html == "") {
        html = '<tr><td colspan="4">No activity found.</td></tr>';
    }
    document.getElementById("logTable").innerHTML = html;
}

function clearLog() {
    if (confirm("Clear the whole activity log?") == false) {
        return;
    }
    saveData("ams_log", []);
    addLog("Cleared the activity log");
    showLog();
}
