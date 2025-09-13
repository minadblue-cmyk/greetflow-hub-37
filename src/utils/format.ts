/**
 * Normalize string for comparison (remove accents, lowercase, clean spaces)
 */
export const norm = (s: any): string => {
  return String(s ?? '')
    .replace(/_/g, ' ')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Pretty format string (title case, clean spaces)
 */
export const pretty = (s: string): string => {
  return s
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w ? w[0].toUpperCase() + w.slice(1) : w)
    .join(' ');
};

/**
 * Format CNPJ with mask
 */
export const formatCNPJ = (cnpj: string): string => {
  const numbers = cnpj.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Format phone number
 */
export const formatPhone = (phone: string): string => {
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

/**
 * Normalize API response - convert single object to array
 */
export const normalizeToArray = <T>(data: T | T[]): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  return data ? [data] : [];
};

/**
 * Normalize API response with items property
 */
export const normalizeResponseWithItems = <T>(response: { items?: T[] } | T[]): T[] => {
  if (Array.isArray(response)) {
    return response;
  }
  return response?.items || [];
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Extract file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Check if file is Excel format
 */
export const isExcelFile = (filename: string): boolean => {
  const extension = getFileExtension(filename);
  return ['xls', 'xlsx'].includes(extension);
};