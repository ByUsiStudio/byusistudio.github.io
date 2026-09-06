import { useState, useMemo } from 'react';
import { useTheme } from '../context/theme';
import { useCookieRecord } from '../hooks/useCookieRecord';

export function CookieRecord() {
  const { theme } = useTheme();
  const { record, ipStatus, refreshIp, clearRecord } = useCookieRecord();
  const [expanded, setExpanded] = useState(false);

  const daysSinceFirst = useMemo(() => {
    if (!record) return 0;
    const first = new Date(record.firstVisit).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((now - first) / (1000 * 60 * 60 * 24)));
  }, [record]);

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  if (!record) return null;

  return (
    <div
      className={`cookie-record ${expanded ? 'expanded' : ''}`}
      style={
        {
          '--primary': theme.primary,
          '--primary-rgb': theme.primary.replace(/[rgb()]/g, ''),
          '--accent': theme.accent,
          '--accent-rgb': theme.accent.replace(/[rgb()]/g, ''),
        } as React.CSSProperties
      }
    >
      <button
        className="cookie-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-label="Cookie 记录"
        aria-expanded={expanded}
      >
        <i className="fas fa-cookie-bite"></i>
      </button>

      <div className="cookie-panel">
        <div className="cookie-panel-header">
          <div className="cookie-header-icon">
            <i className="fas fa-database"></i>
          </div>
          <div className="cookie-header-text">
            <h4>Cookie 记录</h4>
            <span className="cookie-subtitle">仅本地保存 · 服务器不记录</span>
          </div>
          <button className="cookie-close" onClick={() => setExpanded(false)} aria-label="收起">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="cookie-stats">
          <div className="cookie-stat-item primary-stat">
            <div className="cookie-stat-icon">
              <i className="fas fa-shoe-prints"></i>
            </div>
            <div className="cookie-stat-info">
              <span className="cookie-stat-value">{record.visitCount}</span>
              <span className="cookie-stat-label">访问次数</span>
            </div>
          </div>

          <div className="cookie-stat-item">
            <div className="cookie-stat-icon">
              <i className="fas fa-calendar-day"></i>
            </div>
            <div className="cookie-stat-info">
              <span className="cookie-stat-value">{daysSinceFirst}</span>
              <span className="cookie-stat-label">陪伴天数</span>
            </div>
          </div>
        </div>

        <div className="cookie-detail-list">
          <div
            className={`cookie-detail-row ip-row ip-${ipStatus}`}
            onClick={ipStatus === 'error' ? refreshIp : undefined}
            role={ipStatus === 'error' ? 'button' : undefined}
            title={ipStatus === 'error' ? '点击重试' : undefined}
          >
            <span className="cookie-detail-label">
              <i
                className={`fas ${ipStatus === 'loading' ? 'fa-circle-notch fa-spin' : 'fa-globe'}`}
              ></i>{' '}
              当前 IP
            </span>
            <span className="cookie-detail-value ip-value">
              {ipStatus === 'loading' && '获取中...'}
              {ipStatus === 'success' && record.ip}
              {ipStatus === 'error' && '获取失败 · 重试'}
              {ipStatus === 'idle' && '—'}
            </span>
          </div>
          <div className="cookie-detail-row">
            <span className="cookie-detail-label">
              <i className="fas fa-flag"></i> 首次访问
            </span>
            <span className="cookie-detail-value">{formatTime(record.firstVisit)}</span>
          </div>
          <div className="cookie-detail-row">
            <span className="cookie-detail-label">
              <i className="fas fa-clock"></i> 上次访问
            </span>
            <span className="cookie-detail-value">{formatTime(record.lastVisit)}</span>
          </div>
        </div>

        <div className="cookie-actions">
          <button
            className="cookie-clear-btn"
            onClick={async () => {
              const confirmed = await JCuPupw.confirm({
                title: '清除访问记录',
                content: '确定要清除本地的访问记录吗？此操作不可恢复，将重置访问次数与陪伴天数。',
                confirmText: '清除',
                cancelText: '取消',
              });
              if (!confirmed) return;
              clearRecord();
              JCuPupw.toast({
                content: '访问记录已清除',
                type: 'success',
                duration: 2500,
              });
            }}
          >
            <i className="fas fa-eraser"></i> 清除记录
          </button>
        </div>

        <div className="cookie-scan-line"></div>
      </div>
    </div>
  );
}
