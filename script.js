const form = document.getElementById("maintenance-form");
const serviceInput = document.getElementById("service");
const mileageInput = document.getElementById("mileage");
const dateInput = document.getElementById("date");
const costInput = document.getElementById("cost");
const notesInput = document.getElementById("notes");

const maintenanceList = document.getElementById("maintenance-list");
const serviceFilter = document.getElementById("filter");
const mileageFilter = document.getElementById("mileage-filter");

const totalCostElement = document.getElementById("total-cost");
const recordCountElement = document.getElementById("record-count");
const emptyMessage = document.getElementById("empty-message");

const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");

const successMessage = document.getElementById("success-message");

// Load existing records from the localStorage.
// If nothing has been saved, start with an empty array.

let maintenanceRecords =
  JSON.parse(localStorage.getItem("maintenanceRecords")) || [];

//Null means that a new record is being created.
let editingId = null;

//this variable stores the chart.js chart.
let maintenanceChart = null;

/*
 * Save the maintenance array to localStorage.
 * JSON.stringify converts the JavaScript array into text.
 */
function saveRecords() {
  localStorage.setItem(
    "maintenanceRecords",
    JSON.stringify(maintenanceRecords),
  );
}

/*
 * Create a unique ID for every maintenance record.
 */
function createId() {
  return Date.now();
}

/*
 * Validate the information entered by the user.
 */
function validateRecord(mileage, cost) {
  if (mileage < 0) {
    throw new Error("Mileage cannot be negative.");
  }

  if (cost < 0) {
    throw new Error("Cost cannot be negative.");
  }

  return true;
}

/*
 * Add a new maintenance record or update an existing record.
 */
form.addEventListener("submit", function (event) {
  event.preventDefault();

  try {
    const mileage = Number(mileageInput.value);
    const cost = Number(costInput.value);

    validateRecord(mileage, cost);

    const record = {
      id: editingId || createId(),
      date: dateInput.value,
      service: serviceInput.value,
      mileage: mileage,
      cost: cost,
      notes: notesInput.value.trim(),
    };

    if (editingId === null) {
      // Add the new object to the array.
      maintenanceRecords.push(record);
    } else {
      // map() creates an updated array.
      maintenanceRecords = maintenanceRecords.map(function (existingRecord) {
        if (existingRecord.id === editingId) {
          return record;
        }

        return existingRecord;
      });
    }

    saveRecords();

    resetForm();

    displayRecords();

    showSuccessMessage("Maintenance record added successfully!");
  } catch (error) {
    alert(error.message);
  }
});

function showSuccessMessage(message) {
  successMessage.textContent = message;
  successMessage.classList.remove("hidden");

  setTimeout(function () {
    successMessage.classList.add("hidden");
  }, 3000);
}

/*
 * Return only the records that match the selected filters.
 * This demonstrates the native ES6 filter() array function.
 */
function getFilteredRecords() {
  const selectedService = serviceFilter.value;
  const maximumMileage = Number(mileageFilter.value);

  return maintenanceRecords.filter(function (record) {
    const serviceMatches =
      selectedService === "All" || record.service === selectedService;

    const mileageMatches =
      mileageFilter.value === "" || record.mileage <= maximumMileage;

    return serviceMatches && mileageMatches;
  });
}

/*
 * Display all matching records in the HTML table.
 */
