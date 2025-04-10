
function addIngredient() {
    const tbody = document.querySelector("#formulaTable tbody");
    const row = document.createElement("tr");
    row.innerHTML = \`
        <td><input type="text" placeholder="e.g., Hedione HC"></td>
        <td><input type="number" step="0.001"></td>
        <td><input type="text" placeholder="e.g., Floral"></td>
        <td><input type="number" step="0.01" placeholder="optional"></td>
        <td><button onclick="removeRow(this)">Remove</button></td>
    \`;
    tbody.appendChild(row);
}

function removeRow(button) {
    button.closest("tr").remove();
}

function calculateFormula() {
    const batchSize = parseFloat(document.getElementById("batchSize").value);
    const concentration = parseFloat(document.getElementById("concentration").value);
    const dilutionThreshold = parseFloat(document.getElementById("dilutionThreshold").value);
    const dilutionPercentage = parseFloat(document.getElementById("dilutionPercentage").value);

    const rows = document.querySelectorAll("#formulaTable tbody tr");
    let total = 0;
    let results = "";
    let costTotal = 0;

    const formula = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const name = cells[0].querySelector("input").value;
        const weight = parseFloat(cells[1].querySelector("input").value);
        const family = cells[2].querySelector("input").value;
        const price = parseFloat(cells[3].querySelector("input").value);

        if (name && !isNaN(weight)) {
            total += weight;
            formula.push({ name, weight, family, price: isNaN(price) ? 0 : price });
        }
    });

    const targetWeight = batchSize * (concentration / 100);
    const scaleFactor = targetWeight / total;

    results += `Target Fragrance Weight: ${targetWeight.toFixed(2)}g\n\nScaled Formula:\n`;

    formula.forEach(ing => {
        const scaled = ing.weight * scaleFactor;
        let line = "";

        if (scaled < dilutionThreshold) {
            const dilutionTotal = scaled / (dilutionPercentage / 100);
            line += `${ing.name} (${ing.family}): ${dilutionTotal.toFixed(3)}g of ${dilutionPercentage}% dilution`;
            if (ing.price) {
                costTotal += ing.price * scaled;
            }
        } else {
            line += `${ing.name} (${ing.family}): ${scaled.toFixed(3)}g`;
            if (ing.price) {
                costTotal += ing.price * scaled;
            }
        }

        results += line + "\n";
    });

    if (costTotal > 0) {
        results += `\nTotal Material Cost: $${costTotal.toFixed(2)}\n`;
    }

    document.getElementById("results").innerText = results;
}

function saveFormula() {
    const name = prompt("Enter a name for this formula:");
    if (!name) return;

    const formula = {
        batchSize: document.getElementById("batchSize").value,
        concentration: document.getElementById("concentration").value,
        dilutionThreshold: document.getElementById("dilutionThreshold").value,
        dilutionPercentage: document.getElementById("dilutionPercentage").value,
        ingredients: []
    };

    const rows = document.querySelectorAll("#formulaTable tbody tr");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        formula.ingredients.push({
            name: cells[0].querySelector("input").value,
            weight: cells[1].querySelector("input").value,
            family: cells[2].querySelector("input").value,
            price: cells[3].querySelector("input").value
        });
    });

    localStorage.setItem(`formula_${name}`, JSON.stringify(formula));
    updateFormulaDropdown();
}

function loadFormula() {
    const dropdown = document.getElementById("savedFormulasDropdown");
    const name = dropdown.value;
    if (!name) return;

    const formula = JSON.parse(localStorage.getItem(`formula_${name}`));
    if (!formula) return;

    document.getElementById("batchSize").value = formula.batchSize;
    document.getElementById("concentration").value = formula.concentration;
    document.getElementById("dilutionThreshold").value = formula.dilutionThreshold;
    document.getElementById("dilutionPercentage").value = formula.dilutionPercentage;

    const tbody = document.querySelector("#formulaTable tbody");
    tbody.innerHTML = "";
    formula.ingredients.forEach(ing => {
        const row = document.createElement("tr");
        row.innerHTML = \`
            <td><input type="text" value="\${ing.name}"></td>
            <td><input type="number" value="\${ing.weight}" step="0.001"></td>
            <td><input type="text" value="\${ing.family}"></td>
            <td><input type="number" value="\${ing.price}" step="0.01"></td>
            <td><button onclick="removeRow(this)">Remove</button></td>
        \`;
        tbody.appendChild(row);
    });
}

function updateFormulaDropdown() {
    const dropdown = document.getElementById("savedFormulasDropdown");
    dropdown.innerHTML = '<option value="">-- Load Saved Formula --</option>';
    for (let key in localStorage) {
        if (key.startsWith("formula_")) {
            const name = key.replace("formula_", "");
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            dropdown.appendChild(option);
        }
    }
}

function exportFormula() {
    const data = {
        batchSize: document.getElementById("batchSize").value,
        concentration: document.getElementById("concentration").value,
        dilutionThreshold: document.getElementById("dilutionThreshold").value,
        dilutionPercentage: document.getElementById("dilutionPercentage").value,
        ingredients: []
    };

    const rows = document.querySelectorAll("#formulaTable tbody tr");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        data.ingredients.push({
            name: cells[0].querySelector("input").value,
            weight: cells[1].querySelector("input").value,
            family: cells[2].querySelector("input").value,
            price: cells[3].querySelector("input").value
        });
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "perfume_formula.json";
    link.click();
}

window.onload = updateFormulaDropdown;
