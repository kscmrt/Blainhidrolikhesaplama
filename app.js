// Data definitions moved to data.js

let calculatedResults = []; // Store results to access in selectCylinder

/* ---------------------------------------------------------------
   COST CALCULATION FUNCTIONS
   --------------------------------------------------------------- */
function calculateCylinderPrice(cylinderType, strokeMeters, quantity, isTwoPiece = false) {
    // cylinderType format: "80x10" (diameter x thickness)
    const pricing = cylinderPricing[cylinderType];

    if (!pricing) {
        console.warn(`Pricing not found for cylinder type: ${cylinderType}`);
        return 0;
    }

    // Base calculation: Fixed + (PerMeter × Stroke)
    let baseCost = pricing.fixed + (pricing.perMeter * strokeMeters);

    // Add "Additional" cost if two-piece cylinder
    if (isTwoPiece) {
        baseCost += pricing.additional;
    }

    // Apply profit margins: First 16%, then 30%
    // Formula: ((baseCost × 1.16) × 1.30) = baseCost × 1.508
    const pricePerCylinder = baseCost * 1.16 * 1.30;

    return pricePerCylinder * quantity;
}

function calculateSystemCost(selectedComponents) {
    let totalCost = 0;
    const breakdown = {
        cylinders: 0,
        motor: 0,
        pump: 0,
        powerUnit: 0, // Includes hose cost if "Güç Ünitesi Hortumları" is selected
        ruptureValve: 0,
        mainValve: 0,
        accessories: 0
    };

    // Cylinders
    if (selectedComponents.cylinder) {
        const { cylinderType, strokeMeters, quantity, isTwoPiece } = selectedComponents.cylinder;
        breakdown.cylinders = calculateCylinderPrice(cylinderType, strokeMeters, quantity, isTwoPiece);
    }

    // Motor (fixed price - no profit margin)
    if (selectedComponents.motorName) {
        const motor = motors.find(m => m.name === selectedComponents.motorName);
        if (motor) breakdown.motor = motor.price;
    }

    // Pump (fixed price - no profit margin)
    if (selectedComponents.pumpName) {
        const pump = pumps.find(p => p.name === selectedComponents.pumpName);
        if (pump) breakdown.pump = pump.price;
    }

    // Power Unit (fixed price, no profit margin)
    // Add calculated hose cost if "Güç Ünitesi Hortumları" is selected
    if (selectedComponents.powerUnitName) {
        const unit = powerUnits.find(u => u.model === selectedComponents.powerUnitName);
        if (unit) {
            breakdown.powerUnit = unit.price;
            console.log('Power unit base price:', unit.price);

            // Check if power unit hoses accessory is selected
            const powerUnitHosesSelected = selectedComponents.accessories &&
                selectedComponents.accessories.includes("Güç Ünitesi Hortumları");

            console.log('Power unit hoses selected:', powerUnitHosesSelected);
            console.log('Hoses data:', selectedComponents.hoses);

            if (powerUnitHosesSelected && selectedComponents.hoses) {
                // Add the calculated hose cost to power unit price
                const { mainDiameter, mainLength, cylinderDiameter, cylinderLength, cylinderCount } = selectedComponents.hoses;
                const hoseCost = calculateHoseCost(mainDiameter, mainLength, cylinderDiameter, cylinderLength, cylinderCount);
                console.log('Calculated hose cost:', hoseCost);
                breakdown.powerUnit += hoseCost;
                console.log('Power unit final price:', breakdown.powerUnit);
            }
        }
    }

    // Rupture Valve (R10)
    if (selectedComponents.ruptureValveName && selectedComponents.ruptureValveName !== "Yok") {
        console.log('Looking for rupture valve:', selectedComponents.ruptureValveName);
        const ruptureValve = burstHoseValves.find(v => v.name === selectedComponents.ruptureValveName);
        console.log('Found rupture valve:', ruptureValve);
        if (ruptureValve) {
            // Price is multiplied by cylinder quantity
            const qty = selectedComponents.cylinder ? selectedComponents.cylinder.quantity : 1;
            breakdown.ruptureValve = ruptureValve.price * qty;
        } else {
            console.warn('Rupture valve not found in burstHoseValves array');
        }
    }

    // Main Valve (Ana Kontrol Valfi)
    if (selectedComponents.mainValveName) {
        const mainValve = mainValves.find(v => v.name === selectedComponents.mainValveName);
        if (mainValve) {
            breakdown.mainValve = mainValve.price;
        }
    }

    // Note: Hose cost is already included in power unit price when "Güç Ünitesi Hortumları" is selected

    // Accessories
    if (selectedComponents.accessories && Array.isArray(selectedComponents.accessories)) {
        selectedComponents.accessories.forEach(accName => {
            // Skip "Güç Ünitesi Hortumları" as it is added to powerUnit price dynamically
            if (accName === "Güç Ünitesi Hortumları") return;

            // Handle dynamic pricing for "Küresel Vana BG"
            if (accName === "Küresel Vana BG") {
                let ballValvePrice = 0;
                const mainValveName = selectedComponents.mainValveName || "";

                if (mainValveName.includes("KV")) {
                    ballValvePrice = 24;
                } else if (mainValveName.includes("0,75'' EV100") || mainValveName.includes("0.75'' EV100")) {
                    ballValvePrice = 42;
                } else if (mainValveName.includes("1,5'' EV100") || mainValveName.includes("1.5'' EV100")) {
                    ballValvePrice = 67;
                } else if (mainValveName.includes("2'' EV100") || mainValveName.includes("2.0'' EV100")) {
                    ballValvePrice = 77;
                } else {
                    // Fallback or default if main valve not recognized or empty
                    // Assuming smallest size or 0 if strictly dependent
                    ballValvePrice = 42; // Default to 3/4" price as safe fallback
                }
                breakdown.accessories += ballValvePrice;
                return;
            }

            const acc = accessories.find(a => a.name === accName);
            if (acc) breakdown.accessories += acc.price;
        });
    }

    totalCost = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    return { totalCost, breakdown };
}

/* ---------------------------------------------------------------
   THERMAL ANALYSIS FUNCTIONS
   --------------------------------------------------------------- */
function calculateHeatGeneration(motorPower, pumpFlow, pressure, tripsPerHour, travelTime) {
    // Heat generated per cycle (kJ)
    // Q = P * t * efficiency_loss
    // Assuming 15% energy loss as heat
    const cycleTime = travelTime; // seconds
    const powerKW = motorPower;
    const heatPerCycle = powerKW * cycleTime * 0.15; // kJ

    // Total heat per hour
    const heatPerHour = heatPerCycle * tripsPerHour; // kJ/h

    return heatPerHour;
}

function calculateOilTemperatureRise(heatPerHour, oilVolume, ambientTemp = 25) {
    // Oil properties
    const oilDensity = 870; // kg/m³
    const oilSpecificHeat = 2.0; // kJ/(kg·°C)
    const oilMass = (oilVolume / 1000) * oilDensity; // kg

    // Temperature rise per hour (assuming no cooling)
    // ΔT = Q / (m * c)
    const tempRisePerHour = heatPerHour / (oilMass * oilSpecificHeat);

    // Estimated steady-state temperature (with natural cooling)
    // Simplified model: assume 30% heat dissipation
    const steadyStateTemp = ambientTemp + (tempRisePerHour * 0.7);

    return {
        tempRisePerHour: tempRisePerHour.toFixed(1),
        steadyStateTemp: steadyStateTemp.toFixed(1),
        needsCooling: steadyStateTemp > 55 // Oil should stay below 55°C
    };
}

function performThermalAnalysis(inputs, selectedComponents) {
    const { speed, travelDistance, tripsPerHour } = inputs;
    const { motorPower, pumpFlow, pressure, oilVolume } = selectedComponents;

    // Calculate travel time
    const travelMeters = travelDistance / 1000;
    const travelTime = travelMeters / speed; // seconds

    // Heat generation
    const heatPerHour = calculateHeatGeneration(motorPower, pumpFlow, pressure, tripsPerHour, travelTime);

    // Temperature analysis
    const thermalResult = calculateOilTemperatureRise(heatPerHour, oilVolume);

    return {
        heatPerHour: heatPerHour.toFixed(0),
        ...thermalResult,
        recommendation: thermalResult.needsCooling
            ? "⚠️ Soğutucu (Cooler) önerilir"
            : "✅ Doğal soğutma yeterli"
    };
}


/* ---------------------------------------------------------------
   USER ACTIVITY LOGGING
   --------------------------------------------------------------- */
function logChange(action, details) {
    try {
        const userObj = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const username = userObj.username || 'unknown';
        const logEntry = {
            user: username,
            action: action,
            details: details,
            timestamp: new Date().toISOString()
        };
        const logs = JSON.parse(localStorage.getItem('changeLogs') || '[]');
        logs.push(logEntry);
        localStorage.setItem('changeLogs', JSON.stringify(logs));
    } catch (e) {
        console.warn('LocalStorage access failed in logChange:', e);
    }
}