function displayRecords() {
  maintenanceList.innerHTML = "";

  const filteredRecords = getFilteredRecords();

  if (filteredRecords.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
  }

  /*
   * forEach() is another native JavaScript array function.
   */
  filteredRecords.forEach(function (record) {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${formatDate(record.date)}</td>

            <td>${record.service}</td>

            <td>${record.mileage.toLocaleString()}</td>

            <td>$${record.cost.toFixed(2)}</td>

            <td>${record.notes || "-"}</td>

            <td>
                <button
                    class="edit-button"
                    onclick="editRecord(${record.id})">
                    Edit
                </button>

                <button
                    class="delete-button"
                    onclick="deleteRecord(${record.id})">
                    Delete
                </button>
            </td>
        `;

    maintenanceList.appendChild(row);
  });

  updateSummary();

  updateChart();
}

/*
 * Convert YYYY-MM-DD into a more readable date.
 */
function formatDate(dateString) {
  const parts = dateString.split("-");

  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

/*
 * Load an existing record into the form for editing.
 * find() searches the array for the matching ID.
 */
function editRecord(id) {
  const record = maintenanceRecords.find(function (record) {
    return record.id === id;
  });

  if (!record) {
    return;
  }

  dateInput.value = record.date;
  serviceInput.value = record.service;
  mileageInput.value = record.mileage;
  costInput.value = record.cost;
  notesInput.value = record.notes;

  editingId = id;

  submitButton.textContent = "Update Maintenance";

  cancelButton.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/*
 * Delete a record from the array.
 */
function deleteRecord(id) {
  const shouldDelete = confirm(
    "Are you sure you want to delete this maintenance record?",
  );

  if (!shouldDelete) {
    return;
  }

  maintenanceRecords = maintenanceRecords.filter(function (record) {
    return record.id !== id;
  });

  saveRecords();

  displayRecords();
}

/*
 * Reset the form after adding or editing a record.
 */
function resetForm() {
  form.reset();

  editingId = null;

  submitButton.textContent = "Add Maintenance";

  cancelButton.classList.add("hidden");
}

/*
 * Allow the user to cancel editing.
 */
cancelButton.addEventListener("click", function () {
  resetForm();
});

/*
 * Update the table whenever the service filter changes.
 */
serviceFilter.addEventListener("change", function () {
  displayRecords();
});

/*
 * Update the table while the mileage filter is being entered.
 */
mileageFilter.addEventListener("input", function () {
  displayRecords();
});

/*
 * Calculate the total cost using reduce().
 */
function calculateTotalCost() {
  return maintenanceRecords.reduce(function (total, record) {
    return total + record.cost;
  }, 0);
}

/*
 * Update the summary information shown under the table.
 */
function updateSummary() {
  const total = calculateTotalCost();

  totalCostElement.textContent = `Total Maintenance Cost: $${total.toFixed(2)}`;

  recordCountElement.textContent = `Total Records: ${maintenanceRecords.length}`;
}

/*
 * RECURSION EXAMPLE
 *
 * This function recursively adds the costs for one service type.
 * The function calls itself until it reaches the end of the array.
 */
function recursiveServiceTotal(records, service, index = 0) {
  // Base case stops the recursion.
  if (index >= records.length) {
    return 0;
  }

  let currentCost = 0;

  if (records[index].service === service) {
    currentCost = records[index].cost;
  }

  // Recursive call moves to the next record.
  return currentCost + recursiveServiceTotal(records, service, index + 1);
}

/*
 * Build the Chart.js graph.
 */
function updateChart() {
  /*
   * Set creates a list of unique service names.
   */
  const services = [
    ...new Set(
      maintenanceRecords.map(function (record) {
        return record.service;
      }),
    ),
  ];

  /*
   * Use the recursive function to calculate the
   * total cost for every service category.
   */
  const costs = services.map(function (service) {
    return recursiveServiceTotal(maintenanceRecords, service);
  });

  const chartCanvas = document.getElementById("maintenance-chart");

  /*
   * Destroy the previous chart before creating
   * a new one.
   */
  if (maintenanceChart !== null) {
    maintenanceChart.destroy();
  }

  maintenanceChart = new Chart(chartCanvas, {
    type: "bar",

    data: {
      labels: services,

      datasets: [
        {
          label: "Maintenance Cost ($)",
          data: costs,
        },
      ],
    },

    options: {
      responsive: true,

      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

/*
 * Display records as soon as the application opens.
 */
displayRecords();
