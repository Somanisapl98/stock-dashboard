(() => {
  "use strict";

  function safeFileName() {
    const now = new Date();
    const pad = value => String(value).padStart(2, "0");
    return `Somani_Stock_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}.xlsx`;
  }

  function setStatus(text, isError = false) {
    const status = document.getElementById("exportStatus");
    if (status) {
      status.textContent = text;
      status.style.color = isError ? "#b42318" : "";
    }
  }

  function exportVisibleTableToXlsx(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    try {
      if (!window.XLSX) {
        throw new Error("XLSX library did not load. Check the internet connection and reload the dashboard.");
      }

      const table = document.querySelector(".table-scroll table") || document.querySelector("table");
      if (!table) {
        throw new Error("Stock table was not found.");
      }

      const bodyRows = table.querySelectorAll("tbody tr");
      if (!bodyRows.length) {
        throw new Error("There are no displayed stock rows to export.");
      }

      const workbook = XLSX.utils.table_to_book(table, {
        sheet: "Stock",
        raw: true
      });

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      if (worksheet && worksheet["!ref"]) {
        worksheet["!autofilter"] = { ref: worksheet["!ref"] };
      }

      XLSX.writeFile(workbook, safeFileName(), {
        bookType: "xlsx",
        compression: true
      });

      setStatus("Excel .xlsx file downloaded successfully.");
    } catch (error) {
      console.error("XLSX export failed", error);
      setStatus(error.message || "Excel export failed.", true);
    }
  }

  function initializeXlsxExport() {
    const button = document.getElementById("exportExcel");
    if (!button) {
      console.error("exportExcel button was not found");
      return;
    }

    button.textContent = "Excel (.xlsx)";
    button.addEventListener("click", exportVisibleTableToXlsx, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeXlsxExport, { once: true });
  } else {
    initializeXlsxExport();
  }
})();
