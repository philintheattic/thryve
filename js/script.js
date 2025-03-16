// register serviceworker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => {
      console.log("Service Worker registered!");
    }).catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
  }


// Navbar Functionality
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


// Chart.js functionality
const ctx = document.getElementById("test-chart");

new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["test1", "blablabla", "anotherOne"],
        datasets: [{
            label: "amount of something",
            data: [1, 12, 17, 8],
            backgroundColor: primaryColor,
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
