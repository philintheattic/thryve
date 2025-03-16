

// DOM Elements
const calendar = document.querySelector('.calendar');
const currentMonthEl = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const addBtn = document.getElementById('add-btn');
const addPanel = document.getElementById('add-panel');
const closePanel = document.getElementById('close-panel');
const overlay = document.getElementById('overlay');
const saveBtn = document.getElementById('save-btn');
const selectedDateEl = document.getElementById('selected-date');
const trackedItemsEl = document.getElementById('tracked-items');
const checkboxList = document.getElementById('checkbox-list');
const customCheckboxList = document.getElementById('custom-checkbox-list');
const newItemInput = document.getElementById('new-item');
const addItemBtn = document.getElementById('add-item-btn');
const resetItemsBtn = document.getElementById('reset-items-btn');

// Default checkbox items
const defaultItems = [
    { id: 'roetung', label: 'Rötung' },
    { id: 'risse', label: 'Risse' },
    { id: 'weisse-stellen', label: 'Weiße Stellen' },
    { id: 'pusteln', label: 'Pusteln' },
    /* { id: 'water', label: '8 Glasses of Water' },
    { id: 'vitamins', label: 'Vitamins' },
    { id: 'no-sugar', label: 'No Sugar' },
    { id: 'stretching', label: 'Stretching' },
    { id: 'no-alcohol', label: 'No Alcohol' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'coding', label: 'Coding' },
    { id: 'early-sleep', label: 'Sleep Before 11' } */
];

// App State
const today = new Date();
let currentDate = new Date();
let selectedDate = new Date(); // Default to today
let customItems = loadCustomItems();

// Initialize app
renderDefaultCheckboxes();
renderCustomCheckboxes();
renderCalendar();
updateSelectedDateDisplay();
loadAndDisplayCheckedItems();
displayStatisticsChart("bar", "month");

// Event Listeners
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

addBtn.addEventListener('click', () => {
    openAddPanel();
    loadCheckboxState();
});

closePanel.addEventListener('click', closeAddPanel);
overlay.addEventListener('click', closeAddPanel);

saveBtn.addEventListener('click', () => {
    saveCheckboxState();
    closeAddPanel();
    loadAndDisplayCheckedItems();
    renderCalendar(); // Refresh calendar to show updated data indicators
    displayStatisticsChart("bar", "month");
});

addItemBtn.addEventListener('click', addCustomItem);

newItemInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addCustomItem();
    }
});

weekBtn.addEventListener("click", () => {
    displayStatisticsChart("bar", "week");
});
monthBtn.addEventListener("click", () => {
    displayStatisticsChart("bar", "month")
});

// resetItemsBtn.addEventListener('click', () => {
//     if (confirm('Reset all items to default? This will remove all custom items.')) {
//         localStorage.removeItem('customItems');
//         customItems = [];
//         renderCustomCheckboxes();
//         renderDefaultCheckboxes();
//     }
// });

// Functions for custom items
function addCustomItem() {
    const itemText = newItemInput.value.trim();
    if (itemText) {
        const itemId = 'custom-' + Date.now();
        customItems.push({ id: itemId, label: itemText });
        saveCustomItems();
        renderCustomCheckboxes();
        newItemInput.value = '';
        newItemInput.focus();
    }
}

function saveCustomItems() {
    localStorage.setItem('customItems', JSON.stringify(customItems));
}

function loadCustomItems() {
    const saved = localStorage.getItem('customItems');
    return saved ? JSON.parse(saved) : [];
}

function renderDefaultCheckboxes() {
    checkboxList.innerHTML = '';
    defaultItems.forEach(item => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.classList.add('checkbox-item');
        checkboxDiv.innerHTML = `
            <input type="checkbox" id="${item.id}" value="${item.label}">
            <label for="${item.id}">${item.label}</label>
        `;
        checkboxList.appendChild(checkboxDiv);
    });
}

