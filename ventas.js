const salesTable = document.querySelector("#salesTable");
const saleSearch = document.querySelector("#saleSearch");
const totalSales = document.querySelector("#totalSales");
const totalSalesValue = document.querySelector("#totalSalesValue");
const totalSaleUnits = document.querySelector("#totalSaleUnits");

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(value) || 0);
}

function formatSaleDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function getDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "sin-fecha";
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getSaleId(sale) {
  return sale?._id || sale?.id || sale?.sourceId || "";
}

function getLocalSales() {
  const saved = localStorage.getItem("inventorySales");
  return saved ? JSON.parse(saved) : [];
}

async function loadSales() {
  if (window.repairCloud?.isConfigured()) {
    const sales = await window.repairCloud.listSales(10000);
    localStorage.setItem("inventorySales", JSON.stringify(sales));
    return sales;
  }
  return getLocalSales();
}

function filterSales(sales, search) {
  const term = search.trim().toLowerCase();
  if (!term) return sales;
  return sales.filter((sale) => [sale.saleNumber, sale.customerName, sale.product, sale.productModel, sale.createdAt]
    .some((field) => String(field ?? "").toLowerCase().includes(term)));
}

function renderSales(sales) {
  const ordered = [...sales].sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());
  totalSales.textContent = ordered.length;
  totalSalesValue.textContent = formatCurrency(ordered.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0));
  totalSaleUnits.textContent = ordered.reduce((sum, sale) => sum + (Number(sale.quantity) || 0), 0);
  if (!ordered.length) {
    salesTable.innerHTML = `<tr><td class="empty-table" colspan="8">No hay ventas con esa busqueda.</td></tr>`;
    return;
  }
  let previousDateKey = "";
  salesTable.innerHTML = ordered.map((sale) => {
    const dateKey = getDateKey(sale.createdAt);
    const separator = dateKey !== previousDateKey
      ? `<tr class="repair-date-separator"><td colspan="8">${escapeHtml(formatSaleDate(sale.createdAt))}</td></tr>`
      : "";
    previousDateKey = dateKey;
    return `${separator}<tr>
      <td>${escapeHtml(sale.saleNumber || "")}</td>
      <td><strong>${escapeHtml(sale.customerName || "Cliente general")}</strong></td>
      <td>${escapeHtml(sale.product || "")}</td>
      <td>${escapeHtml(sale.productModel || "")}</td>
      <td>${escapeHtml(sale.quantity || 0)}</td>
      <td>${formatCurrency(sale.total)}</td>
      <td>${formatCurrency(sale.received)}</td>
      <td>${escapeHtml(formatSaleDate(sale.createdAt))}</td>
    </tr>`;
  }).join("");
}

async function refreshSales() {
  try {
    const sales = await loadSales();
    renderSales(filterSales(sales, saleSearch.value));
  } catch (error) {
    salesTable.innerHTML = `<tr><td class="empty-table" colspan="8">${escapeHtml(error.message)}</td></tr>`;
  }
}

saleSearch.addEventListener("input", refreshSales);
refreshSales();
