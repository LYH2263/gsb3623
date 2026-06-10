function pickFirstDetail(details) {
  if (!details || typeof details !== 'object') return '';
  if (typeof details.detail === 'string' && details.detail) return details.detail;

  const keys = Object.keys(details);
  for (const key of keys) {
    const value = details[key];
    if (Array.isArray(value) && value.length) {
      return `${key}: ${String(value[0])}`;
    }
    if (typeof value === 'string' && value) {
      return `${key}: ${value}`;
    }
  }

  return '';
}

export function getErrorMessage(error, fallback = '请求失败，请稍后重试') {
  const responseData = error?.response?.data;
  const detailMessage = pickFirstDetail(responseData?.details);

  return detailMessage || responseData?.message || error?.message || fallback;
}
