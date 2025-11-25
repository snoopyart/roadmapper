import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const PREVIEW_ELEMENT_ID = 'roadmap-preview';

async function getPreviewElement(): Promise<HTMLElement> {
  const element = document.getElementById(PREVIEW_ELEMENT_ID);
  if (!element) {
    throw new Error('Preview element not found');
  }
  return element;
}

export async function exportToPNG(): Promise<void> {
  const element = await getPreviewElement();

  const canvas = await html2canvas(element, {
    scale: 2, // Higher resolution for better quality
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
  });

  const link = document.createElement('a');
  link.download = `roadmap-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportToPDF(): Promise<void> {
  const element = await getPreviewElement();

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/png');

  // A4 dimensions in mm
  const a4Width = 210;
  const a4Height = 297;
  const margin = 15;

  const contentWidth = a4Width - margin * 2;
  const contentHeight = a4Height - margin * 2;

  // Calculate dimensions to fit within A4 while maintaining aspect ratio
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);

  const finalWidth = imgWidth * ratio;
  const finalHeight = imgHeight * ratio;

  // Center the image on the page
  const xOffset = margin + (contentWidth - finalWidth) / 2;
  const yOffset = margin;

  const pdf = new jsPDF({
    orientation: finalWidth > finalHeight ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
  pdf.save(`roadmap-${Date.now()}.pdf`);
}

export function printRoadmap(): void {
  window.print();
}
