async function downloadPDF() {
  const response = await fetch('/pdf');
  const pdfBytes = await response.arrayBuffer();
  const pdfBlob = new Blob([pdfBytes]);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'example.pdf';
  link.click();
  URL.revokeObjectURL(url);
}
