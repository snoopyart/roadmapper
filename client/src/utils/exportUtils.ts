import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

const PREVIEW_ELEMENT_ID = 'roadmap-preview';

async function getPreviewElement(): Promise<HTMLElement> {
  const element = document.getElementById(PREVIEW_ELEMENT_ID);
  if (!element) {
    throw new Error('Preview element not found');
  }
  return element;
}

// Common html2canvas options for consistent export rendering
const getCanvasOptions = (_element: HTMLElement) => ({
  scale: 2, // Higher resolution for better quality
  backgroundColor: '#ffffff',
  logging: false,
  useCORS: true,
  allowTaint: true,
  onclone: (clonedDoc: Document) => {
    const clonedElement = clonedDoc.getElementById(PREVIEW_ELEMENT_ID);
    if (clonedElement) {
      // Reset any transforms and ensure full content is visible
      clonedElement.style.transform = 'none';
      clonedElement.style.overflow = 'visible';

      // Reset transforms on all children that might be scaled
      const scaledChildren = clonedElement.querySelectorAll('[style*="scale"]');
      scaledChildren.forEach((child) => {
        if (child instanceof HTMLElement) {
          child.style.transform = 'none';
        }
      });

      // Ensure overflow is visible on timeline container
      const timelineContainers = clonedElement.querySelectorAll('.overflow-hidden');
      timelineContainers.forEach((container) => {
        if (container instanceof HTMLElement) {
          container.style.overflow = 'visible';
        }
      });
    }
  },
});

export async function exportToPNG(): Promise<void> {
  const element = await getPreviewElement();

  const options = getCanvasOptions(element);
  // Add padding to prevent edge cutoff
  const originalOnclone = options.onclone;
  options.onclone = (clonedDoc: Document) => {
    originalOnclone(clonedDoc);
    const clonedElement = clonedDoc.getElementById(PREVIEW_ELEMENT_ID);
    if (clonedElement) {
      // Add extra padding for export to prevent cutoff
      clonedElement.style.padding = '24px';
    }
  };

  const canvas = await html2canvas(element, options);

  const link = document.createElement('a');
  link.download = `roadmap-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportToPDF(): Promise<void> {
  const element = await getPreviewElement();

  const options = getCanvasOptions(element);
  // Add padding to prevent edge cutoff
  const originalOnclone = options.onclone;
  options.onclone = (clonedDoc: Document) => {
    originalOnclone(clonedDoc);
    const clonedElement = clonedDoc.getElementById(PREVIEW_ELEMENT_ID);
    if (clonedElement) {
      // Add extra padding for export to prevent cutoff
      clonedElement.style.padding = '24px';
    }
  };

  const canvas = await html2canvas(element, options);

  const imgData = canvas.toDataURL('image/png');

  // Determine orientation based on image aspect ratio
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const isLandscape = imgWidth > imgHeight;

  // A4 dimensions in mm (swap for landscape)
  const margin = 15;
  const pageWidth = isLandscape ? 297 : 210;
  const pageHeight = isLandscape ? 210 : 297;

  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  // Calculate dimensions to fit within page while maintaining aspect ratio
  const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);

  const finalWidth = imgWidth * ratio;
  const finalHeight = imgHeight * ratio;

  // Center the image on the page (both horizontally and vertically)
  const xOffset = margin + (contentWidth - finalWidth) / 2;
  const yOffset = margin + (contentHeight - finalHeight) / 2;

  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
  pdf.save(`roadmap-${Date.now()}.pdf`);
}

export function printRoadmap(): void {
  window.print();
}
