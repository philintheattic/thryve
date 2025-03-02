// register serviceworker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js').then(() => {
      console.log("Service Worker registered!");
    }).catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
  }
  



document.addEventListener("DOMContentLoaded", function () {
    const calendar = document.getElementById("calendar");
    const noteInput = document.getElementById("noteInput");
    const painScale = document.getElementById("painScale");
    const saveBtn = document.getElementById("saveBtn");
    const status = document.getElementById("status");
    const selectedDateDisplay = document.getElementById("selectedDateDisplay");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");
    const currentMonthDisplay = document.getElementById("currentMonth");
    const painChartCanvas = document.getElementById("painChart");

    let today = new Date();
    let selectedDate = today.toISOString().split("T")[0];
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();
    let painChart;

    function generateCalendar() {
        calendar.innerHTML = "";
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const monthNames = ["January", "February", "March", "April", "May", "June", 
                            "July", "August", "September", "October", "November", "December"];
        currentMonthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement("div");
            calendar.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement("div");
            dayElement.classList.add("day");
            dayElement.textContent = day;

            const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            if (dateString === today.toISOString().split("T")[0]) {
                dayElement.classList.add("today");
            }

            if (dateString === selectedDate) {
                dayElement.classList.add("selected");
            }

            // Check if there's saved data and highlight the day
            if (localStorage.getItem(dateString)) {
                dayElement.classList.add("has-data");
            }

            dayElement.addEventListener("click", function () {
                document.querySelectorAll(".day").forEach(el => el.classList.remove("selected"));
                dayElement.classList.add("selected");
                selectedDate = dateString;
                loadNote();
            });

            calendar.appendChild(dayElement);
        }
    }

    function loadNote() {
        const savedData = JSON.parse(localStorage.getItem(selectedDate)) || { note: "", pain: "1" };
        noteInput.value = savedData.note;
        painScale.value = savedData.pain;
        selectedDateDisplay.textContent = `Selected Date: ${selectedDate}`;
        status.textContent = savedData.note || savedData.pain ? "Note loaded." : "";
        updateChart();
    }

    saveBtn.addEventListener("click", function () {
        if (!selectedDate) {
            alert("Please select a date.");
            return;
        }

        const data = {
            note: noteInput.value,
            pain: painScale.value
        };

        localStorage.setItem(selectedDate, JSON.stringify(data));
        status.textContent = "Note saved.";
        updateChart();
    });

    prevMonthBtn.addEventListener("click", function () {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar();
        updateChart();
    });

    nextMonthBtn.addEventListener("click", function () {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar();
        updateChart();
    });

    function getPainData() {
        let painData = [];
        let labels = [];

        for (let day = 1; day <= 31; day++) {
            let dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            let savedData = JSON.parse(localStorage.getItem(dateString));
            if (savedData) {
                labels.push(day);
                painData.push(parseInt(savedData.pain, 10));
            }
        }
        return { labels, painData };
    }

    function updateChart() {
        let { labels, painData } = getPainData();

        if (painChart) {
            painChart.destroy();
        }

        painChart = new Chart(painChartCanvas, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Pain Level",
                    data: painData,
                    borderColor: "red",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        title: { display: true, text: "Pain Level" }
                    },
                    x: {
                        title: { display: true, text: "Day of the Month" }
                    }
                }
            }
        });
    }

    generateCalendar();
    loadNote();
});


// Nav Bar Functionality
function switchTab(tab) {
    const allTabs = document.querySelectorAll(".tab-content");
    const selectedTab = document.getElementById(`${tab}-tab`);

    document.querySelectorAll(".tab-button").forEach(button => {
        button.classList.remove("active");
    });
    document.querySelector(`button[onclick="switchTab('${tab}')"]`).classList.add("active");

    // Remove 'visible' from all tabs (starts fade-out animation)
    allTabs.forEach(tabContent => {
        tabContent.classList.remove("visible");
    });

    // Wait for the fade-out to finish before hiding non-active tabs
    setTimeout(() => {
        allTabs.forEach(tabContent => {
            if (tabContent !== selectedTab) {
                tabContent.classList.add("hidden");
            }
        });

        // Show and fade in the selected tab
        selectedTab.classList.remove("hidden");
        setTimeout(() => selectedTab.classList.add("visible"), 10); // Small delay to trigger transition

    }, 300); // Match the CSS animation duration
}



// Ensure "Tracking" is visible on load
document.addEventListener("DOMContentLoaded", () => {
    switchTab('tracking');
});

