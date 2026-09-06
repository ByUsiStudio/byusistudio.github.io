/**
 * 将 ISO 时间串格式化为相对时间文案（与“今天”/“昨天”/“N天前”等同口径）。
 * 调用方可在结果后追加“更新”等后缀。
 */
export function relativeTimeText(updatedAt: string): string {
  const updatedDate = new Date(updatedAt);
  if (Number.isNaN(updatedDate.getTime())) return '';
  const timeDiff = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
  if (timeDiff === 0) return '今天';
  if (timeDiff === 1) return '昨天';
  if (timeDiff < 7) return `${timeDiff}天前`;
  if (timeDiff < 30) return `${Math.floor(timeDiff / 7)}周前`;
  if (timeDiff < 365) return `${Math.floor(timeDiff / 30)}个月前`;
  return `${Math.floor(timeDiff / 365)}年前`;
}
