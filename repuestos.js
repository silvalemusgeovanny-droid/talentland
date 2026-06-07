const storageKey = "inventoryParts";

const starterParts = [
  {
    id: crypto.randomUUID(),
    name: "Pantalla iPhone 11",
    brand: "Apple",
    category: "Celular",
    price: 1250,
    customerPrice: 1650,
    stock: 4,
    quality: "Premium",
    supplier: "TecnoPartes MX",
  },
  {
    id: crypto.randomUUID(),
    name: "Bateria laptop HP",
    brand: "Hp",
    category: "Computadora",
    price: 890,
    customerPrice: 1190,
    stock: 3,
    quality: "Original",
    supplier: "CompuRefacciones",
  },
  {
    id: crypto.randomUUID(),
    name: "Capacitor lavadora",
    brand: "Generica",
    category: "Electrodomestico",
    price: 180,
    customerPrice: 280,
    stock: 8,
    quality: "Generica",
    supplier: "ElectroStock",
  },
];

const partsForm = document.querySelector("#partsForm");
const partsTable = document.querySelector("#partsTable");
const partNameInput = document.querySelector("#partName");
const partTypeOptions = document.querySelector("#partTypeOptions");
const brandInput = document.querySelector("#brand");
const brandOptions = document.querySelector("#brandOptions");
const partSearch = document.querySelector("#partSearch");
const totalParts = document.querySelector("#totalParts");
const totalValue = document.querySelector("#totalValue");
const totalProviders = document.querySelector("#totalProviders");
const partsHint = document.querySelector("#partsHint");
const currentDate = document.querySelector("#currentDate");
const currentTime = document.querySelector("#currentTime");
let lastDeletedPart = null;
let undoTimerId = null;

function getUndoBar() {
  let undoBar = document.querySelector("#undoBar");
  if (!undoBar) {
    undoBar = document.createElement("div");
    undoBar.className = "undo-bar";
    undoBar.id = "undoBar";
    document.body.append(undoBar);
  }
  return undoBar;
}

function hideUndoBar() {
  const undoBar = getUndoBar();
  undoBar.hidden = true;
  if (undoTimerId) { clearInterval(undoTimerId); undoTimerId = null; }
}

function showUndoBar(message, onUndo) {
  const undoBar = getUndoBar();
  let secondsLeft = 10;
  if (undoTimerId) clearInterval(undoTimerId);
  undoBar.innerHTML = `<span>${message}</span><small>${secondsLeft}s</small><button type="button">Deshacer</button>`;
  undoBar.hidden = false;
  undoBar.querySelector("button").addEventListener("click", () => { onUndo(); hideUndoBar(); });
  undoTimerId = setInterval(() => {
    secondsLeft -= 1;
    undoBar.querySelector("small").textContent = `${secondsLeft}s`;
    if (secondsLeft <= 0) hideUndoBar();
  }, 1000);
}

function loadParts() {
  const savedParts = localStorage.getItem(storageKey);
  if (!savedParts) {
    localStorage.setItem(storageKey, JSON.stringify(starterParts));
    return starterParts;
  }
  return JSON.parse(savedParts);
}

function saveParts(parts) {
  localStorage.setItem(storageKey, JSON.stringify(parts));
}

function normalizePartType(value) {
  const cleanedValue = String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  if (!cleanedValue) return "";
  return cleanedValue.charAt(0).toUpperCase() + cleanedValue.slice(1);
}

function renderPartTypeOptions() {
  const partTypes = [...new Set(loadParts().map((part) => normalizePartType(part.name)).filter(Boolean))].sort();
  partTypeOptions.innerHTML = partTypes.map((partType) => `<option value="${partType}"></option>`).join("");
}

function syncPartTypeText() {
  partNameInput.value = normalizePartType(partNameInput.value);
}

function renderBrandOptions() {
  const brands = [...new Set(loadParts().map((part) => normalizePartType(part.brand)).filter(Boolean))].sort();
  brandOptions.innerHTML = brands.map((brand) => `<option value="${brand}"></option>`).join("");
}

