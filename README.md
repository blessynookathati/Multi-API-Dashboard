# Multi-API Dashboard

A resilient, modern React dashboard that fetches data from three independent APIs concurrently using `Promise.allSettled`. This architecture eliminates single points of failure (SPOFs) in frontend data aggregation, ensuring that slow, degraded, or failing microservices do not cascade and compromise the entire user interface.

---

## Architecture & System Design

Modern web applications frequently aggregate data from independent microservices and third-party APIs. A fundamental challenge is resilience: if one service encounters an outage or returns an HTTP error, sister services should remain responsive and visible.

### Component Hierarchy
- **`App`**: Root entry component that renders the application container.
- **`DataDashboard`**: The smart container component. Manages data fetching concurrency via `Promise.allSettled`, lifecycle state management (`loading`, `fulfilled`, `rejected`), latency metrics, and user interactions (manual refetch).
- **`DataPanel`**: A modular presentational component that conditionally renders one of three states (`loading`, `fulfilled`, or `rejected`) based on strict props and exposes deterministic `data-testid` attributes for automated testing.

### External Endpoints
1. **User Data**: `https://jsonplaceholder.typicode.com/users/1` (Reliable user profile service)
2. **Random Public API**: `https://api.publicapis.org/random` (Public API directory service)
3. **Failing Endpoint**: `https://jsonplaceholder.typicode.com/posts/invalid-endpoint` (Deterministic 404 endpoint demonstrating graceful degradation)

---

## Setup and Running Instructions

Follow these instructions to set up, build, and run the project locally.

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Installation
Clone or navigate to the project root directory and install dependencies:
```bash
npm install
```

### 2. Running the Development Server
Start the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` (or the local URL printed in your terminal).

### 3. Production Build
Create an optimized production bundle:
```bash
npm run build
```
The compiled assets will be output to the `dist/` directory.

### 4. Preview Production Build
Preview the generated production build locally:
```bash
npm run preview
```

### 5. Running Lint Checks
Run the static code analysis with Oxlint:
```bash
npm run lint
```

---

## Promise.all vs. Promise.allSettled Analysis

Asynchronous concurrency in modern JavaScript offers two primary primitives for handling parallel operations: `Promise.all` and `Promise.allSettled`. Selecting the correct primitive directly determines whether an application is brittle or fault-tolerant.

### 1. Core Behavioral Differences

| Characteristic | `Promise.all(promises)` | `Promise.allSettled(promises)` |
| :--- | :--- | :--- |
| **Execution Paradigm** | Fail-Fast / All-or-Nothing | Wait-for-All / Exhaustive Settlement |
| **Rejection Handling** | Rejects immediately upon the *first* rejection | **Never rejects**; always fulfills once all promises settle |
| **Fulfillment Value** | Array of raw values: `[v1, v2, ...]` | Array of outcome objects: `[{ status, value }, { status, reason }]` |
| **Information Retention** | Discards results of pending/fulfilled siblings if any promise fails | Retains the exact outcome of every single promise |
| **UI Blast Radius** | Global failure (blank screen, crash, or global error banner) | Isolated failure (failed component shows error; siblings render data) |
| **Best Use Case** | Atomic, interdependent operations (e.g., checkout + payment) | Data aggregation dashboards, widgets, home feeds, analytics |

### 2. The Danger of `Promise.all` in Aggregation Dashboards

When an application uses `Promise.all` to fetch data for independent dashboard panels:
```javascript
// NAIVE IMPLEMENTATION - HIGH RISK OF GLOBAL OUTAGE
try {
  const [userData, randomApiData, failingData] = await Promise.all([
    fetchUserData(),
    fetchRandomApiData(),
    fetchFailingApiData(), // Throws 404
  ]);
  // THIS LINE IS NEVER REACHED
  renderDashboard(userData, randomApiData, failingData);
} catch (error) {
  // Cascading failure: all panels remain blank or show a global error
  showGlobalErrorNotification(error.message);
}
```

In this model, the failure of a non-critical endpoint (such as an invalid analytics or recommendations endpoint) brings down the entire dashboard. The user cannot see their primary user data even though that backend service is 100% healthy.

### 3. Fault-Tolerant Aggregation with `Promise.allSettled`

`Promise.allSettled` ensures that every promise completes its lifecycle regardless of whether other operations succeed or fail:
```javascript
// RESILIENT ARCHITECTURE - ZERO SINGLE POINT OF FAILURE
const results = await Promise.allSettled([
  fetchUserData(),
  fetchRandomApiData(),
  fetchFailingApiData(),
]);

// results array contains:
// [
//   { status: 'fulfilled', value: { id: 1, name: 'Leanne Graham', ... } },
//   { status: 'fulfilled', value: { API: '...', Link: '...' } },
//   { status: 'rejected', reason: Error('HTTP error! status: 404') }
// ]

// Process each result independently
const dashboardState = {
  user: processResult(results[0]),
  randomApi: processResult(results[1]),
  failingApi: processResult(results[2]),
};
```

### 4. Key Takeaways & Architectural Decisions

1. **Failure Isolation (Blast Radius Minimization)**: By mapping each outcome object to individual component props, errors are isolated directly to the affected panel.
2. **Unified State Transition**: A single state update is triggered after all promises settle, preventing layout shifts, flickering spinners, and intermediate re-renders.
3. **Optimal User Experience**: Users retain access to all available functional data while being clearly informed about which specific service is temporarily unavailable.

---

## Verification & Automated Test IDs

The components provide explicit `data-testid` attributes corresponding to each panel and lifecycle phase:

### 1. Initial Loading State
- User Data Panel: `data-testid="panel-userdata-loading"` (Contains text `"Loading..."`)
- Random Public API Panel: `data-testid="panel-randompublicapi-loading"` (Contains text `"Loading..."`)
- Failing Request Panel: `data-testid="panel-failingrequest-loading"` (Contains text `"Loading..."`)

### 2. Settled State (Success & Graceful Error)
- User Data Panel: `data-testid="panel-userdata"`
  - Success container: `data-testid="panel-userdata-success"` (Contains `"name": "Leanne Graham"`)
- Random Public API Panel: `data-testid="panel-randompublicapi"`
  - Success container: `data-testid="panel-randompublicapi-success"` (Contains valid JSON with keys `"API"` and `"Link"`)
- Failing Request Panel: `data-testid="panel-failingrequest"`
  - Error container: `data-testid="panel-failingrequest-error"` (Contains text `"Error:"`)
