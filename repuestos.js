const storageKey = "inventoryParts";

const starterParts = [
  {
    id: crypto.randomUUID(),
    name: "Pantalla iPhone 11",
    category: "Celular",
    price: 1250,
    stock: 4,
    quality: "Premium",
    supplier: "TecnoPartes MX",
  },
  {
    id: crypto.randomUUID(),
    name: "Bateria laptop HP",
    category: "Computadora",
    price: 890,
    stock: 3,
    quality: "Original",
    supplier: "CompuRefacciones",
  },
  {
    id: crypto.randomUUID(),
    name: "Capacitor lavadora",
    category: "Electrodomestico",
    price: 180,
    stock: 8,
    quality: "Generica",
    supplier: "ElectroStock",
  },
];

const partsForm = document.querySelector("#partsForm");
const partsTable = document.querySelector("#partsTable");
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

  if (undoTimerId) {
    clearInterval(undoTimerId);
    undoTimerId = null;
  }
}

function showUndoBar(message, onUndo) {
  const undoBar = getUndoBar();
  let secondsLeft = 10;

  if (undoTimerId) {
    clearInterval(undoTimerId);
  }

  undoBar.innerHTML = `
    <span>${message}</span>
    <small>${secondsLeft}s</small>
    <button type="button">Deshacer</button>
  `;
  undoBar.hidden = false;

  undoBar.querySelector("button").addEventListener("click", () => {
    onUndo();
    hideUndoBar();
  });

  undoTimerId = setInterval(() => {
    secondsLeft -= 1;
    undoBar.querySelector("small").textContent = `${secondsLeft}s`;

    if (secondsLeft <= 0) {
      hideUndoBar();
    }
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

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function getFilteredParts(parts) {
  const term = partSearch.value.trim().toLowerCase();
  if (!term) {
    return parts;
  }

  return parts.filter((part) =>
    [part.name, part.category, part.quality, part.supplier].some((field) =>
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
    partsTable.innerHTML = `
      <tr>
        <td class="empty-table" colspan="7">No hay repuestos con esa busqueda.</td>
      </tr>
    `;
    return;
  }

  partsTable.innerHTML = filteredParts
    .map(
      (part) => `
        <tr>
          <td><strong>${part.name}</strong></td>
          <td>${part.category}</td>
          <td><span class="quality-pill">${part.quality}</span></td>
          <td>${part.supplier}</td>
          <td>${formatCurrency(part.price)}</td>
          <td>${part.stock}</td>
          <td>   <button class="edit-button" type="button" data-id="${part.id}">Editar</button>   <button class="delete-button" type="button" data-id="${part.id}">Eliminar</button> </td>
        </tr>
      `,
    )
    .join("");
}

function updateDateTime() {
  const now = new Date();
  currentDate.textContent = new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(now);
  currentTime.textContent = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
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
        name: formData.get("partName").trim(),
        category: formData.get("category"),
        price: Number(formData.get("price")),
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
      name: formData.get("partName").trim(),
      category: formData.get("category"),
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      quality: formData.get("quality"),
      supplier: formData.get("supplier").trim(),
    });
    partsHint.textContent = "Repuesto guardado correctamente.";
  }

  saveParts(parts);
  partsForm.reset();
  renderParts();
});
partsTable.addEventListener("click", (event) => {
  const editButton = event.target.closest(".edit-button");
  if (editButton) {
    const parts = loadParts();
    const part = parts.find((p) => p.id === editButton.dataset.id);
    if (!part) return;

    document.querySelector("#partName").value = part.name;
    document.querySelector("#category").value = part.category;
    document.querySelector("#price").value = part.price;
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
  if (!deleteButton) {
    return;
  }
  const parts = loadParts();
  const partIndex = parts.findIndex((part) => part.id === deleteButton.dataset.id);
  const partToDelete = parts[partIndex];

  if (!partToDelete) {
    return;
  }

  const shouldDelete = confirm(`¿Seguro que quieres eliminar "${partToDelete.name}"?`);
  if (!shouldDelete) {
    return;
  }

  lastDeletedPart = { part: partToDelete, index: partIndex };
  parts.splice(partIndex, 1);
  saveParts(parts);
  partsHint.textContent = "Repuesto eliminado del listado.";
  renderParts();

  showUndoBar("Repuesto eliminado.", () => {
    if (!lastDeletedPart) {
      return;
    }

    const restoredParts = loadParts();
    restoredParts.splice(lastDeletedPart.index, 0, lastDeletedPart.part);
    saveParts(restoredParts);
    partsHint.textContent = "Eliminacion deshecha.";
    lastDeletedPart = null;
    renderParts();
  });
});

partSearch.addEventListener("input", renderParts);

updateDateTime();
setInterval(updateDateTime, 1000);
renderParts();
