export const formatSoles = (n, decimals = 0) =>
  `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
