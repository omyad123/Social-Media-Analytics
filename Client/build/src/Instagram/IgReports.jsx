import React from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

// CSV Download
const generateCSV = (data, contentData, adsData) => {
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

  buildSection("Page Insights", data);
  buildSection("Content Insights", contentData);
  buildSection("Ad Insights", adsData);

  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "report.csv";
  a.click();
  URL.revokeObjectURL(url);
};

// PDF Download
const generatePDF = (data, contentData, adsData) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  let y = 20;

  const renderSection = (title, dataset) => {
    if (!dataset?.length) return;
    doc.setFontSize(14);
    doc.text(title, 20, y);
    y += 10;

    dataset.forEach((item) => {
      doc.setFontSize(10);
      Object.entries(item).forEach(([key, value]) => {
        doc.text(`${key}: ${Array.isArray(value) ? value.join(", ") : value}`, 20, y);
        y += 6;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      y += 6;
    });

    y += 10;
  };

  renderSection("Page Insights", data);
  renderSection("Content Insights", contentData);
  renderSection("Ad Insights", adsData);

  doc.save("report.pdf");
};

// Excel Download
const generateExcel = (data, contentData, adsData) => {
  const wb = XLSX.utils.book_new();

  if (data?.length) {
    const sheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, sheet, "Page Insights");
  }

  if (contentData?.length) {
    const sheet = XLSX.utils.json_to_sheet(contentData);
    XLSX.utils.book_append_sheet(wb, sheet, "Content Insights");
  }

  if (adsData?.length) {
    const cleanAds = adsData.map((ad) => ({
      adset_name: ad.adset_name,
      campaign_name: ad.campaign_name,
      spend: ad.metrics?.spend,
      impressions: ad.metrics?.impressions,
      reach: ad.metrics?.reach,
      ctr: ad.metrics?.ctr,
      cpc: ad.metrics?.cpc,
      gender: ad.breakdowns?.gender?.join(", "),
      age: ad.breakdowns?.age?.join(", "),
    }));
    const sheet = XLSX.utils.json_to_sheet(cleanAds);
    XLSX.utils.book_append_sheet(wb, sheet, "Ad Insights");
  }

  XLSX.writeFile(wb, "report.xlsx");
};

// Component
const IgReports = ({ data, contentData = [], adsData = [], type }) => {
  const handleDownload = () => {
    switch (type) {
      case "csv":
        generateCSV(data, contentData, adsData);
        break;
      case "pdf":
        generatePDF(data, contentData, adsData);
        break;
      case "excel":
        generateExcel(data, contentData, adsData);
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

export default IgReports;