function syncBrandText() {
  brandInput.value = normalizePartType(brandInput.value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
}

function getFilteredParts(parts) {
  const term = partSearch.value.trim().toLowerCase();
  if (!term) return parts;
  return parts.filter((part) =>
    [part.name, part.brand, part.category, part.quality, part.supplier].some((field) =>
      field.toLowerCase().includes(term),
    ),
  );
}

function renderParts() {
  const parts = loadParts();
  const filteredParts = getFilteredParts(parts);
  const inventoryValue = parts.reduce((sum, part) => sum + part.price * part.stock, 0);
  const providers = new Set(parts.map((part) => part.supplier.trim().toLowerCase()));

  totalParts.textContent = parts.length;
  totalValue.textContent = formatCurrency(inventoryValue);
  totalProviders.textContent = providers.size;

  if (!filteredParts.length) {
    partsTable.innerHTML = `<tr><td class="empty-table" colspan="9">No hay repuestos con esa busqueda.</td></tr>`;
    return;
  }

  partsTable.innerHTML = filteredParts.map((part) => `
    <tr>
      <td><strong>${part.name}</strong></td>
      <td>${part.brand || "Sin marca"}</td>
      <td>${part.category}</td>
      <td><span class="quality-pill">${part.quality}</span></td>
      <td>${part.supplier}</td>
      <td>${formatCurrency(part.price)}</td>
      <td>${formatCurrency(Number(part.customerPrice) || 0)}</td>
      <td>${part.stock}</td>
      <td>
        <button class="edit-button" type="button" data-id="${part.id}">Editar</button>
        <button class="delete-button" type="button" data-id="${part.id}">Eliminar</button>
      </td>
    </tr>
  `).join("");
}

function updateDateTime() {
  const now = new Date();
  currentDate.textContent = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(now);
  currentTime.textContent = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(now);
}

partsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(partsForm);
  const parts = loadParts();
  const editingId = partsForm.dataset.editingId;

  if (editingId) {
    const index = parts.findIndex((p) => p.id === editingId);
    if (index !== -1) {
      parts[index] = {
        ...parts[index],
        name: normalizePartType(formData.get("partName")),
        brand: normalizePartType(formData.get("brand")),
        category: formData.get("category"),
        price: Number(formData.get("price")),
        customerPrice: Number(formData.get("customerPrice")) || 0,
        stock: Number(formData.get("stock")),
        quality: formData.get("quality"),
        supplier: formData.get("supplier").trim(),
      };
    }
    delete partsForm.dataset.editingId;
    document.querySelector("#submitParts").textContent = "Guardar repuesto";
    partsHint.textContent = "Repuesto actualizado correctamente.";
  } else {
    parts.unshift({
      id: crypto.randomUUID(),
      name: normalizePartType(formData.get("partName")),
      brand: normalizePartType(formData.get("brand")),
      category: formData.get("category"),
      price: Number(formData.get("price")),
      customerPrice: Number(formData.get("customerPrice")) || 0,
      stock: Number(formData.get("stock")),
      quality: formData.get("quality"),
      supplier: formData.get("supplier").trim(),
    });
    partsHint.textContent = "Repuesto guardado correctamente.";
  }

  saveParts(parts);
  partsForm.reset();
  renderPartTypeOptions();
  renderBrandOptions();
  renderParts();
});

partsTable.addEventListener("click", (event) => {
  const editButton = event.target.closest(".edit-button");
  if (editButton) {
    const parts = loadParts();
    const part = parts.find((p) => p.id === editButton.dataset.id);
    if (!part) return;
    document.querySelector("#partName").value = part.name;
    document.querySelector("#brand").value = part.brand || "";
    document.querySelector("#category").value = part.category;
    document.querySelector("#price").value = part.price;
    document.querySelector("#customerPrice").value = part.customerPrice ?? "";
    document.querySelector("#stock").value = part.stock;
    document.querySelector("#quality").value = part.quality;
    document.querySelector("#supplier").value = part.supplier;
    partsForm.dataset.editingId = part.id;
    partsHint.textContent = "Editando repuesto — haz clic en Guardar para confirmar los cambios.";
    document.querySelector("#submitParts").textContent = "Guardar cambios";
    partsForm.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const deleteButton = event.target.closest(".delete-button");
  if (!deleteButton) return;

  const parts = loadParts();
  const partIndex = parts.findIndex((part) => part.id === deleteButton.dataset.id);
  const partToDelete = parts[partIndex];
  if (!partToDelete) return;

  if (!confirm(`¿Seguro que quieres eliminar "${partToDelete.name}"?`)) return;

  lastDeletedPart = { part: partToDelete, index: partIndex };
  parts.splice(partIndex, 1);
  saveParts(parts);
  partsHint.textContent = "Repuesto eliminado del listado.";
  renderParts();

  showUndoBar("Repuesto eliminado.", () => {
    if (!lastDeletedPart) return;
    const restoredParts = loadParts();
    restoredParts.splice(lastDeletedPart.index, 0, lastDeletedPart.part);
    saveParts(restoredParts);
    partsHint.textContent = "Eliminacion deshecha.";
    lastDeletedPart = null;
    renderParts();
  });
});

partSearch.addEventListener("input", renderParts);
partNameInput.addEventListener("blur", syncPartTypeText);
partNameInput.addEventListener("change", syncPartTypeText);
brandInput.addEventListener("blur", syncBrandText);
brandInput.addEventListener("change", syncBrandText);

updateDateTime();
setInterval(updateDateTime, 1000);
renderPartTypeOptions();
renderBrandOptions();
renderParts();
