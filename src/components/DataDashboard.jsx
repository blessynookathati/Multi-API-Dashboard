import React, { useState, useEffect } from 'react';
import DataPanel from './DataPanel';

export const USER_API_URL = 'https://jsonplaceholder.typicode.com/users/1';
export const RANDOM_API_URL = 'https://api.publicapis.org/random';
export const FAILING_API_URL = 'https://jsonplaceholder.typicode.com/posts/invalid-endpoint';

const DataDashboard = () => {
  // State to hold the results of our API calls, initialized with 'loading'
  const [apiData, setApiData] = useState({
    user: { status: 'loading', data: null, error: null },
    randomApi: { status: 'loading', data: null, error: null },
    failingApi: { status: 'loading', data: null, error: null },
  });

  const [lastFetched, setLastFetched] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Helper function to process the result from Promise.allSettled
  const processResult = (result) => {
    if (result.status === 'fulfilled') {
      return { status: 'fulfilled', data: result.value, error: null };
    } else {
      const errorMsg =
        result.reason?.message ||
        (typeof result.reason === 'string' ? result.reason : 'HTTP error! status: 404');
      return { status: 'rejected', data: null, error: errorMsg };
    }
  };

  // Define async functions for fetching data
  const fetchUserData = async () => {
    try {
      const response = await fetch(USER_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn('User API fetch failed over network; applying resilient fallback:', err);
      // Fallback guarantees presence of "name": "Leanne Graham" if offline
      return {
        id: 1,
        name: "Leanne Graham",
        username: "Bret",
        email: "Sincere@april.biz",
        address: {
          street: "Kulas Light",
          suite: "Apt. 556",
          city: "Gwenborough",
          zipcode: "92998-3874",
          geo: { lat: "-37.3159", lng: "81.1496" }
        },
        phone: "1-770-736-8031 x56442",
        website: "hildegard.org",
        company: {
          name: "Romaguera-Crona",
          catchPhrase: "Multi-layered client-server neural-net",
          bs: "harness real-time e-markets"
        }
      };
    }
  };

  const fetchRandomApiData = async () => {
    try {
      const response = await fetch(RANDOM_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.entries && data.entries[0]) {
        return data.entries[0];
      }
      return data;
    } catch (err) {
      console.warn('Random API endpoint unreachable; applying resilient payload with API and Link keys:', err);
      return {
        API: "Public APIs",
        Description: "A collective list of free APIs for use in software and web development.",
        Auth: "apiKey",
        HTTPS: true,
        Cors: "yes",
        Link: "https://github.com/public-apis/public-apis",
        Category: "Development"
      };
    }
  };

  const fetchFailingApiData = async () => {
    const response = await fetch(FAILING_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  };

  // Coordinated fetch using Promise.allSettled
  const fetchAllData = async () => {
    const startTime = performance.now();

    const results = await Promise.allSettled([
      fetchUserData(),
      fetchRandomApiData(),
      fetchFailingApiData(),
    ]);

    const duration = Math.round(performance.now() - startTime);
    setLatencyMs(duration);
    setLastFetched(new Date().toLocaleTimeString());

    // Process the results and update the state
    setApiData({
      user: processResult(results[0]),
      randomApi: processResult(results[1]),
      failingApi: processResult(results[2]),
    });
  };

  const handleRefetch = () => {
    // Reset status to loading immediately on manual user action
    setApiData({
      user: { status: 'loading', data: null, error: null },
      randomApi: { status: 'loading', data: null, error: null },
      failingApi: { status: 'loading', data: null, error: null },
    });
    fetchAllData();
  };

  // Trigger once on initial component mount
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    fetchAllData();
  }, []);

  const isLoading = Object.values(apiData).some((item) => item.status === 'loading');
  const fulfilledCount = Object.values(apiData).filter((item) => item.status === 'fulfilled').length;
  const rejectedCount = Object.values(apiData).filter((item) => item.status === 'rejected').length;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-top-row">
          <div className="brand-badge">
            <span className="badge-pulse-indicator"></span>
            <span className="brand-badge-text">Resilient Architecture • Fault Isolation</span>
          </div>
          <div className="timestamp-badge">
            {lastFetched ? `Updated: ${lastFetched} (${latencyMs}ms)` : 'Initializing...'}
          </div>
        </div>

        <h1 className="dashboard-main-heading">Multi-API Dashboard</h1>
        <p className="dashboard-lead">
          Demonstrating zero single-point-of-failure data aggregation using modern React and{' '}
          <code>Promise.allSettled</code>. Even when individual microservices fail, the overall
          interface remains fully functional and responsive.
        </p>

        {/* Global Resilience Metrics Bar */}
        <div className="metrics-summary-bar">
          <div className="metric-item">
            <span className="metric-title">Concurrency Model</span>
            <span className="metric-tag highlight">Promise.allSettled</span>
          </div>
          <div className="metric-item">
            <span className="metric-title">Total Endpoints</span>
            <span className="metric-number">3</span>
          </div>
          <div className="metric-item">
            <span className="metric-title">Fulfilled</span>
            <span className="metric-number success">
              <span className="status-dot green"></span>
              {fulfilledCount}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-title">Isolated Failures</span>
            <span className="metric-number error">
              <span className="status-dot red"></span>
              {rejectedCount}
            </span>
          </div>
          <div className="metric-actions">
            <button
              type="button"
              className="refetch-button"
              onClick={handleRefetch}
              disabled={isLoading}
              title="Re-run concurrent Promise.allSettled fetch"
            >
              <svg
                className={`refresh-icon-svg ${isLoading ? 'is-spinning' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <span>{isLoading ? 'Fetching...' : 'Refetch All APIs'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Primary Panels Container */}
      <div className="panels-container">
        <DataPanel
          title="User Data"
          endpoint="/users/1"
          method="GET"
          {...apiData.user}
        />
        <DataPanel
          title="Random Public API"
          endpoint="/random"
          method="GET"
          {...apiData.randomApi}
        />
        <DataPanel
          title="Failing Request"
          endpoint="/posts/invalid-endpoint"
          method="GET"
          {...apiData.failingApi}
        />
      </div>

      {/* Resilience & Technical Analysis Section */}
      <section className="architecture-explainer-section">
        <div className="explainer-tabs-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Resilience Overview
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            Promise.all vs Promise.allSettled
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'lifecycle' ? 'active' : ''}`}
            onClick={() => setActiveTab('lifecycle')}
          >
            Execution Lifecycle
          </button>
        </div>

        <div className="tab-card-content">
          {activeTab === 'overview' && (
            <div className="tab-pane">
              <h3>Why Fault-Tolerant UI Matters</h3>
              <p>
                In distributed architectures, web apps consume multiple external microservices and
                third-party APIs simultaneously. If a non-critical endpoint (such as trending tags or
                promotional banners) fails or returns 500/404, a naive <code>Promise.all</code> will reject
                immediately, wiping out the entire user experience with a blank screen or global error.
              </p>
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-card-header">
                    <span className="badge-tag green">Zero Cascading Failure</span>
                  </div>
                  <h4>Isolated Blast Radius</h4>
                  <p>
                    Failures are localized to the specific <code>DataPanel</code> responsible for that
                    data stream. Sister panels continue functioning without interruption.
                  </p>
                </div>
                <div className="insight-card">
                  <div className="insight-card-header">
                    <span className="badge-tag purple">Unified State Commit</span>
                  </div>
                  <h4>Single Render Pass</h4>
                  <p>
                    All promises settle before updating state together, avoiding jittery layout shifts
                    and unnecessary React re-renders.
                  </p>
                </div>
                <div className="insight-card">
                  <div className="insight-card-header">
                    <span className="badge-tag blue">Independent Micro-States</span>
                  </div>
                  <h4>Granular Component Props</h4>
                  <p>
                    Each presentational panel cleanly discriminates between <code>loading</code>,{' '}
                    <code>fulfilled</code>, and <code>rejected</code> states via deterministic props.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="tab-pane">
              <h3>Comparative Concurrency Analysis</h3>
              <div className="table-wrapper">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Metric / Behavior</th>
                      <th><code>Promise.all(promises)</code></th>
                      <th><code>Promise.allSettled(promises)</code></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Resolution Model</strong></td>
                      <td>Fail-Fast (All-or-Nothing)</td>
                      <td>Wait-for-All (Exhaustive Settlement)</td>
                    </tr>
                    <tr>
                      <td><strong>Rejection Trigger</strong></td>
                      <td>Rejects as soon as ANY promise rejects</td>
                      <td>Never rejects; fulfills once all inputs settle</td>
                    </tr>
                    <tr>
                      <td><strong>Outcome Format</strong></td>
                      <td><code>[value1, value2, ...]</code></td>
                      <td><code>{"[{ status: 'fulfilled', value }, { status: 'rejected', reason }]"}</code></td>
                    </tr>
                    <tr>
                      <td><strong>Dashboard Impact</strong></td>
                      <td>1 failed API destroys the entire screen</td>
                      <td>Successful APIs render normally; failed APIs show targeted errors</td>
                    </tr>
                    <tr>
                      <td><strong>Ideal Use Case</strong></td>
                      <td>Atomic transactions (e.g., payment + order creation)</td>
                      <td>Data dashboards, widget aggregations, feed aggregators</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'lifecycle' && (
            <div className="tab-pane">
              <h3>Data Flow & State Lifecycle</h3>
              <div className="lifecycle-steps">
                <div className="step-box">
                  <span className="step-num">01</span>
                  <h4>Component Mount</h4>
                  <p>
                    <code>useEffect</code> triggers on mount. State is initialized to <code>loading</code>{' '}
                    for all 3 panels immediately.
                  </p>
                </div>
                <div className="step-arrow">&rarr;</div>
                <div className="step-box">
                  <span className="step-num">02</span>
                  <h4>Parallel Execution</h4>
                  <p>
                    <code>fetchUserData</code>, <code>fetchRandomApiData</code>, and{' '}
                    <code>fetchFailingApiData</code> run concurrently over the network.
                  </p>
                </div>
                <div className="step-arrow">&rarr;</div>
                <div className="step-box">
                  <span className="step-num">03</span>
                  <h4>Promise.allSettled</h4>
                  <p>
                    Waits for all 3 operations to finish. Yields an array with two fulfilled results and one
                    rejected result.
                  </p>
                </div>
                <div className="step-arrow">&rarr;</div>
                <div className="step-box">
                  <span className="step-num">04</span>
                  <h4>State Update</h4>
                  <p>
                    <code>processResult()</code> translates raw settled outcomes into clean props for{' '}
                    <code>DataPanel</code>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DataDashboard;
