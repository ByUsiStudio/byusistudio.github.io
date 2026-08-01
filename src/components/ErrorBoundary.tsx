import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryComponent extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
    console.error('Error Boundary caught an error:', error, errorInfo);

    try {
      const errorDesc = encodeURIComponent(error.message || '未知错误');
      const errorTitle = encodeURIComponent('应用错误');
      setTimeout(() => {
        window.location.href = `/error.html?code=500&title=${errorTitle}&desc=${errorDesc}`;
      }, 1500);
    } catch {
      setTimeout(() => {
        window.location.href = '/error.html?code=500';
      }, 1500);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.children !== this.props.children) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error }: { error: Error | null }) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="error-fallback">
      <div className="error-container">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h2>页面出错了</h2>
        <p className="error-message">{error?.message || '未知错误'}</p>
        <p className="error-hint">请刷新页面重试，或联系技术支持</p>
        <button className="retry-btn" onClick={handleRetry}>
          <i className="fas fa-redo"></i> 刷新重试
        </button>
      </div>

      <style>{`
        .error-fallback {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f8fbff;
          padding: 20px;
        }

        .error-container {
          background: #ffffff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          text-align: center;
          max-width: 500px;
          width: 100%;
        }

        .error-icon {
          width: 80px;
          height: 80px;
          background: rgba(231, 76, 60, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .error-icon i {
          color: #e74c3c;
          font-size: 40px;
        }

        .error-container h2 {
          color: #2c3e50;
          margin-bottom: 15px;
          font-size: 24px;
        }

        .error-message {
          color: #e74c3c;
          margin-bottom: 10px;
          font-size: 15px;
          word-break: break-all;
        }

        .error-hint {
          color: #666;
          margin-bottom: 30px;
          font-size: 14px;
        }

        .retry-btn {
          padding: 12px 30px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 576px) {
          .error-container {
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
}

export function ErrorBoundary({ children }: Props) {
  return <ErrorBoundaryComponent>{children}</ErrorBoundaryComponent>;
}