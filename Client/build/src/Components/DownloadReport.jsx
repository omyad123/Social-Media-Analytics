import React from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

// CSV: Combine both datasets with section titles
const generateCSV = (data, contentData) => {
  const rows = [];

  const buildSection = (label, dataset) => {
    if (!dataset?.length) return;
    const headers = Object.keys(dataset[0]);
    rows.push(`${label}`);
    rows.push(headers.join(","));
    dataset.forEach((row) => {
      rows.push(headers.map((h) => row[h]).join(","));
    });
    rows.push(""); // blank line between sections
  };

  buildSection("Insights", data);
  buildSection("Content Insights", contentData);

  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "report.csv";
  a.click();
  URL.revokeObjectURL(url);
};

// PDF: Render both datasets under titles
const generatePDF = (data, contentData) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  let y = 20;

  const renderSection = (title, dataset) => {
    if (!dataset?.length) return;
    doc.setFontSize(14);
    doc.text(title, 20, y);
    y += 10;

    dataset.forEach((item, idx) => {
      doc.setFontSize(10);
      Object.entries(item).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 20, y);
        y += 6;
      });
      y += 4;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    y += 10;
  };

  renderSection("Insights", data);
  renderSection("Content Insights", contentData);

  doc.save("report.pdf");
};

// Excel: Add separate sheets
const generateExcel = (data, contentData) => {
  const wb = XLSX.utils.book_new();

  if (data?.length) {
    const insightsSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, insightsSheet, "Insights");
  }

  if (contentData?.length) {
    const contentSheet = XLSX.utils.json_to_sheet(contentData);
    XLSX.utils.book_append_sheet(wb, contentSheet, "Content Insights");
  }

  XLSX.writeFile(wb, "report.xlsx");
};

const DownloadReport = ({ data, contentData = [], type }) => {
  const handleDownload = () => {
    switch (type) {
      case "csv":
        generateCSV(data, contentData);
        break;
      case "pdf":
        generatePDF(data, contentData);
        break;
      case "excel":
        generateExcel(data, contentData);
        break;
      default:
        alert("Unsupported format");
    }
  };

  return (
    <button className="btn btn-primary m-1" onClick={handleDownload}>
      Download as {type.toUpperCase()}
    </button>
  );
};

export default DownloadReport;