// Project Number Management
function generateProjectNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}-${month}`;

    try {
        // Get stored data
        const storedData = localStorage.getItem('projectCounter');
        let counterData = storedData ? JSON.parse(storedData) : { yearMonth: '', counter: 0 };

        // Reset counter if month changed
        if (counterData.yearMonth !== yearMonth) {
            counterData = { yearMonth: yearMonth, counter: 1 };
        } else {
            counterData.counter += 1;
        }

        // Save updated counter
        localStorage.setItem('projectCounter', JSON.stringify(counterData));

        // Format: 2025-1101 (year-month-counter)
        return `${yearMonth}${String(counterData.counter).padStart(2, '0')}`;
    } catch (e) {
        console.warn('LocalStorage access failed in generateProjectNumber:', e);
        // Fallback: use timestamp
        return `${yearMonth}-${Date.now().toString().slice(-4)}`;
    }
}

function initializeProjectNumber() {
    const projectNumberInput = document.getElementById('projectNumber');
    if (projectNumberInput) {
        projectNumberInput.value = generateProjectNumber();
    }
}

// Initialize project number on page load
document.addEventListener('DOMContentLoaded', initializeProjectNumber);

// Function to reset to new project mode
function resetToNewProject() {
    // Clear form fields
    document.getElementById('customerName').value = '';
    document.getElementById('capacity').value = '';
    document.getElementById('carcassWeight').value = '';
    document.getElementById('travelDistance').value = '';
    document.getElementById('buffer').value = '';
    document.getElementById('speed').value = '';
    document.getElementById('suspension').value = '2:1';
    document.getElementById('cylinderCount').value = '2';

    // Clear results
    selectedCylinder = null;
    calculatedResults = [];
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('selectionSection').classList.add('hidden');

    // Generate new project number
    const projectNumber = generateProjectNumber();
    document.getElementById('projectNumber').value = projectNumber;

    // Show save button, hide update button
    // Show save button, hide update button
    document.getElementById('saveProjectBtn').classList.remove('hidden');
    document.getElementById('updateProjectBtn').classList.add('hidden');
}

// Project Save/Load Management
function saveProject() {
    const customerName = document.getElementById('customerName').value;
    if (!customerName) {
        alert('Lütfen müşteri adını girin!');
        return;
    }
    // Generate a new project number for each save (increment from last saved)
    const projectNumber = generateProjectNumber();
    document.getElementById('projectNumber').value = projectNumber;

    // Collect all form data
    const projectData = {
        projectNumber: projectNumber,
        customerName: customerName,
        savedDate: new Date().toISOString(),
        status: 'draft', // default status, will be set to production when user clicks "Üretime Al"
        selectedCylinder: selectedCylinder,
        inputs: {
            capacity: document.getElementById('capacity').value,
            carcassWeight: document.getElementById('carcassWeight').value,
            travelDistance: document.getElementById('travelDistance').value,
            buffer: Number(document.getElementById('buffer').value) || 300,
            speed: document.getElementById('speed').value,
            suspension: document.getElementById('suspension').value,
            cylinderCount: document.getElementById('cylinderCount').value,
            regulation: document.getElementById('regulation').value
        },
        // Store calculated results if available
        results: calculatedResults,
        // Store selected components if available
        components: {
            motor: document.getElementById('motorSelect') ? document.getElementById('motorSelect').value : null,
            pump: document.getElementById('pumpSelect') ? document.getElementById('pumpSelect').value : null,
            powerUnit: document.getElementById('powerUnitSelect') ? document.getElementById('powerUnitSelect').value : null,
            ruptureValve: document.getElementById('ruptureSelect') ? document.getElementById('ruptureSelect').value : null,
            mainValve: document.getElementById('mainValveSelect') ? document.getElementById('mainValveSelect').value : null,
            voltage: document.getElementById('voltageSelect') ? document.getElementById('voltageSelect').value : null,
            // Capture all checked accessories directly from data source
            allAccessories: accessories.filter(item => item.included).map(item => item.name),
            // Keep pressureSwitches for backward compatibility
            pressureSwitches: accessories.filter(item => item.included && item.category === 'Güvenlik' && item.name.includes('Şalteri')).map(item => item.name)
        }
    };

    // Get existing projects and add as new entry
    const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    projects.push(projectData);
    // Save to localStorage
    localStorage.setItem('savedProjects', JSON.stringify(projects));
    alert(`✅ Proje ${projectNumber} başarıyla kaydedildi!`);
    loadProjectsList();

    // Show update button, hide save button for future edits
    // Show update button, hide save button for future edits
    document.getElementById('saveProjectBtn').classList.add('hidden');
    document.getElementById('updateProjectBtn').classList.remove('hidden');
}

function updateProject() {
    const customerName = document.getElementById('customerName').value;
    const projectNumber = document.getElementById('projectNumber').value;

    if (!customerName) {
        alert('Lütfen müşteri adını girin!');
        return;
    }

    if (!projectNumber) {
        alert('Güncellenecek proje bulunamadı!');
        return;
    }

    // Find the existing project first to compare changes
    const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const index = projects.findIndex(p => p.projectNumber === projectNumber);

    if (index === -1) {
        alert('⚠️ Proje bulunamadı!');
        return;
    }

    const oldProject = projects[index];

    // Collect all form data (same as saveProject)
    const projectData = {
        projectNumber: projectNumber, // Keep the same project number
        customerName: customerName,
        savedDate: new Date().toISOString(),
        status: oldProject.status || 'draft', // Preserve status
        selectedCylinder: selectedCylinder,
        inputs: {
            capacity: document.getElementById('capacity').value,
            carcassWeight: document.getElementById('carcassWeight').value,
            travelDistance: document.getElementById('travelDistance').value,
            buffer: Number(document.getElementById('buffer').value) || 300,
            speed: document.getElementById('speed').value,
            suspension: document.getElementById('suspension').value,
            cylinderCount: document.getElementById('cylinderCount').value,
            regulation: document.getElementById('regulation').value
        },
        results: calculatedResults,
        components: {
            motor: document.getElementById('motorSelect') ? document.getElementById('motorSelect').value : null,
            pump: document.getElementById('pumpSelect') ? document.getElementById('pumpSelect').value : null,
            powerUnit: document.getElementById('powerUnitSelect') ? document.getElementById('powerUnitSelect').value : null,
            ruptureValve: document.getElementById('ruptureSelect') ? document.getElementById('ruptureSelect').value : null,
            mainValve: document.getElementById('mainValveSelect') ? document.getElementById('mainValveSelect').value : null,
            voltage: document.getElementById('voltageSelect') ? document.getElementById('voltageSelect').value : null,
            allAccessories: accessories.filter(item => item.included).map(item => item.name),
            pressureSwitches: accessories.filter(item => item.included && item.category === 'Güvenlik' && item.name.includes('Şalteri')).map(item => item.name)
        },
        revisions: oldProject.revisions || [] // Preserve existing revisions
    };

    // Detect changes and create revision entry
    const changes = [];
    const now = new Date().toISOString();

    // Helper to compare values
    const checkChange = (label, oldVal, newVal) => {
        if (oldVal != newVal) { // loose equality for string/number diffs
            changes.push(`${label}: ${oldVal || '-'} → ${newVal || '-'}`);
        }
    };

    // 1. Check Basic Info
    checkChange('Müşteri Adı', oldProject.customerName, projectData.customerName);

    // 2. Check Inputs
    const inputLabels = {
        capacity: 'Kapasite',
        carcassWeight: 'Karkas Ağırlığı',
        travelDistance: 'Seyir Mesafesi',
        buffer: 'Tampon Payı',
        speed: 'Hız',
        suspension: 'Askı Tipi',
        cylinderCount: 'Silindir Sayısı',
        regulation: 'Regülasyon'
    };

    for (const [key, label] of Object.entries(inputLabels)) {
        checkChange(label, oldProject.inputs?.[key], projectData.inputs[key]);
    }

    // 3. Check Components
    const componentLabels = {
        motor: 'Motor',
        pump: 'Pompa',
        powerUnit: 'Güç Ünitesi',
        ruptureValve: 'Patlak Hortum Valfi',
        mainValve: 'Ana Valf',
        voltage: 'Voltaj'
    };

    for (const [key, label] of Object.entries(componentLabels)) {
        checkChange(label, oldProject.components?.[key], projectData.components[key]);
    }

    // 4. Check Selected Cylinder
    checkChange('Seçilen Silindir', oldProject.selectedCylinder, projectData.selectedCylinder);

    // 5. Check Accessories
    const oldAcc = oldProject.components?.allAccessories || [];
    const newAcc = projectData.components.allAccessories || [];

    // Find added
    const addedAcc = newAcc.filter(x => !oldAcc.includes(x));
    if (addedAcc.length > 0) {
        changes.push(`Eklenen Aksesuarlar: ${addedAcc.join(', ')}`);
    }

    // Find removed
    const removedAcc = oldAcc.filter(x => !newAcc.includes(x));
    if (removedAcc.length > 0) {
        changes.push(`Çıkarılan Aksesuarlar: ${removedAcc.join(', ')}`);
    }

    // If there are changes, add a revision entry
    if (changes.length > 0) {
        projectData.revisions.push({
            date: now,
            changes: changes,
            revisionNumber: (projectData.revisions.length + 1)
        });
    }

    // Update the project
    projects[index] = projectData;
    localStorage.setItem('savedProjects', JSON.stringify(projects));

    if (changes.length > 0) {
        alert(`✅ Proje ${projectNumber} güncellendi!\n\n📝 Değişiklikler (Rev. ${projectData.revisions.length}):\n${changes.join('\n')}`);
    } else {
        alert(`✅ Proje ${projectNumber} kaydedildi (değişiklik yok).`);
    }

    loadProjectsList();
}

function loadProject(projectNumber) {
    const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const project = projects.find(p => p.projectNumber === projectNumber);

    if (!project) {
        alert('Proje bulunamadı!');
        return;
    }

    // Load form data
    document.getElementById('customerName').value = project.customerName;
    document.getElementById('projectNumber').value = project.projectNumber;
    document.getElementById('capacity').value = project.inputs.capacity;
    document.getElementById('carcassWeight').value = project.inputs.carcassWeight;
    document.getElementById('travelDistance').value = project.inputs.travelDistance;
    document.getElementById('buffer').value = project.inputs.buffer || 300;
    document.getElementById('speed').value = project.inputs.speed;
    document.getElementById('suspension').value = project.inputs.suspension;
    document.getElementById('cylinderCount').value = project.inputs.cylinderCount;
    document.getElementById('regulation').value = project.inputs.regulation;

    // Restore results if available
    if (project.results && project.results.length > 0) {
        calculatedResults = project.results;
        renderResults(calculatedResults);
    }

    // Restore selected cylinder if saved
    if (project.selectedCylinder) {
        selectedCylinder = project.selectedCylinder;
        // Highlight the selected cylinder in the results table
        selectCylinder(selectedCylinder);

        // Restore components if available and if selectCylinder successfully rendered the selection section
        if (project.components && document.getElementById('selectionSection')) {
            setTimeout(() => {
                if (project.components.motor) document.getElementById('motorSelect').value = project.components.motor;
                if (project.components.pump) document.getElementById('pumpSelect').value = project.components.pump;
                if (project.components.powerUnit) document.getElementById('powerUnitSelect').value = project.components.powerUnit;
                if (project.components.ruptureValve) document.getElementById('ruptureSelect').value = project.components.ruptureValve;
                if (project.components.mainValve) document.getElementById('mainValveSelect').value = project.components.mainValve;
                if (project.components.voltage) document.getElementById('voltageSelect').value = project.components.voltage;

                // Trigger updates to refresh displays
                if (window.updateMotorDetails) window.updateMotorDetails();
                if (window.updatePowerUnitInfo) window.updatePowerUnitInfo();

                // Restore accessories checkboxes
                if (project.components.allAccessories && Array.isArray(project.components.allAccessories)) {
                    accessories.forEach((acc, index) => {
                        const checkbox = document.getElementById(`acc_${index}`);
                        if (checkbox) {
                            const isIncluded = project.components.allAccessories.includes(acc.name);
                            checkbox.checked = isIncluded;
                            updateAccessoryStatus(index);
                        }
                    });
                } else if (project.components.pressureSwitches || project.pressureSwitches) {
                    // Fallback for legacy projects: restore from pressureSwitches
                    const switches = project.components.pressureSwitches || project.pressureSwitches || [];
                    accessories.forEach((acc, index) => {
                        const checkbox = document.getElementById(`acc_${index}`);
                        if (checkbox) {
                            // Check if this accessory is in the switches list
                            const isIncluded = switches.includes(acc.name);
                            checkbox.checked = isIncluded;
                            updateAccessoryStatus(index);
                        }
                    });
                }
            }, 100);
        }
    }

    // Show update button, hide save button since we're editing an existing project
    // Show update button, hide save button since we're editing an existing project
    document.getElementById('saveProjectBtn').classList.add('hidden');
    document.getElementById('updateProjectBtn').classList.remove('hidden');

    closeSidebar();
    alert(`✅ Proje ${projectNumber} yüklendi!`);
}

function deleteProject(projectNumber) {
    if (!confirm(`Proje ${projectNumber} silinecek. Emin misiniz?`)) {
        return;
    }

    const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const filtered = projects.filter(p => p.projectNumber !== projectNumber);
    localStorage.setItem('savedProjects', JSON.stringify(filtered));

    loadProjectsList();
    alert(`🗑️ Proje ${projectNumber} silindi.`);
}

function loadProjectsList() {
    const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const projectsList = document.getElementById('projectsList');

    if (projects.length === 0) {
        projectsList.innerHTML = `
            <div class="empty-projects">
                <div class="empty-projects-icon">📂</div>
                <p>Henüz kayıtlı proje yok</p>
            </div>
        `;
        return;
    }

    // Sort by date (newest first)
    projects.sort((a, b) => new Date(b.savedDate) - new Date(a.savedDate));

    projectsList.innerHTML = projects.map(project => {
        const date = new Date(project.savedDate);
        const dateStr = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const isProduction = project.status === 'production';

        return `
            <div class="project-item">
                <div class="project-item-header">
                    <span class="project-number">${project.projectNumber}</span>
                    <span class="project-date">${dateStr} ${timeStr}</span>
                </div>
                <div class="project-customer">${project.customerName}</div>
                <div class="project-details">
                    <span>Kapasite: ${project.inputs.capacity} kg</span>
                    <span>Hız: ${project.inputs.speed} m/s</span>
                    <span>Silindir: ${project.inputs.cylinderCount}</span>
                </div>
                <div class="project-actions">
                    <button class="project-action-btn log-btn" onclick="showProjectLog('${project.projectNumber}')">🕒 Log</button>
                    <button class="project-action-btn load-btn" onclick="loadProject('${project.projectNumber}')">📂 Yükle</button>
                    <button class="project-action-btn delete-btn" onclick="deleteProject('${project.projectNumber}')">🗑️ Sil</button>
                    ${!isProduction ? `<button class="project-action-btn production-btn" onclick="moveToProduction('${project.projectNumber}')">🚚 Üretime Al</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function moveToProduction(projectNumber) {
    const projects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const idx = projects.findIndex(p => p.projectNumber === projectNumber);
    if (idx === -1) {
        alert('Proje bulunamadı!');
        return;
    }

    // Update project status
    projects[idx].status = 'production';

    localStorage.setItem('savedProjects', JSON.stringify(projects));
    loadProjectsList();
    alert(`✅ Proje ${projectNumber} üretime alındı!`);
}

function openSidebar() {
    document.getElementById('projectsSidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('active');
    loadProjectsList();
}

function closeSidebar() {
    document.getElementById('projectsSidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

// Export/Import Functions
// Export/Import Functions Removed

// Export/Import and Google Sheets functions removed

document.getElementById('calculateBtn').addEventListener('click', calculate);
document.getElementById('openProductionBtn').addEventListener('click', () => {
    window.location.href = 'production.html';
});

function calculate() {
    // 1. Get Inputs
    const capacity = parseFloat(document.getElementById('capacity').value);
    const carcassWeight = parseFloat(document.getElementById('carcassWeight').value);
    const travelDistance = parseFloat(document.getElementById('travelDistance').value);
    const buffer = parseFloat(document.getElementById('buffer').value);
    const speed = parseFloat(document.getElementById('speed').value);
    const suspension = document.getElementById('suspension').value;
    const cylinderCount = parseInt(document.getElementById('cylinderCount').value);
    const regulation = document.getElementById('regulation').value;

    // Validation
    if (isNaN(capacity) || isNaN(carcassWeight) || isNaN(travelDistance) || isNaN(speed) || isNaN(buffer)) {
        alert("Lütfen tüm alanları doldurunuz.");
        return;
    }

    // 2. Constants & Derived Values
    // Buffer is already read above
    let stroke; // H13
    if (suspension === '1:1') {
        stroke = travelDistance + buffer;
    } else {
        stroke = (travelDistance + buffer) / 2;
    }

    const extraWeight = 100; // C11
    const gravity = 9.81;

    // 3. Iterate Cylinders
    const results = [];

    cylinderSizes.forEach(cyl => {
        const D = cyl.d; // H21
        const t = cyl.t; // H22

        // Skip invalid thickness
        if (t <= 0) return;

        // Calculate Ram Weight (C10)
        // Formula: (((H21-H22)*H22)/40.55)*H13/1000
        const ramWeight = (((D - t) * t) / 40.55) * (stroke / 1000);

        // Calculate Area (mm^2)
        // Formula: POWER(H21,2)*3.14*0.25
        const area = Math.pow(D, 2) * 3.14 * 0.25;

        // Calculate Forces (kg)
        // Force = (Weight * Factor / Cylinders) + RamWeight + Extra
        // Factor: 2 for 2:1 (Wait, formula was C9*2/C12).
        // If 2:1, Weight is multiplied by 2?
        // Let's re-read formula: IF(C13='2:1', ((C9*2/C12)+...), ...)
        // Yes, for 2:1, the weight term is Weight * 2 / Cylinders.
        // For 1:1, the weight term is Weight * 1 / Cylinders.

        const suspensionFactor = (suspension === '2:1') ? 2 : 1;

        const emptyWeightTerm = (carcassWeight * suspensionFactor) / cylinderCount;
        const fullWeightTerm = ((capacity + carcassWeight) * suspensionFactor) / cylinderCount;

        const forceEmpty = emptyWeightTerm + ramWeight + extraWeight;
        const forceFull = fullWeightTerm + ramWeight + extraWeight;

        // Calculate Pressures (Bar)
        // Pressure = Force * 9.81 * 10 / Area
        const pressureEmpty = (forceEmpty * gravity * 10) / area;
        const pressureFull = (forceFull * gravity * 10) / area;

        // --- Buckling Calculation ---
        // 1. Slenderness Ratio (Lambda)
        const d_inner = D - 2 * t;
        const inertia = (Math.PI * (Math.pow(D, 4) - Math.pow(d_inner, 4))) / 64;
        const radiusOfGyration = Math.sqrt(inertia / area);
        const lambda = stroke / radiusOfGyration;

        // 2. Critical Force (F_crit) - H29
        const E = 210000; // Elasticity Modulus
        const Rp02 = 355; // Yield Strength
        let f_crit;

        if (lambda >= 100) {
            // Euler Case
            // Formula: (PI^2 * E * I) / (2 * L^2)
            f_crit = (Math.pow(Math.PI, 2) * E * inertia) / (2 * Math.pow(stroke, 2));
        } else {
            // Tetmajer/Plastic Case
            // Formula: (Area / 2) * (Rp02 - (Rp02 - 210) * (Lambda / 100)^2)
            f_crit = (area / 2) * (Rp02 - (Rp02 - 210) * Math.pow(lambda / 100, 2));
        }

        // 3. Acting Buckling Force (F_acting) - H30
        // Formula: 1.4 * 9.81 * (LoadTerm + 0.64 * (RamWeight + Extra))
        // LoadTerm is full load (Capacity + Carcass)
        // Note: In H30 formula: 2 * ((C9+C8)/C12) for 2:1. 
        // My fullWeightTerm is ((C9+C8) * 2) / C12. It matches.

        const ramTotalWeight = ramWeight + extraWeight;
        const f_acting = 1.4 * 9.81 * (fullWeightTerm + 0.64 * ramTotalWeight);

        // 4. Buckling Check
        const isBucklingSafe = f_crit >= f_acting;
        const utilization = (f_acting / f_crit) * 100;

        // Check Constraints
        // Empty >= 12, Full <= 59, Buckling Safe
        const isValid = pressureEmpty >= 12 && pressureFull <= 59 && isBucklingSafe;

        results.push({
            type: `${D}x${t}`,
            d: D,
            t: t,
            pressureEmpty: pressureEmpty.toFixed(1),
            pressureFull: pressureFull.toFixed(1),
            bucklingSafe: isBucklingSafe,
            lambda: lambda.toFixed(1),
            f_crit: f_crit.toFixed(0),
            f_acting: f_acting.toFixed(0),
            utilization: utilization.toFixed(1),
            valid: isValid
        });
    });

    // 4. Render Results
    calculatedResults = results;
    renderResults(results);
}

function renderResults(results) {
    const tbody = document.querySelector('#cylinderTable tbody');
    tbody.innerHTML = '';

    // Filter to show only valid cylinders
    const validResults = results.filter(res => res.valid);

    // If no valid results, show a message
    if (validResults.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 20px; color: #f87171;">
                    ⚠️ Girilen parametreler için uygun silindir bulunamadı. Lütfen parametreleri kontrol edin.
                </td>
            </tr>
        `;
        document.getElementById('resultsSection').classList.remove('hidden');
        return;
    }

    // Sort: by diameter
    validResults.sort((a, b) => a.d - b.d);

    validResults.forEach(res => {
        const tr = document.createElement('tr');
        const statusClass = res.valid ? 'success' : 'error';
        const statusText = res.valid ? 'Uygun' : 'Uygun Değil';
        const bucklingClass = res.bucklingSafe ? 'success' : 'error';
        const bucklingText = res.bucklingSafe ? 'OK' : 'Riskli';

        const utilVal = parseFloat(res.utilization);
        let utilColor = 'var(--success-color)';
        if (utilVal > 80) utilColor = '#facc15'; // Yellow
        if (utilVal > 100) utilColor = 'var(--error-color)'; // Red

        const utilBar = `
            <div style="width: 100%; background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; margin-top: 5px;">
                <div style="width: ${Math.min(utilVal, 100)}%; background: ${utilColor}; height: 100%; border-radius: 3px;"></div>
            </div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 2px;">%${res.utilization}</div>
        `;

        tr.innerHTML = `
            <td>${res.type}</td>
            <td>${res.d}</td>
            <td>${res.t}</td>
            <td>${res.pressureEmpty}</td>
            <td>${res.pressureFull}</td>
            <td>${res.f_crit}</td>
            <td>${res.f_acting}</td>
            <td>${utilBar}</td>
            <td><span class="status-badge ${bucklingClass}">${bucklingText}</span></td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <button class="select-btn" onclick="selectCylinder('${res.type}')">Seç</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('resultsSection').classList.remove('hidden');

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// Global variable to keep track of selected cylinder type
let selectedCylinder = null;

function selectCylinder(type) {
    // Store selected cylinder type for saving
    selectedCylinder = type;
    const result = calculatedResults.find(r => r.type === type);
    if (!result) return;

    // Get Inputs again for calculation
    const speed = parseFloat(document.getElementById('speed').value);
    const cylinderCount = parseInt(document.getElementById('cylinderCount').value);
    const suspension = document.getElementById('suspension').value;
    const suspensionFactor = (suspension === '2:1') ? 2 : 1;

    // 1. Calculate Required Flow (L/min)
    // Formula: Speed (m/s) * Area (mm2) * 60 / 1000 * Cylinders / Factor
    // Area = PI * D^2 / 4
    const area = Math.pow(result.d, 2) * Math.PI * 0.25;
    const q_req = (speed * area * 60 * cylinderCount) / (suspensionFactor * 1000);

    // 2. Select Pump
    // Find first pump with flow >= q_req
    // Actually, Excel uses VLOOKUP with TRUE (approximate match) or FALSE?
    // Excel formula was VLOOKUP(..., FALSE), but it looked up the *Calculated Flow*?
    // No, it looked up C34 (Actual Flow). 
    // Let's assume we pick the closest larger pump.
    let selectedPump = pumps.find(p => p.flow >= q_req);
    if (!selectedPump) selectedPump = pumps[pumps.length - 1]; // Max pump if none found

    const q_actual = selectedPump.flow;

    // 3. Calculate Effective Speed
    // Speed = Q * Factor * 1000 / (Area * 60 * Cylinders)
    const speed_eff = (q_actual * suspensionFactor * 1000) / (area * 60 * cylinderCount);

    // 4. Calculate Required Power (kW)
    // Formula: Q (L/min) * MaxPressure (Bar) * 1.3 / 600
    // MaxPressure is result.pressureFull (Dynamic pressure usually higher, but let's use Full Pressure for now or add margin)
    // Excel used H26 (Max Dynamic Pressure).
    // H26 = H25 (Max Static) + L46 (Pressure Drop).
    // Let's use result.pressureFull * 1.15 (approx dynamic factor) or just use pressureFull for estimation.
    // Excel: C36 = C34 * H26 * 1.3 / 600.
    // Let's use pressureFull as a base.
    const p_req = (q_actual * parseFloat(result.pressureFull) * 1.3) / 600;

    // 5. Select Motor
    let selectedMotor = motors.find(m => m.kw >= p_req);
    if (!selectedMotor) selectedMotor = motors[pumps.length - 1];

    // 6. Valve Selection
    // Determine Main Valve Options based on Pump Flow (q_actual)
    // q_actual is already defined above
    let recommendedMainValve = "";

    // Define all possible main valves for the dropdown
    // We will mark the recommended one.

    if (q_actual <= 75) {
        // Range 0-75: Default to 0,75'' EV100
        recommendedMainValve = "0,75'' EV100";
    } else if (q_actual <= 122) {
        recommendedMainValve = "0,75'' EV100";
    } else if (q_actual <= 400) {
        recommendedMainValve = "1,5'' EV100";
    } else {
        recommendedMainValve = "1,5'' EV100";
    }

    // Determine Rupture Valve Size (R10)
    // Using previous logic based on max flow per cylinder
    const maxSpeed = speed + 0.3;
    const maxFlowPerCylinder = (maxSpeed * area * 60) / (suspensionFactor * 1000);

    let ruptureSize = "Aralık Dışında";
    if (maxFlowPerCylinder <= 55) ruptureSize = "0.5\"";
    else if (maxFlowPerCylinder <= 100) ruptureSize = "0.75\"";
    else if (maxFlowPerCylinder <= 165) ruptureSize = "1.0\"";
    else if (maxFlowPerCylinder <= 400) ruptureSize = "1.5\"";
    else if (maxFlowPerCylinder <= 1200) ruptureSize = "2.0\"";

    // Format valve name to match burstHoseValves
    const needsDK = cylinderCount >= 2;
    let recommendedValveObj = burstHoseValves.find(v => v.size === ruptureSize && v.hasDK === needsDK);

    // Fallback: If 0.5" needed but no DK version exists (common case), upgrade to 0.75" DK
    if (!recommendedValveObj && needsDK && ruptureSize === "0.5\"") {
        recommendedValveObj = burstHoseValves.find(v => v.size === "0.75\"" && v.hasDK === true);
    }

    let recommendedRuptureValve = recommendedValveObj ? recommendedValveObj.name : "Yok";

    // 7. Calculate Required Oil Volume
    // Approximate: Oil volume ≈ (D^2 * π / 4) * stroke * cylinders / 1000 * 1.5
    const travelDistance = parseFloat(document.getElementById('travelDistance').value);
    const stroke = travelDistance / 1000; // Convert mm to meters
    const cylinderVolume = (Math.pow(result.d, 2) * Math.PI * 0.25 * stroke * cylinderCount) / 1000; // Liters
    const requiredOilVolume = cylinderVolume * 1.5; // Add 50% for safety/reserve

    // 8. Power Unit Selection
    // Find suitable power units based ONLY on tank capacity
    const pumpFlow = selectedPump.flow;
    const motorPower = selectedMotor.kw;

    const suitablePowerUnits = powerUnits.filter(unit => {
        return unit.tankCapacity >= requiredOilVolume; // Only check tank capacity
    });

    // Recommend the first suitable unit (smallest)
    const recommendedPowerUnit = suitablePowerUnits.length > 0 ? suitablePowerUnits[0].model : "Uygun Ünite Bulunamadı";

    // Render Selection with Dropdowns
    renderSelection(result, q_req, selectedPump, speed_eff, p_req, selectedMotor, recommendedRuptureValve, recommendedMainValve, recommendedPowerUnit, suitablePowerUnits, requiredOilVolume, pumpFlow, motorPower);
}

function renderSelection(cylinder, q_req, recommendedPump, speed_eff, p_req, recommendedMotor, recommendedRuptureValve, recommendedMainValve, recommendedPowerUnit, suitablePowerUnits, requiredOilVolume, pumpFlow, motorPower) {
    const selectionDiv = document.getElementById('selectionSection');
    if (!selectionDiv) {
        const main = document.querySelector('main');
        const section = document.createElement('section');
        section.id = 'selectionSection';
        section.className = 'glass-panel hidden';
        section.innerHTML = `
            <h2><span class="icon">⚡</span> Pompa, Motor ve Valf Seçimi</h2>
            <div id="selectionContent"></div>
        `;
        main.appendChild(section);
    }

    // Generate Options for Pump
    const pumpOptions = pumps.map(p => {
        const isSelected = p.name === recommendedPump.name ? 'selected' : '';
        const isRecommended = p.name === recommendedPump.name ? ' (Önerilen)' : '';
        return `<option value="${p.name}" ${isSelected}>${p.name} - ${p.flow} L/min${isRecommended}</option>`;
    }).join('');

    // Generate Options for Motor
    const motorOptions = motors.map(m => {
        const isSelected = m.name === recommendedMotor.name ? 'selected' : '';
        const isRecommended = m.name === recommendedMotor.name ? ' (Önerilen)' : '';
        const isSufficient = m.kw >= p_req;
        const style = isSufficient ? '' : 'color: #f87171;';
        const warning = isSufficient ? '' : ' (Yetersiz Güç)';
        return `<option value="${m.name}" style="${style}" ${isSelected}>${m.name} - ${m.kw} kW${isRecommended}${warning}</option>`;
    }).join('');

    // Generate Options for Rupture Valve (R10)
    // Get cylinder count from inputs
    const currentCylinderCount = parseInt(document.getElementById('cylinderCount').value) || 1;
    const needsDK = currentCylinderCount >= 2;

    // Filter suitable valves from data.js
    // If needsDK is true, we only show valves with hasDK=true.
    // If needsDK is false, we only show valves with hasDK=false.
    const suitableValves = burstHoseValves.filter(v => v.hasDK === needsDK);

    // Add "Yok" option first
    let ruptureOptions = '<option value="Yok">Yok (İstemiyorum)</option>';

    // Add valve options from data
    ruptureOptions += suitableValves.map(v => {
        const isSelected = v.name === recommendedRuptureValve ? 'selected' : '';
        const isRecommended = v.name === recommendedRuptureValve ? ' (Önerilen)' : '';
        return `<option value="${v.name}" ${isSelected}>${v.name}${isRecommended}</option>`;
    }).join('');

    // Generate Options for Main Valve
    const allMainValves = [
        "0,5'' GV", "0,5'' KV1P", "0,5'' KV1S", "0,5'' KV2P", "0,5'' KV2S",
        "0,75'' EVD", "0,75'' EV100", "1,5'' EV100"
    ];

    const mainValveOptions = allMainValves.map(val => {
        const isSelected = val === recommendedMainValve ? 'selected' : '';
        const isRecommended = val === recommendedMainValve ? ' (Önerilen)' : '';
        return `<option value="${val}" ${isSelected}>${val}${isRecommended}</option>`;
    }).join('');

    // Generate Options for Power Unit
    // Show all power units with tank capacity info
    // pumpFlow and motorPower are now passed as parameters

    const powerUnitOptions = powerUnits.map(unit => {
        const tankOk = unit.tankCapacity >= requiredOilVolume;

        const isSuitable = tankOk;
        const isSelected = unit.model === recommendedPowerUnit ? 'selected' : '';
        const isRecommended = unit.model === recommendedPowerUnit ? ' (Önerilen)' : '';
        const suitableText = isSuitable && unit.model !== recommendedPowerUnit ? ' ✓' : '';

        // Tank capacity warning
        const unsuitable = !tankOk ? ' ⚠️ Yetersiz Tank' : '';

        const tankInfo = ` [${unit.tankCapacity}L]`;
        return `<option value="${unit.model}" ${isSelected}>${unit.model}${tankInfo}${isRecommended}${suitableText}${unsuitable}</option>`;
    }).join('');

    // Voltage Options
    const voltageOptions = `
        <option value="380">380V Üçgen/Yıldız</option>
        ${recommendedMotor.current220 ? '<option value="220">220V Üçgen</option>' : ''}
    `;

    // Get cylinder count
    const cylinderCount = parseInt(document.getElementById('cylinderCount').value) || 2;

    // Initial Motor Details Calculation (Default 380V)
    const vVal = 400;
    const nominalCurrent = (1.5 * recommendedMotor.kw * 1000) / (1.732 * vVal * 0.79);

    let starCurrent = 0;
    let deltaCurrent = 0;
    if (recommendedMotor.current380) {
        starCurrent = recommendedMotor.current380.star;
        deltaCurrent = recommendedMotor.current380.delta;
    }

    const content = document.getElementById('selectionContent');
    content.innerHTML = `
        <div class="form-grid">
            <div class="status-item">
                <span class="label">Seçilen Silindir</span>
                <span class="value">${cylinder.type}</span>
            </div>
             <div class="status-item">
                <span class="label">Efektif Hız</span>
                <span class="value" id="effectiveSpeedDisplay">${speed_eff.toFixed(3)} m/s</span>
            </div>
        </div>
        
        <!-- Two-Piece Cylinder Option -->
        <div style="margin: 20px 0; padding: 15px; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 8px;">
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; color: #fbbf24; font-weight: 600;">
                <input type="checkbox" id="twoPieceCylinder" onchange="updateCylinderPricing()" 
                       style="width: 20px; height: 20px; cursor: pointer;">
                <span>İki Parça Silindir (Ekli)</span>
            </label>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 8px; margin-left: 32px;">
                ⚠️ Uzun stroklar için iki parça silindir kullanılır. Bu seçenek ek maliyet getirir.
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
            <!-- Pump Selection -->
            <div class="glass-panel" style="margin:0; padding: 20px; background: rgba(0,0,0,0.2);">
                <h3 style="margin-bottom: 15px; color: #38bdf8;">Pompa Seçimi</h3>
                <div class="status-item" style="margin-bottom: 10px;">
                    <span class="label">Hesaplanan Debi</span>
                    <span class="value" style="font-size: 1rem;">${q_req.toFixed(1)} L/min</span>
                </div>
                <div class="input-group">
                    <label for="pumpSelect">Pompa Seçin</label>
                    <select id="pumpSelect" onchange="updateCalculations('${cylinder.type}')">
                        ${pumpOptions}
                    </select>
                </div>
            </div>

            <!-- Motor Selection -->
            <div class="glass-panel" style="margin:0; padding: 20px; background: rgba(0,0,0,0.2);">
                <h3 style="margin-bottom: 15px; color: #818cf8;">Motor Seçimi</h3>
                <div class="status-item" style="margin-bottom: 10px;">
                    <span class="label">Hesaplanan Güç</span>
                    <span class="value" style="font-size: 1rem;" id="reqPowerDisplay">${p_req.toFixed(1)} kW</span>
                </div>
                <div class="input-group" style="margin-bottom: 10px;">
                    <label for="motorSelect">Motor Seçin</label>
                    <select id="motorSelect" onchange="updateMotorDetails()">
                        ${motorOptions}
                    </select>
                </div>
                <div class="input-group" style="margin-bottom: 10px;">
                    <label for="voltageSelect">Çalışma Voltajı</label>
                    <select id="voltageSelect" onchange="updateMotorDetails()">
                        ${voltageOptions}
                    </select>
                </div>
                <div id="motorDetails" style="font-size: 0.8rem; color: #94a3b8; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>Model: <span style="color: white;" id="motorModelDisplay">${recommendedMotor.name}</span></div>
                        <div>Güç: <span style="color: white;" id="motorPowerDisplay">${recommendedMotor.kw} kW</span></div>
                        <div>Nominal Akım: <span style="color: #fbbf24;">${nominalCurrent.toFixed(1)} A</span></div>
                        <div>Yıldız Akım: <span style="color: #fbbf24;">${starCurrent} A</span></div>
                        <div>Üçgen Akım: <span style="color: #fbbf24;">${deltaCurrent} A</span></div>
                    </div>
                </div>
            </div>

            <!-- Valve Selection -->
            <div class="glass-panel" style="margin:0; padding: 20px; background: rgba(0,0,0,0.2);">
                <h3 style="margin-bottom: 15px; color: #4ade80;">Valf Seçimi (Blain)</h3>
                <div class="input-group" style="margin-bottom: 15px;">
                    <label for="ruptureSelect">Patlak Hortum Valfi</label>
                    <select id="ruptureSelect" onchange="updateCylinderPricing()">
                        ${ruptureOptions}
                    </select>
                </div>
                <div class="input-group">
                    <label for="mainValveSelect">Ana Kontrol Valfi</label>
                    <select id="mainValveSelect" onchange="updateCylinderPricing()">
                        ${mainValveOptions}
                    </select>
                </div>
            </div>

            <!-- Power Unit Selection -->
            <div class="glass-panel" style="margin:0; padding: 20px; background: rgba(0,0,0,0.2);">
                <h3 style="margin-bottom: 15px; color: #f59e0b;">Güç Ünitesi</h3>
                <div class="input-group">
                    <label for="powerUnitSelect">Ünite Modeli</label>
                    <select id="powerUnitSelect" onchange="updatePowerUnitInfo()">
                        ${powerUnitOptions}
                    </select>
                </div>
                <div id="powerUnitInfo" style="font-size: 0.8rem; color: #94a3b8; margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="margin-bottom: 5px;">Gerekli Yağ: <span style="color: #fbbf24;">${requiredOilVolume.toFixed(1)} L</span></div>
                    <div style="margin-bottom: 5px;">Toplam Yağ: <span style="color: #4ade80;" id="totalOilDisplay">${powerUnits.find(u => u.model === recommendedPowerUnit)?.totalOil.toFixed(1) || '-'} L</span></div>
                    <div style="margin-bottom: 5px;">Ölü Bölge: <span style="color: #94a3b8;" id="deadZoneDisplay">${powerUnits.find(u => u.model === recommendedPowerUnit)?.deadZone || '-'} L</span></div>
                    <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <div style="margin-top: 5px;">Boyutlar: <span style="color: #94a3b8;" id="dimensionsDisplay">${powerUnits.find(u => u.model === recommendedPowerUnit)?.length || '-'} × ${powerUnits.find(u => u.model === recommendedPowerUnit)?.width || '-'} × ${powerUnits.find(u => u.model === recommendedPowerUnit)?.height || '-'} mm</span></div>
                    </div>
                    <div style="margin-bottom: 5px;">Pompa: <span style="color: #38bdf8;">${recommendedPump.name}</span></div>
                    <div style="margin-bottom: 5px;">Motor: <span style="color: #818cf8;">${recommendedMotor.name}</span></div>
                    <div>Debi: <span style="color: #fbbf24;">${recommendedPump.flow} L/min</span></div>
                </div>
            </div>
        </div>

        <!-- Hose Configuration Section -->
        <div style="margin-top: 15px;">
            <div class="glass-panel" style="padding: 15px; background: rgba(0,0,0,0.2);">
                <h3 style="margin-bottom: 12px; color: #fbbf24; font-size: 1.1rem;">
                    <span style="font-size: 1.2rem;">🔗</span> Hortum Konfigürasyonu
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                    <!-- Main Hose -->
                    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 6px;">
                        <h4 style="color: #fbbf24; margin-bottom: 8px; font-size: 0.85rem;">Ana Hortum</h4>
                        <div class="input-group" style="margin-bottom: 8px;">
                            <label for="mainHoseDiameter" style="font-size: 0.75rem;">Çap (Önerilen: ${recommendHoseDiameter(pumpFlow)})</label>
                            <select id="mainHoseDiameter" onchange="updateHoseCost()" style="padding: 8px; font-size: 0.9rem;">
                                ${Object.keys(hosePricing).map(diameter => {
        const recommended = diameter === recommendHoseDiameter(pumpFlow);
        return `<option value="${diameter}" ${recommended ? 'selected' : ''}>${diameter}${recommended ? ' (Önerilen)' : ''}</option>`;
    }).join('')}
                            </select>
                        </div>
                        <div class="input-group">
                            <label for="mainHoseLength" style="font-size: 0.75rem;">Uzunluk (m)</label>
                            <input type="number" id="mainHoseLength" value="6" min="1" max="50" step="0.5" onchange="updateHoseCost()" style="padding: 8px; font-size: 0.9rem;">
                        </div>
                    </div>

                    <!-- Cylinder Hose (only for multiple cylinders) -->
                    ${cylinderCount > 1 ? `
                    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 6px;">
                        <h4 style="color: #fbbf24; margin-bottom: 8px; font-size: 0.85rem;">Silindir Hortumu (x${cylinderCount})</h4>
                        <div class="input-group" style="margin-bottom: 8px;">
                            <label for="cylinderHoseDiameter" style="font-size: 0.75rem;">Çap (Önerilen: ${recommendHoseDiameter(pumpFlow / cylinderCount)})</label>
                            <select id="cylinderHoseDiameter" onchange="updateHoseCost()" style="padding: 8px; font-size: 0.9rem;">
                                ${Object.keys(hosePricing).map(diameter => {
        const recommended = diameter === recommendHoseDiameter(pumpFlow / cylinderCount);
        return `<option value="${diameter}" ${recommended ? 'selected' : ''}>${diameter}${recommended ? ' (Önerilen)' : ''}</option>`;
    }).join('')}
                            </select>
                        </div>
                        <div class="input-group">
                            <label for="cylinderHoseLength" style="font-size: 0.75rem;">Uzunluk (m/silindir)</label>
                            <input type="number" id="cylinderHoseLength" value="2" min="0.5" max="20" step="0.5" onchange="updateHoseCost()" style="padding: 8px; font-size: 0.9rem;">
                        </div>
                    </div>
                    ` : ''}

                    <!-- Hose Cost Display -->
                    <!-- Hose Cost Display -->
                    <div style="background: rgba(251, 191, 36, 0.1); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(251, 191, 36, 0.2); display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #fbbf24; font-size: 0.8rem; font-weight: 600;">Hortum Maliyeti:</span>
                        <span id="hoseCostDisplay" style="font-size: 0.9rem; color: #fbbf24; font-weight: 700;">- €</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Accessories Section -->
        <div style="margin-top: 30px;">
            <div class="glass-panel" style="padding: 25px; background: rgba(0,0,0,0.2);">
                <h3 style="margin-bottom: 20px; color: #a78bfa;">
                    <span style="font-size: 1.5rem;">🔧</span> Aksesuarlar
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
                    ${accessories.map((acc, index) => `
                        <div style="display: flex; align-items: center; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                            <input type="checkbox" id="acc_${index}" ${acc.included ? 'checked' : ''} 
                                   onchange="updateAccessoryStatus(${index})"
                                   style="margin-right: 12px; width: 18px; height: 18px; cursor: pointer;">
                            <label for="acc_${index}" style="cursor: pointer; flex: 1; font-size: 0.9rem; color: #e2e8f0;">
                                ${acc.name}
                                <span style="display: block; font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">${acc.category}</span>
                            </label>
                            <span id="acc_status_${index}" style="font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; ${acc.included ? 'background: rgba(74, 222, 128, 0.2); color: #4ade80;' : 'background: rgba(248, 113, 113, 0.2); color: #f87171;'}">
                                ${acc.included ? 'Dahil' : 'Dahil Değildir'}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Environment & Heat Calculation Section -->
        <div class="print-only" style="margin-top: 20px;">
            <div class="glass-panel" style="padding: 18px; background: rgba(0,0,0,0.2);">
                <h3 style="margin-bottom: 15px; color: #fb923c; font-size: 0.95rem;">
                    <span style="font-size: 1.2rem;">🌡️</span> Ortam ve Sıcaklık Hesabı
                </h3>
                
                <!-- Environment Settings -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 15px;">
                    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 6px;">
                        <h4 style="color: #fbbf24; margin-bottom: 8px; font-size: 0.8rem;">Ortam Koşulları</h4>
                        <div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.6;">
                            <div>Max: <span style="color: #f87171;">25°C</span> | Min: <span style="color: #60a5fa;">20°C</span> | Ort: <span style="color: #4ade80;">23°C</span></div>
                            <div style="margin-top: 4px; font-size: 0.7rem; color: #94a3b8;">Bölge: Ortalama İklim</div>
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 6px;">
                        <h4 style="color: #fbbf24; margin-bottom: 8px; font-size: 0.8rem;">Yağ Özellikleri</h4>
                        <div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.6;">
                            <div>ISO VG 46 | 46 cST <span style="font-size: 0.65rem; color: #94a3b8;">(@40°C)</span></div>
                            <div style="margin-top: 4px;">Max Yağ: <span style="color: #f87171;">50°C</span></div>
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 6px;">
                        <h4 style="color: #fbbf24; margin-bottom: 8px; font-size: 0.8rem;">Çalışma Parametreleri</h4>
                        <div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.6;">
                            <div>Kalkış: 5/h | Yük: 100% | Sıklık: 100%</div>
                        </div>
                    </div>
                </div>

                <!-- Heat Calculation Results -->
                <div style="background: rgba(251, 146, 60, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(251, 146, 60, 0.3); margin-bottom: 12px;">
                    <h4 style="color: #fb923c; margin-bottom: 10px; font-size: 0.85rem;">📊 Isı Hesaplama</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
                        <div style="text-align: center; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px;">
                            <div style="font-size: 0.65rem; color: #94a3b8; margin-bottom: 2px;">Isı Üretimi</div>
                            <div style="font-size: 1rem; color: #fb923c; font-weight: 600;" id="heatProduction">- kW</div>
                        </div>
                        <div style="text-align: center; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px;">
                            <div style="font-size: 0.65rem; color: #94a3b8; margin-bottom: 2px;">Isı Kayıpları</div>
                            <div style="font-size: 1rem; color: #60a5fa; font-weight: 600;">1.23 kW</div>
                        </div>
                        <div style="text-align: center; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px;">
                            <div style="font-size: 0.65rem; color: #94a3b8; margin-bottom: 2px;">Soğutucu</div>
                            <div style="font-size: 1rem; color: #4ade80; font-weight: 600;">0.7 kW</div>
                        </div>
                        <div style="text-align: center; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px;">
                            <div style="font-size: 0.65rem; color: #94a3b8; margin-bottom: 2px;">Isınma</div>
                            <div style="font-size: 1rem; color: #fbbf24; font-weight: 600;">1 saat</div>
                        </div>
                    </div>
                    <div style="margin-top: 8px; font-size: 0.65rem; color: #94a3b8; text-align: center;">
                        ⚠️ Yeterli havalandırma gereklidir
                    </div>
                </div>

                <!-- Subsidence Calculation -->
                <div style="background: rgba(139, 92, 246, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.3);">
                    <h4 style="color: #a78bfa; margin-bottom: 10px; font-size: 0.85rem;">📏 Çökme Hesabı</h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <div>
                            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 4px;">Yağ Sıkışması</div>
                            <div style="background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; text-align: center;">
                                <div style="color: #f87171; font-size: 0.75rem;">Max: 1.68mm</div>
                                <div style="color: #60a5fa; font-size: 0.75rem;">Min: 0.77mm</div>
                                <div style="font-size: 0.6rem; color: #94a3b8; margin-top: 2px;">@28/13 bar</div>
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 4px;">Hortum Genleşme</div>
                            <div style="background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; text-align: center;">
                                <div style="color: #f87171; font-size: 0.75rem;">Max: 1.12mm</div>
                                <div style="color: #60a5fa; font-size: 0.75rem;">Min: 0.51mm</div>
                                <div style="font-size: 0.6rem; color: #94a3b8; margin-top: 2px;">@28/13 bar</div>
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 4px;">Toplam Çökme</div>
                            <div style="background: rgba(139, 92, 246, 0.2); padding: 6px; border-radius: 4px; text-align: center;">
                                <div style="color: #f87171; font-size: 0.75rem;">Max: 2.8mm</div>
                                <div style="color: #60a5fa; font-size: 0.75rem;">Min: 1.28mm</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cost Summary Section -->
        <div style="margin-top: 30px;">
            <div class="glass-panel" style="padding: 25px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%); border: 1px solid rgba(16, 185, 129, 0.3);">
                <h3 style="margin-bottom: 20px; color: #10b981; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.8rem;">💰</span> 
                    <span>Maliyet Özeti</span>
                </h3>
                <div id="costBreakdown" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <!-- Cost items will be populated by JavaScript -->
                </div>
                <div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center;">
                    <div style="font-size: 0.9rem; color: #6ee7b7; margin-bottom: 5px;">Tahmini Toplam Maliyet</div>
                    <div id="totalCost" style="font-size: 2.2rem; color: #10b981; font-weight: 700;">- €</div>
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 5px;">* KDV Hariç, tahmini fiyatlardır</div>
                </div>
            </div>
        </div>

        <!-- Enhanced Thermal Analysis Section -->
        <div class="print-only" style="margin-top: 30px;">
            <div class="glass-panel" style="padding: 25px; background: linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%); border: 1px solid rgba(251, 146, 60, 0.3);">
                <h3 style="margin-bottom: 20px; color: #fb923c; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.8rem;">🌡️</span> 
                    <span>Termal Analiz</span>
                </h3>
                <div id="thermalAnalysis" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 8px;">Isı Üretimi</div>
                        <div id="heatGeneration" style="font-size: 1.5rem; color: #fb923c; font-weight: 600;">- kJ/h</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 8px;">Saatlik Isınma</div>
                        <div id="tempRise" style="font-size: 1.5rem; color: #fbbf24; font-weight: 600;">- °C/h</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 8px;">Tahmini Yağ Sıcaklığı</div>
                        <div id="steadyTemp" style="font-size: 1.5rem; font-weight: 600;">- °C</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 8px;">Soğutucu Durumu</div>
                        <div id="coolerStatus" style="font-size: 1.1rem; font-weight: 600; margin-top: 5px;">-</div>
                    </div>
                </div>
                <div id="thermalRecommendation" style="margin-top: 15px; padding: 12px; border-radius: 6px; text-align: center; font-size: 0.9rem; font-weight: 600;">
                    <!-- Recommendation will be populated -->
                </div>
            </div>
        </div>
    `;

    document.getElementById('selectionSection').classList.remove('hidden');
    document.getElementById('selectionSection').scrollIntoView({ behavior: 'smooth' });

    // Calculate and display costs
    const buildingType = parseInt(document.getElementById('buildingType').value);
    const travelDistance = parseFloat(document.getElementById('travelDistance').value);
    const speed = parseFloat(document.getElementById('speed').value);
    const buffer = parseFloat(document.getElementById('buffer').value) || 300;
    const suspension = document.getElementById('suspension').value;
    const inputCylinderCount = parseInt(document.getElementById('cylinderCount').value);

    // Calculate stroke in meters
    const strokeMM = suspension === '1:1' ? (travelDistance + buffer) : (travelDistance + buffer) / 2;
    const strokeMeters = strokeMM / 1000;

    // Prepare cost components
    const isTwoPiece = document.getElementById('twoPieceCylinder')?.checked || false;


    // Get hose configuration with fallbacks
    const mainHoseDiameter = document.getElementById('mainHoseDiameter')?.value || (typeof recommendHoseDiameter === 'function' ? recommendHoseDiameter(pumpFlow) : "3/4\"");
    const mainHoseLength = parseFloat(document.getElementById('mainHoseLength')?.value) || 5;
    const cylinderHoseDiameter = document.getElementById('cylinderHoseDiameter')?.value || (typeof recommendHoseDiameter === 'function' ? recommendHoseDiameter(pumpFlow / inputCylinderCount) : "1/2\"");
    const cylinderHoseLength = parseFloat(document.getElementById('cylinderHoseLength')?.value) || 5;

    console.log('Hose config:', { mainHoseDiameter, mainHoseLength, cylinderHoseDiameter, cylinderHoseLength, inputCylinderCount });


    const costComponents = {
        cylinder: {
            cylinderType: cylinder.type, // e.g., "80x10"
            strokeMeters: strokeMeters,
            quantity: inputCylinderCount,
            isTwoPiece: isTwoPiece
        },
        motorName: recommendedMotor.name,
        pumpName: recommendedPump.name,
        powerUnitName: recommendedPowerUnit,
        ruptureValveName: recommendedRuptureValve,
        mainValveName: recommendedMainValve,
        hoses: {
            mainDiameter: mainHoseDiameter,
            mainLength: mainHoseLength,
            cylinderDiameter: cylinderHoseDiameter,
            cylinderLength: cylinderHoseLength,
            cylinderCount: inputCylinderCount
        },
        accessories: accessories.filter(a => a.included).map(a => a.name)
    };

    const { totalCost, breakdown } = calculateSystemCost(costComponents);

    // Display cost breakdown
    const costBreakdownHTML = `
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px;">Silindirler (${inputCylinderCount}x)</div>
            <div style="font-size: 1.2rem; color: #10b981; font-weight: 600;">${breakdown.cylinders.toFixed(0)} €</div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px;">Motor</div>
            <div style="font-size: 1.2rem; color: #10b981; font-weight: 600;">${breakdown.motor.toFixed(0)} €</div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px;">Pompa</div>
            <div style="font-size: 1.2rem; color: #10b981; font-weight: 600;">${breakdown.pump.toFixed(0)} €</div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px;">Güç Ünitesi${costComponents.accessories.includes("Güç Ünitesi Hortumları") ? ' (Hortumlu)' : ''}</div>
            <div style="font-size: 1.2rem; color: #10b981; font-weight: 600;">${breakdown.powerUnit.toFixed(0)} €</div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px;">Patlak Hortum Valfi</div>
            <div style="font-size: 1.2rem; color: #10b981; font-weight: 600;">${breakdown.ruptureValve.toFixed(0)} €</div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px;">Ana Kontrol Valfi</div>
            <div style="font-size: 1.2rem; color: #10b981; font-weight: 600;">${breakdown.mainValve.toFixed(0)} €</div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px;">Aksesuarlar</div>
            <div style="font-size: 1.2rem; color: #10b981; font-weight: 600;">${breakdown.accessories.toFixed(0)} €</div>
        </div>
    `;
    document.getElementById('costBreakdown').innerHTML = costBreakdownHTML;
    document.getElementById('totalCost').textContent = `${totalCost.toFixed(0)} €`;

    // Update hose cost display in hose section
    const hoseCostDisplay = document.getElementById('hoseCostDisplay');
    if (hoseCostDisplay && costComponents.hoses) {
        const { mainDiameter, mainLength, cylinderDiameter, cylinderLength, cylinderCount } = costComponents.hoses;
        const hoseCost = calculateHoseCost(mainDiameter, mainLength, cylinderDiameter, cylinderLength, cylinderCount);
        hoseCostDisplay.textContent = `${hoseCost.toFixed(2)} €`;
    }

    // Calculate and display thermal analysis
    const selectedPowerUnit = powerUnits.find(u => u.model === recommendedPowerUnit);
    const oilVolume = selectedPowerUnit ? selectedPowerUnit.totalOil : 100;

    const thermalInputs = {
        speed: speed,
        travelDistance: travelDistance,
        tripsPerHour: buildingType * 6 // Convert building type to approximate trips/hour
    };

    const thermalComponents = {
        motorPower: motorPower,
        pumpFlow: pumpFlow,
        pressure: parseFloat(cylinder.pressureFull),
        oilVolume: oilVolume
    };

    const thermalResult = performThermalAnalysis(thermalInputs, thermalComponents);

    // Display thermal results
    document.getElementById('heatGeneration').textContent = `${thermalResult.heatPerHour} kJ/h`;
    document.getElementById('tempRise').textContent = `${thermalResult.tempRisePerHour} °C/h`;

    const steadyTempValue = parseFloat(thermalResult.steadyStateTemp);
    const steadyTempEl = document.getElementById('steadyTemp');
    steadyTempEl.textContent = `${thermalResult.steadyStateTemp} °C`;
    steadyTempEl.style.color = steadyTempValue > 55 ? '#f87171' : steadyTempValue > 45 ? '#fbbf24' : '#4ade80';

    const coolerStatusEl = document.getElementById('coolerStatus');
    if (thermalResult.needsCooling) {
        coolerStatusEl.textContent = '⚠️ Gerekli';
        coolerStatusEl.style.color = '#f87171';
    } else {
        coolerStatusEl.textContent = '✅ Gerekli Değil';
        coolerStatusEl.style.color = '#4ade80';
    }

    const recommendationEl = document.getElementById('thermalRecommendation');
    recommendationEl.textContent = thermalResult.recommendation;
    recommendationEl.style.background = thermalResult.needsCooling
        ? 'rgba(248, 113, 113, 0.2)'
        : 'rgba(74, 222, 128, 0.2)';
    recommendationEl.style.color = thermalResult.needsCooling ? '#f87171' : '#4ade80';
    recommendationEl.style.border = thermalResult.needsCooling
        ? '1px solid rgba(248, 113, 113, 0.5)'
        : '1px solid rgba(74, 222, 128, 0.5)';

    // Update rupture valve options based on cylinder count
    setTimeout(() => updateRuptureValveOptions(), 100);

    // Calculate initial hose cost
    setTimeout(() => updateHoseCost(), 150);
}

function updateCylinderPricing() {
    // Recalculate costs when two-piece cylinder checkbox changes
    const isTwoPiece = document.getElementById('twoPieceCylinder')?.checked || false;

    // Get current values
    const travelDistance = parseFloat(document.getElementById('travelDistance').value);
    const buffer = parseFloat(document.getElementById('buffer').value) || 300;
    const suspension = document.getElementById('suspension').value;
    const inputCylinderCount = parseInt(document.getElementById('cylinderCount').value);

    // Calculate stroke
    const strokeMM = suspension === '1:1' ? (travelDistance + buffer) : (travelDistance + buffer) / 2;
    const strokeMeters = strokeMM / 1000;

    // Get selected cylinder type from results
    const cylinderType = selectedCylinder; // This is set when user selects a cylinder

    if (!cylinderType) return;

    // Get other components
    const motorName = document.getElementById('motorSelect')?.value;
    const pumpName = document.getElementById('pumpSelect')?.value;
    const powerUnitName = document.getElementById('powerUnitSelect')?.value;

    // Get hose configuration
    const mainHoseDiameter = document.getElementById('mainHoseDiameter')?.value;
    const mainHoseLength = parseFloat(document.getElementById('mainHoseLength')?.value) || 5;
    const cylinderHoseDiameter = document.getElementById('cylinderHoseDiameter')?.value;
    const cylinderHoseLength = parseFloat(document.getElementById('cylinderHoseLength')?.value) || 5;

    // Prepare cost components
    const ruptureValveName = document.getElementById('ruptureSelect')?.value;
    const mainValveName = document.getElementById('mainValveSelect')?.value;

    const costComponents = {
        cylinder: {
            cylinderType: cylinderType,
            strokeMeters: strokeMeters,
            quantity: inputCylinderCount,
            isTwoPiece: isTwoPiece
        },
        motorName: motorName,
        pumpName: pumpName,
        powerUnitName: powerUnitName,
        ruptureValveName: ruptureValveName,
        mainValveName: mainValveName,
        hoses: mainHoseDiameter && cylinderHoseDiameter ? {
            mainDiameter: mainHoseDiameter,
            mainLength: mainHoseLength,
            cylinderDiameter: cylinderHoseDiameter,
            cylinderLength: cylinderHoseLength,
            cylinderCount: inputCylinderCount
        } : null,
        accessories: accessories.filter(a => a.included).map(a => a.name)
    };

    const { totalCost, breakdown } = calculateSystemCost(costComponents);

    console.log('=== updateCylinderPricing ===');
    console.log('Accessories:', costComponents.accessories);
    console.log('Hoses config:', costComponents.hoses);
    console.log('Power unit breakdown:', breakdown.powerUnit);
    console.log('Cost breakdown:', breakdown);
    console.log('Power unit hoses selected:', costComponents.accessories.includes("Güç Ünitesi Hortumları"));

    // Update display
    const costBreakdownHTML = `
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px;">Silindirler (${inputCylinderCount}x)${isTwoPiece ? ' - İki Parça' : ''}</div>
            <div style="font-size: 1.2rem; color: #10b981; font-weight: 600;">${breakdown.cylinders.toFixed(0)} €</div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px;">Motor</div>
            <div style="font-size: 1.2rem; color: #10b981; font-weight: 600;">${breakdown.motor.toFixed(0)} €</div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px;">Pompa</div>
            <div style="font-size: 1.2rem; color: #10b981; font-weight: 600;">${breakdown.pump.toFixed(0)} €</div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px;">Güç Ünitesi${costComponents.accessories.includes("Güç Ünitesi Hortumları") ? ' (Hortumlu)' : ''}</div>
            <div style="font-size: 1.2rem; color: #10b981; font-weight: 600;">${breakdown.powerUnit.toFixed(0)} €</div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px;">Patlak Hortum Valfi</div>
            <div style="font-size: 1.2rem; color: #10b981; font-weight: 600;">${breakdown.ruptureValve.toFixed(0)} €</div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px;">Ana Kontrol Valfi</div>
            <div style="font-size: 1.2rem; color: #10b981; font-weight: 600;">${breakdown.mainValve.toFixed(0)} €</div>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px;">Aksesuarlar</div>
            <div style="font-size: 1.2rem; color: #10b981; font-weight: 600;">${breakdown.accessories.toFixed(0)} €</div>
        </div>
    `;

    document.getElementById('costBreakdown').innerHTML = costBreakdownHTML;
    document.getElementById('totalCost').textContent = `${totalCost.toFixed(0)} €`;
}

function updateHoseCost() {
    // Get hose configuration
    const mainDiameter = document.getElementById('mainHoseDiameter')?.value;
    const mainLength = parseFloat(document.getElementById('mainHoseLength')?.value) || 0;
    const cylinderCount = parseInt(document.getElementById('cylinderCount').value);

    if (!mainDiameter) return;

    let cylinderDiameter, cylinderLength;

    // For single cylinder, only main hose matters
    if (cylinderCount === 1) {
        // Use dummy values - they won't be used in calculation
        cylinderDiameter = mainDiameter;
        cylinderLength = 0;
    } else {
        cylinderDiameter = document.getElementById('cylinderHoseDiameter')?.value;
        cylinderLength = parseFloat(document.getElementById('cylinderHoseLength')?.value) || 0;

        if (!cylinderDiameter) return;
    }

    // Calculate hose cost
    const hoseCost = calculateHoseCost(mainDiameter, mainLength, cylinderDiameter, cylinderLength, cylinderCount);

    // Update display
    const hoseCostDisplay = document.getElementById('hoseCostDisplay');
    if (hoseCostDisplay) {
        hoseCostDisplay.textContent = `${hoseCost.toFixed(2)} €`;
    }

    // Recalculate total cost including hoses
    updateCylinderPricing();
}

function updateAccessoryStatus(index) {
    const checkbox = document.getElementById(`acc_${index}`);
    const statusSpan = document.getElementById(`acc_status_${index}`);

    if (checkbox && statusSpan) {
        // Update global accessories array
        if (accessories[index]) {
            accessories[index].included = checkbox.checked;
        }

        if (checkbox.checked) {
            statusSpan.textContent = 'Dahil';
            statusSpan.style.background = 'rgba(74, 222, 128, 0.2)';
            statusSpan.style.color = '#4ade80';
        } else {
            statusSpan.textContent = 'Dahil Değildir';
            statusSpan.style.background = 'rgba(248, 113, 113, 0.2)';
            statusSpan.style.color = '#f87171';
        }

        // Recalculate costs when accessories change (especially for power unit hoses)
        updateCylinderPricing();
    }
}


function updatePowerUnitInfo() {
    const selectedModel = document.getElementById('powerUnitSelect').value;
    const selectedUnit = powerUnits.find(u => u.model === selectedModel);

    if (selectedUnit) {
        // Update Total Oil
        const totalOilDisplay = document.getElementById('totalOilDisplay');
        if (totalOilDisplay) {
            totalOilDisplay.textContent = `${selectedUnit.totalOil.toFixed(1)} L`;
        }

        // Update Dead Zone
        const deadZoneDisplay = document.getElementById('deadZoneDisplay');
        if (deadZoneDisplay) {
            deadZoneDisplay.textContent = `${selectedUnit.deadZone} L`;
        }

        // Update Dimensions
        const dimensionsDisplay = document.getElementById('dimensionsDisplay');
        if (dimensionsDisplay) {
            dimensionsDisplay.textContent = `${selectedUnit.length} × ${selectedUnit.width} × ${selectedUnit.height} mm`;
        }
    }
}

function updateRuptureValveOptions() {
    const ruptureSelect = document.getElementById('ruptureSelect');
    if (!ruptureSelect) return; // Element doesn't exist yet

    const cylinderCount = parseInt(document.getElementById('cylinderCount').value) || 1;
    const needsDK = cylinderCount >= 2;
    const currentValue = ruptureSelect.value; // Save current selection

    // Filter suitable valves from data.js
    const suitableValves = burstHoseValves.filter(v => v.hasDK === needsDK);

    // Build options
    let options = '<option value="Yok">Yok (İstemiyorum)</option>';

    suitableValves.forEach(v => {
        options += `<option value="${v.name}">${v.name}</option>`;
    });

    ruptureSelect.innerHTML = options;

    // Try to restore previous selection
    // If the exact name exists, keep it.
    const optionExists = Array.from(ruptureSelect.options).some(opt => opt.value === currentValue);
    if (optionExists) {
        ruptureSelect.value = currentValue;
    } else {
        // If exact match not found (e.g. switched from Single to Multi), try to find same size?
        // For now, let's just default to Yok or let user choose.
        // Or if we want to be nice, we could try to map sizes.
        // But simple is better for now to avoid errors.
        ruptureSelect.value = "Yok";
    }
}

function updateMotorDetails() {
    const motorName = document.getElementById('motorSelect').value;
    const motor = motors.find(m => m.name === motorName);
    const voltage = document.getElementById('voltageSelect').value;

    if (!motor) return;

    // Calculate Nominal Current
    // Formula: (1.5 * kW * 1000) / (1.732 * Voltage * 0.79)
    const vVal = voltage === '380V' ? 400 : 230;
    const nominalCurrent = (1.5 * motor.kw * 1000) / (1.732 * vVal * 0.79);

    // Get Star and Delta Currents
    let starCurrent = 0;
    let deltaCurrent = 0;

    if (voltage === '380V') {
        if (motor.current380) {
            starCurrent = motor.current380.star;
            deltaCurrent = motor.current380.delta;
        }
    } else {
        // 220V
        if (motor.current220) {
            starCurrent = motor.current220.star;
            deltaCurrent = motor.current220.delta;
        } else {
            // Fallback if no 220V data (for larger motors)
            starCurrent = "-";
            deltaCurrent = "-";
        }
    }

    // Update Display - Recreate entire div to ensure all values update
    const detailsDiv = document.getElementById('motorDetails');
    if (detailsDiv) {
        detailsDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>Model: <span style="color: white;" id="motorModelDisplay">${motor.name}</span></div>
                <div>Güç: <span style="color: white;" id="motorPowerDisplay">${motor.kw} kW</span></div>
                <div>Nominal Akım: <span style="color: #fbbf24;" id="motorNominalDisplay">${nominalCurrent.toFixed(1)} A</span></div>
                <div>Yıldız Akım: <span style="color: #fbbf24;" id="motorStarDisplay">${starCurrent} A</span></div>
                <div>Üçgen Akım: <span style="color: #fbbf24;" id="motorDeltaDisplay">${deltaCurrent} A</span></div>
            </div>
        `;
    }
}

// updateValveDisplay is no longer needed as dropdowns show the full name directly
function updateValveDisplay() { }

function updateCalculations(cylinderType) {
    const result = calculatedResults.find(r => r.type === cylinderType);
    if (!result) return;

    const pumpName = document.getElementById('pumpSelect').value;
    const selectedPump = pumps.find(p => p.name === pumpName);

    const cylinderCount = parseInt(document.getElementById('cylinderCount').value);
    const suspension = document.getElementById('suspension').value;
    const suspensionFactor = (suspension === '2:1') ? 2 : 1;
    const area = Math.pow(result.d, 2) * Math.PI * 0.25;

    // Recalculate Speed
    const q_actual = selectedPump.flow;
    const speed_eff = (q_actual * suspensionFactor * 1000) / (area * 60 * cylinderCount);
    document.getElementById('effectiveSpeedDisplay').textContent = `${speed_eff.toFixed(3)} m/s`;

    // Recalculate Required Power
    const p_req = (q_actual * parseFloat(result.pressureFull) * 1.3) / 600;
    document.getElementById('reqPowerDisplay').textContent = `${p_req.toFixed(1)} kW`;

    // Update Motor Options (to show warnings for new power req)
    const motorSelect = document.getElementById('motorSelect');
    const currentMotor = motorSelect.value;

    // Re-render motor options
    // We need to find the recommended motor for this new power
    let recommendedMotor = motors.find(m => m.kw >= p_req);
    if (!recommendedMotor) recommendedMotor = motors[motors.length - 1];

    const newOptions = motors.map(m => {
        // Keep current selection if valid, else select recommended
        // Actually, user might want to keep their manual selection unless it's invalid?
        // Let's just mark the recommended one.
        const isSelected = m.name === currentMotor ? 'selected' : '';
        const isRecommended = m.name === recommendedMotor.name ? ' (Önerilen)' : '';
        const isSufficient = m.kw >= p_req;
        const style = isSufficient ? '' : 'color: #f87171;';
        const warning = isSufficient ? '' : ' (Yetersiz Güç)';
        return `<option value="${m.name}" style="${style}" ${isSelected}>${m.name} - ${m.kw} kW${isRecommended}${warning}</option>`;
    }).join('');

    motorSelect.innerHTML = newOptions;
}



// Event Listeners
document.getElementById('newProjectBtn').addEventListener('click', resetToNewProject);
document.getElementById('saveProjectBtn').addEventListener('click', saveProject);
document.getElementById('updateProjectBtn').addEventListener('click', updateProject);
document.getElementById('openProjectsBtn').addEventListener('click', () => {
    window.location.href = 'projects.html';
});
// Sidebar listeners kept for compatibility if needed, but main entry is now projects.html
document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

// Check for auto-load project from projects.html
document.addEventListener('DOMContentLoaded', () => {
    const projectToLoad = localStorage.getItem('projectToLoad');
    if (projectToLoad) {
        // Clear it immediately so it doesn't reload on refresh
        localStorage.removeItem('projectToLoad');
        // Small delay to ensure data is ready
        setTimeout(() => {
            loadProject(projectToLoad);
        }, 100);
    }
});
