export const formatCurrency = (val: number | string) => {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return val.toString();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatRatio = (val: number | string) => {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return val.toString();
  return num.toFixed(2);
};

export const formatPercent = (val: number | string) => {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return val.toString();
  return `${(num * 100).toFixed(1)}%`;
};

export const formatNumber = (val: number | string) => {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return val.toString();
  return num.toLocaleString();
};
