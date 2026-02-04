
/**
 * Utility for exporting data to Word and Excel formats
 * Specialized for Vietnamese characters and internal network environments
 */

export const exportToExcel = (data: any[], filename: string, headers: string[]) => {
  // Add UTF-8 BOM for Excel to recognize Vietnamese characters correctly
  const BOM = '\uFEFF';
  let csvContent = BOM + headers.join(',') + '\n';
  
  data.forEach(row => {
    const rowValues = row.map((val: any) => {
      // Escape quotes and wrap in quotes for CSV safety
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvContent += rowValues.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToWord = (htmlContent: string, filename: string) => {
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Export</title>
    <style>
      body { font-family: 'Times New Roman', serif; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid black; padding: 5px; text-align: left; }
      .header-text { text-align: center; font-weight: bold; }
    </style>
    </head><body>`;
  const footer = "</body></html>";
  const sourceHTML = header + htmlContent + footer;
  
  const blob = new Blob(['\ufeff', sourceHTML], {
    type: 'application/msword'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
