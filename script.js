let people = [];
let items = [];
let consumption = {};

function createNameInputs() {
  const num = parseInt(document.getElementById("numPeople").value);
  const container = document.getElementById("nameInputs");
  container.innerHTML = "";
  people = [];
  for (let i = 0; i < num; i++) {
    const input = document.createElement("input");
    input.placeholder = `Person ${i + 1} name`;
    input.onchange = () => {
      people[i] = input.value;
    };
    container.appendChild(input);
  }
  const next = document.createElement("button");
  next.innerText = "Next";
  next.onclick = () => {
    document.getElementById("step1").classList.add("hidden");
    document.getElementById("step2").classList.remove("hidden");
  };
  container.appendChild(next);
}

function addItem() {
  const name = document.getElementById("itemName").value;
  const price = parseFloat(document.getElementById("itemPrice").value);
  if (!name || isNaN(price)) return;
  items.push({ name, price });
  document.getElementById("itemName").value = "";
  document.getElementById("itemPrice").value = "";
  renderItems();
}

function renderItems() {
  const list = document.getElementById("itemList");
  list.innerHTML = "";
  items.forEach((item, i) => {
    const div = document.createElement("div");
    div.innerText = `${item.name} - ₹${item.price}`;
    list.appendChild(div);
  });
}

function proceedToConsumption() {
  document.getElementById("step2").classList.add("hidden");
  document.getElementById("step3").classList.remove("hidden");
  const container = document.getElementById("consumptionInputs");
  container.innerHTML = "";
  items.forEach((item, idx) => {
    const section = document.createElement("div");
    section.innerHTML = `<strong>${item.name}</strong>`;
    people.forEach((p, i) => {
      const input = document.createElement("input");
      input.type = "number";
      input.min = 0;
      input.placeholder = `${p} had how many? (0 if none)`;
      input.onchange = () => {
        if (!consumption[item.name]) consumption[item.name] = {};
        consumption[item.name][p] = parseFloat(input.value) || 0;
      };
      section.appendChild(input);
    });
    container.appendChild(section);
  });
}

function proceedToAdjustments() {
  document.getElementById("step3").classList.add("hidden");
  document.getElementById("step4").classList.remove("hidden");
}

function calculateSplit() {
  const discount = parseFloat(document.getElementById("discount").value) || 0;
  const cgst = parseFloat(document.getElementById("cgst").value) || 0;
  const sgst = parseFloat(document.getElementById("sgst").value) || 0;
  const service = parseFloat(document.getElementById("service").value) || 0;

  let totals = {};
  people.forEach(p => (totals[p] = 0));

  items.forEach(item => {
    let totalQty = 0;
    const itemConsumption = consumption[item.name];
    for (let person in itemConsumption) {
      totalQty += itemConsumption[person];
    }
    if (totalQty === 0) return;
    for (let person in itemConsumption) {
      const share = (item.price * itemConsumption[person]) / totalQty;
      totals[person] += share;
    }
  });

  // Apply discount
  let grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  grandTotal -= discount;

  // Apply taxes
  grandTotal *= 1 + (cgst + sgst + service) / 100;

  const resultDiv = document.getElementById("splitResult");
  resultDiv.innerHTML = "";
  const finalTotals = {};
  const totalBeforeTax = Object.values(totals).reduce((a, b) => a + b, 0);
  people.forEach(p => {
    finalTotals[p] = ((totals[p] / totalBeforeTax) * grandTotal).toFixed(2);
  });

  for (let person in finalTotals) {
    const p = document.createElement("p");
    p.innerText = `${person} owes ₹${finalTotals[person]}`;
    resultDiv.appendChild(p);
  }

  document.getElementById("step4").classList.add("hidden");
  document.getElementById("result").classList.remove("hidden");
}