
function addIngredient() {
    const tbody = document.querySelector("#formulaTable tbody");
    const row = document.createElement("tr");
    row.innerHTML = \`
        <td><input type="text" placeholder="e.g., Hedione HC"></td>
        <td><input type="number" step="0.001"></td>
        <td><input type="text" placeholder="e.g., Floral"></td>
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

    const formula = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const name = cells[0].querySelector("input").value;
        const weight = parseFloat(cells[1].querySelector("input").value);
        const family = cells[2].querySelector("input").value;

        if (name && !isNaN(weight)) {
            total += weight;
            formula.push({ name, weight, family });
        }
    });

    const targetWeight = batchSize * (concentration / 100);
    const scaleFactor = targetWeight / total;

    results += `Target Fragrance Weight: ${targetWeight.toFixed(2)}g\n`;
    results += `\nScaled Formula:\n`;

    formula.forEach(ing => {
        const scaled = ing.weight * scaleFactor;
        if (scaled < dilutionThreshold) {
            const dilutionTotal = scaled / (dilutionPercentage / 100);
            results += `${ing.name} (${ing.family}): ${dilutionTotal.toFixed(3)}g of ${dilutionPercentage}% dilution\n`;
        } else {
            results += `${ing.name} (${ing.family}): ${scaled.toFixed(3)}g\n`;
        }
    });

    document.getElementById("results").innerText = results;
}
