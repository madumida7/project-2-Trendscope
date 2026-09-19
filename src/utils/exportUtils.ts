import { Dataset, PredictionInsight } from '../types';

/**
 * Exports raw dataset as downloadable CSV
 */
export function exportToCSV(dataset: Dataset): void {
  if (!dataset.data || dataset.data.length === 0) return;

  const headers = Object.keys(dataset.data[0]);
  const csvRows: string[] = [];

  // Header row
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  // Data rows
  dataset.data.forEach((row) => {
    const values = headers.map((header) => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${dataset.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_export.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports predictions summary as JSON
 */
export function exportPredictionsJSON(dataset: Dataset, predictions: PredictionInsight[]): void {
  const exportPayload = {
    platform: 'TrendScope Predictive Engine',
    exportedAt: new Date().toISOString(),
    dataset: {
      id: dataset.id,
      name: dataset.name,
      category: dataset.category,
      rowCount: dataset.rowCount,
    },
    predictions,
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${dataset.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_predictions.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a canvas element as high-resolution PNG image
 */
export function downloadCanvasAsImage(canvasId: string, filename: string = 'trendscope_chart.png'): boolean {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return false;

  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Failed to export chart image:', err);
    return false;
  }
}
