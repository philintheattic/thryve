// Get some CSS variables
const primaryColor = window.getComputedStyle(document.documentElement).getPropertyValue("--primary-color");
const secondaryColor = window.getComputedStyle(document.documentElement).getPropertyValue("--secondary-color");
const lightBg = window.getComputedStyle(document.documentElement).getPropertyValue("--light-bg");
const cardBg = window.getComputedStyle(document.documentElement).getPropertyValue("--card-bg");


// iterates over localstorage items to collect the count of all checked checkboxes
function collectStatistics(startDate, endDate) {
    // Initialize statistics object for default items
    const stats = {};
    defaultItems.forEach(item => {
        stats[item.id] = {
            count: 0,
            dates: []
        };
    });
    
    // Also track custom items if needed
    customItems.forEach(item => {
        stats[item.id] = {
            count: 0,
            dates: []
        };
    });
    
    // Clone start date to avoid modifying the original
    const currentDate = new Date(startDate);
    
    // Loop through each day in the date range
    while (currentDate <= endDate) {
        const dateKey = getDateKey(currentDate);
        const savedState = localStorage.getItem(dateKey);
        
        if (savedState) {
            const state = JSON.parse(savedState);
            
            // Process each tracked item
            Object.keys(state).forEach(itemId => {
                if (state[itemId] === true && stats[itemId]) {
                    stats[itemId].count++;
                    stats[itemId].dates.push(new Date(currentDate));
                }
            });
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return stats;
}

// Generate chart data
function generateChartData(period = 'month') {
    // Set date range based on period
    let startDate, endDate = new Date(); // End date is today
    
    if (period === 'week') {
        // Last 7 days
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
        // Last 30 days
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
    } else if (period === 'year') {
        // Last 365 days
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 365);
    }
    
    // Get statistics for the period
    const stats = collectStatistics(startDate, endDate);
    
    // Format data for Chart.js
    const labels = defaultItems.map(item => item.label);
    const data = defaultItems.map(item => stats[item.id].count);
    
    return {
        labels: labels,
        datasets: [{
            label: 'Häufigkeit',
            data: data,
            backgroundColor: primaryColor,
            borderColor: secondaryColor,
            borderWidth: 1
        }]
    };
}

// render the chart
function displayStatisticsChart(chartType = 'bar', period = 'month') {
    const ctx = document.getElementById('statistics-chart').getContext('2d');
    let chartData;
    
    if (chartType === 'bar') {
        chartData = generateChartData(period);
    } else if (chartType === 'line') {
        // For line chart, we'll track specific items over time
        const itemsToTrack = defaultItems.map(item => item.id);
        chartData = generateTimelineData(itemsToTrack, period);
    }
    
    // If you have an existing chart, destroy it first
    if (window.myChart) {
        window.myChart.destroy();
    }
    
    window.myChart = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    precision: 0
                }
            }
        }
    });
}

// displayStatisticsChart("bar", "month")

const weekBtn = document.getElementById("show-week");
const monthBtn = document.getElementById("show-month");