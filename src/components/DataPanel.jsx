import React from 'react';

/**
 * DataPanel Component
 * Presentational component that renders the state of an individual API request.
 * Supports loading, fulfilled (success), and rejected (error) states with programmatic data-testid attributes.
 */
const DataPanel = ({ title, status, data, error, endpoint, method = 'GET' }) => {
  const testIdKey = title.toLowerCase().replace(/\s/g, '');

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div data-testid={`panel-${testIdKey}-loading`} className="panel-loading-state">
            <div className="loader-orbit" aria-hidden="true"></div>
            Loading...
          </div>
        );
      case 'fulfilled':
        return (
          <div data-testid={`panel-${testIdKey}-success`} className="panel-success-state">
            <pre className="json-code-block">{JSON.stringify(data, null, 2)}</pre>
          </div>
        );
      case 'rejected':
        return (
          <div data-testid={`panel-${testIdKey}-error`} className="panel-error-state">
            <div className="error-icon-wrapper" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <p>Error: {error}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`panel panel-${testIdKey}`} data-testid={`panel-${testIdKey}`}>
      <div className="panel-header">
        <div className="panel-header-title-group">
          <span className={`status-indicator status-${status}`} aria-hidden="true"></span>
          <h3>{title}</h3>
        </div>
        <div className="panel-header-badge-group">
          {endpoint && <span className="endpoint-pill">{method} {endpoint}</span>}
          <span className={`state-pill state-${status}`}>
            {status === 'loading' && 'PENDING'}
            {status === 'fulfilled' && 'FULFILLED (200)'}
            {status === 'rejected' && 'REJECTED (404)'}
          </span>
        </div>
      </div>
      <div className="panel-body">
        {renderContent()}
      </div>
      <div className="panel-footer">
        <span className="footer-status-label">
          {status === 'loading' && 'Awaiting response...'}
          {status === 'fulfilled' && 'Rendered safely without interference'}
          {status === 'rejected' && 'Error isolated gracefully by Promise.allSettled'}
        </span>
      </div>
    </div>
  );
};

export default DataPanel;