function renderCustomCheckboxes() {
    customCheckboxList.innerHTML = '';
    customItems.forEach(item => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.classList.add('checkbox-item', 'custom-checkbox');
        checkboxDiv.innerHTML = `
            <input type="checkbox" id="${item.id}" value="${item.label}">
            <label for="${item.id}">${item.label}</label>
            <div class="checkbox-actions">
                <button class="delete-checkbox" data-id="${item.id}">×</button>
            </div>
        `;
        customCheckboxList.appendChild(checkboxDiv);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-checkbox').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.getAttribute('data-id');
            customItems = customItems.filter(item => item.id !== itemId);
            saveCustomItems();
            renderCustomCheckboxes();
        });
    });
}

// Calendar Functions
function renderCalendar() {
    calendar.querySelectorAll('.calendar-day').forEach(day => day.remove());
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthEl.textContent = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendar-day');
        calendar.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day');
        dayEl.textContent = day;
        
        const currentDateObj = new Date(year, month, day);
        
        // Check if this day is today
        if (isSameDate(currentDateObj, today)) {
            dayEl.classList.add('today');
        }
        
        // Check if this day is the selected date
        if (isSameDate(currentDateObj, selectedDate)) {
            dayEl.classList.add('active');
        }
        
        // Check if this day has data
        const dateKey = getDateKey(currentDateObj);
        if (localStorage.getItem(dateKey)) {
            const data = JSON.parse(localStorage.getItem(dateKey));
            const hasCheckedItems = Object.values(data).some(value => value === true);
            
            if (hasCheckedItems) {
                dayEl.classList.add('has-data');
            }
        }
        
        dayEl.addEventListener('click', () => {
            // Remove active class from all days
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('active'));
            // Add active class to clicked day
            dayEl.classList.add('active');
            
            // Update selected date
            selectedDate = new Date(year, month, day);
            updateSelectedDateDisplay();
            loadAndDisplayCheckedItems();
        });
        
        calendar.appendChild(dayEl);
    }
}

function updateSelectedDateDisplay() {
    selectedDateEl.textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// Check if two dates are the same (ignoring time)
function isSameDate(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
}

// Panel Functions
function openAddPanel() {
    addPanel.classList.add('active');
    overlay.classList.add('active');
}

function closeAddPanel() {
    addPanel.classList.remove('active');
    overlay.classList.remove('active');
}

// Data Functions
function getDateKey(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function saveCheckboxState() {
    const dateKey = getDateKey(selectedDate);
    const defaultCheckboxes = checkboxList.querySelectorAll('input[type="checkbox"]');
    const customCheckboxes = customCheckboxList.querySelectorAll('input[type="checkbox"]');
    
    const state = {};
    defaultCheckboxes.forEach(checkbox => {
        state[checkbox.id] = checkbox.checked;
    });
    
    customCheckboxes.forEach(checkbox => {
        state[checkbox.id] = checkbox.checked;
    });
    
    localStorage.setItem(dateKey, JSON.stringify(state));
}

function loadCheckboxState() {
    const dateKey = getDateKey(selectedDate);
    const savedState = localStorage.getItem(dateKey);
    
    const defaultCheckboxes = checkboxList.querySelectorAll('input[type="checkbox"]');
    const customCheckboxes = customCheckboxList.querySelectorAll('input[type="checkbox"]');
    
    if (savedState) {
        const state = JSON.parse(savedState);
        
        defaultCheckboxes.forEach(checkbox => {
            checkbox.checked = state[checkbox.id] || false;
        });
        
        customCheckboxes.forEach(checkbox => {
            checkbox.checked = state[checkbox.id] || false;
        });
    } else {
        defaultCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        customCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
}

function loadAndDisplayCheckedItems() {
    const dateKey = getDateKey(selectedDate);
    const savedState = localStorage.getItem(dateKey);
    
    if (savedState) {
        const state = JSON.parse(savedState);
        const checkedItems = [];
        
        // Check default items
        defaultItems.forEach(item => {
            if (state[item.id]) {
                checkedItems.push(item.label);
            }
        });
        
        // Check custom items
        customItems.forEach(item => {
            if (state[item.id]) {
                checkedItems.push(item.label);
            }
        });
        
        if (checkedItems.length > 0) {
            trackedItemsEl.innerHTML = checkedItems.map(item => `<div>✓ ${item}</div>`).join('');
        } else {
            trackedItemsEl.innerHTML = '<p>No items tracked for this day</p>';
        }
    } else {
        trackedItemsEl.innerHTML = '<p>No items tracked for this day</p>';
    }
};
