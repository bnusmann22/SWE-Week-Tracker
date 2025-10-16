Converting your full-page HTML/JavaScript dashboard into a React and Vite project involves breaking down the structure and logic into components and managing the data within React's state management.

Since the original code is a single file with embedded data, styles, and logic, the React conversion will organize these into separate files for better maintainability.

Here is a step-by-step guide and the file structure you'd use for the React + Vite project.

## 📁 Project Structure

```
swe-financial-tracker/
├── node_modules/
├── src/
│ ├── components/
│ │ ├── SummaryCards.jsx      // The top 3 summary metrics
│ │ ├── ProcurementTable.jsx  // The main interactive log table
│ │ ├── UnpricedList.jsx      // The list of items needing quotes
│ ├── data/
│ │ ├── initialData.js        // Contains the initialData array
│ ├── App.jsx                 // Main component combining all parts
│ ├── index.css               // Tailwind-based styles
├── tailwind.config.js        // Custom Tailwind config
├── index.html                // Vite entry point
├── package.json
└── vite.config.js
```

-----

## 1\. Setup the Vite Project

First, set up your React and Tailwind environment using Vite.

1.  **Create the Vite Project:**

    ```bash
    npm create vite@latest swe-financial-tracker -- --template react
    cd swe-financial-tracker
    ```

2.  **Install Dependencies (Tailwind CSS):**

    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```

3.  **Update `tailwind.config.js` and `index.css`:**

      * Replace the generated `tailwind.config.js` content with your custom theme:

        ```javascript
        /** @type {import('tailwindcss').Config} */
        export default {
          content: [
            "./index.html",
            "./src/**/*.{js,ts,jsx,tsx}",
          ],
          theme: {
            extend: {
              colors: {
                'primary-blue': '#105652',
                'secondary-gold': '#ffcc00',
                'accent-green': '#34d399',
                'dark-gray': '#1f2937',
              },
              fontFamily: {
                sans: ['Inter', 'sans-serif'],
              }
            },
          },
          plugins: [],
        }
        ```

      * Replace the content of `src/index.css` with Tailwind directives and your custom body styles:

        ```css
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

        @tailwind base;
        @tailwind components;
        @tailwind utilities;

        /* Custom Styles from original <style> block */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f7f9fb;
        }
        .summary-card {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
            transition: transform 0.2s;
        }
        .summary-card:hover {
            transform: translateY(-2px);
        }
        th, td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background-color: #f3f4f6;
            font-weight: 600;
            color: #374151;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        .checkbox-cell {
            width: 40px;
            text-align: center;
        }
        .table-container {
            max-height: 70vh; /* Limits table height for better visibility */
            overflow-y: auto;
        }
        ```

-----

## 2\. Create Data and Utility Files

### `src/utils/helpers.js`

```javascript
export function formatCurrency(amount) {
    if (amount === 'N/A') return 'N/A';
    if (typeof amount !== 'number') return 'Error';
    return '₦' + amount.toLocaleString('en-US');
}

export function calculateMetrics(data) {
    let totalConfirmedBudget = 0;
    let unpricedItems = [];
    const costsByType = {};

    data.forEach(item => {
        // 1. Calculate Total Confirmed Budget (Excluding 'N/A' and designated Summary/Budget lines)
        if (typeof item.cost === 'number' && !item.excludeFromSum) {
            totalConfirmedBudget += item.cost;
        }
        
        // 2. Identify Unpriced Items
        if (item.status === 'Unpriced') {
            unpricedItems.push(item);
        }

        // 3. Group Costs by Event Phase
        const phase = item.event;
        if (!costsByType[phase]) {
            costsByType[phase] = { total: 0, items: [] };
        }
        if (typeof item.cost === 'number' && !item.excludeFromSum) {
            costsByType[phase].total += item.cost;
        }
        costsByType[phase].items.push(item);
    });

    // Calculate Top 3 Cost Groupings
    const sortedCosts = Object.entries(costsByType)
        .filter(([key, value]) => !key.includes('Summary') && !key.includes('Budget') && value.total > 0)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 3);
    
    const top3CostGroupings = sortedCosts.map(([phase, data]) => ({
        phase,
        total: data.total
    }));

    return { totalConfirmedBudget, unpricedItems, top3CostGroupings };
}
```

### `src/data/initialData.js`

Copy the original `initialData` array into this file.

```javascript
// src/data/initialData.js
export const initialData = [
    // JAVINEER Hackathon (1.x)
    { id: '1.1', type: 'Procurement', description: 'Daily Stand-Up Setup', event: 'JAVINEER Setup', cost: 8000, costType: 'CAPEX', status: 'Priced', done: false },
    // ... [Insert all 55 objects from your original initialData array here]
    // ...
    { id: '7.8', type: 'Procurement', description: 'GitHub Repository Setup (Digital platform)', event: 'Py-Kathon Tech', cost: 'N/A', costType: 'OPEX', status: 'Unpriced', done: false },
];
```

-----

## 3\. Create React Components

### `src/components/UnpricedList.jsx`

```jsx
// src/components/UnpricedList.jsx
import React from 'react';

const UnpricedList = ({ unpricedItems }) => {
    return (
        <div className="bg-white rounded-xl p-6 mb-12 summary-card">
            <h2 className="text-2xl font-bold text-dark-gray mb-4 border-b pb-2">
                Required Procurement Items Needing Quotes ({unpricedItems.length} Items)
            </h2>
            <ul id="unpriced-list" className="list-disc list-inside space-y-1 text-gray-700">
                {unpricedItems.map(item => (
                    <li key={item.id} className="text-sm">
                        <span className="font-semibold text-primary-blue">{item.id}</span>: {item.description} ({item.event})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UnpricedList;
```

### `src/components/SummaryCards.jsx`

```jsx
// src/components/SummaryCards.jsx
import React from 'react';
import { formatCurrency } from '../utils/helpers';

const SummaryCards = ({ metrics }) => {
    const { totalConfirmedBudget, unpricedItems, top3CostGroupings } = metrics;

    let groupedHtml = (
        <p className="text-sm text-gray-500">No priced line items found.</p>
    );

    if (top3CostGroupings.length > 0) {
        groupedHtml = (
            <>
                <p className="text-sm font-medium text-gray-500 uppercase">Top 3 Cost Groupings</p>
                {top3CostGroupings.map(({ phase, total }) => (
                    <React.Fragment key={phase}>
                        <p className="text-xl font-bold text-dark-gray mt-1">{formatCurrency(total)}</p>
                        <p className="text-xs text-gray-500 mb-2">{phase}</p>
                    </React.Fragment>
                ))}
            </>
        );
    }
    
    return (
        <div id="summary-section" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Card 1: Total Confirmed Budget */}
            <div className="summary-card bg-primary-blue text-white rounded-xl p-6">
                <p className="text-sm font-medium opacity-80 uppercase">Total Confirmed Line-Item Budget</p>
                <h3 className="text-3xl font-extrabold mt-1">{formatCurrency(totalConfirmedBudget)}</h3>
                <p className="text-xs opacity-70 mt-2">Excludes high-level budget estimates and revenue.</p>
            </div>

            {/* Card 2: Cost Grouping */}
            <div className="summary-card bg-white rounded-xl p-6">
                {groupedHtml}
            </div>

            {/* Card 3: Summary of Unpriced/Labor Items */}
            <div className="summary-card bg-white rounded-xl p-6">
                <p className="text-sm font-medium text-gray-500 uppercase">Unpriced Items (Quotes Needed)</p>
                <h3 className="text-3xl font-extrabold text-red-500 mt-1">{unpricedItems.length}</h3>
                <p className="text-xs text-gray-500 mt-2">Labor/Stipend & Procurement items without a price.</p>
            </div>
        </div>
    );
};

export default SummaryCards;
```

### `src/components/ProcurementTable.jsx`

```jsx
// src/components/ProcurementTable.jsx
import React from 'react';
import { formatCurrency } from '../utils/helpers';

const ProcurementTable = ({ data, handleFilterChange, handleExport, handleToggleDone }) => {

    const getCostTypeClass = (costType) => {
        if (costType === 'CAPEX') return 'bg-blue-100 text-blue-800';
        if (costType === 'Revenue') return 'bg-green-100 text-green-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center bg-white rounded-xl p-4 shadow-md">
                <h2 className="text-2xl font-bold text-dark-gray mb-4 md:mb-0">Interactive Procurement Log ({data.length} Items)</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select id="filter-type" onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-lg text-sm">
                        <option value="All">Filter by Type (All)</option>
                        <option value="Procurement">Procurement</option>
                        <option value="Cost Projection">Cost Projection</option>
                        <option value="Labor/Stipend">Labor/Stipend</option>
                        <option value="Revenue">Revenue</option>
                    </select>
                    <select id="filter-cost" onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-lg text-sm">
                        <option value="All">Filter by Cost Status (All)</option>
                        <option value="Priced">Priced (₦)</option>
                        <option value="Unpriced">Unpriced (N/A)</option>
                    </select>
                    <button 
                        id="export-btn" 
                        onClick={handleExport}
                        className="bg-accent-green hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md focus:outline-none focus:ring-4 focus:ring-accent-green/50"
                    >
                        Export Log to CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
                <div className="table-container">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="checkbox-cell">Done</th>
                                <th>ID</th>
                                <th>Description</th>
                                <th>Event Phase</th>
                                <th>Cost Type</th>
                                <th>Projected Cost (₦)</th>
                            </tr>
                        </thead>
                        <tbody id="procurement-log" className="divide-y divide-gray-100">
                            {data.map(item => (
                                <tr 
                                    key={item.id} 
                                    className={`${item.cost === 'N/A' ? 'bg-yellow-50/50 hover:bg-yellow-50' : 'hover:bg-gray-50'}`}
                                >
                                    <td className="checkbox-cell">
                                        <input 
                                            type="checkbox" 
                                            onChange={(e) => handleToggleDone(item.id, e.target.checked)} 
                                            className="h-5 w-5 text-accent-green rounded border-gray-300 focus:ring-accent-green" 
                                            defaultChecked={item.done}
                                        />
                                    </td>
                                    <td className="font-mono text-xs text-gray-500">{item.id}</td>
                                    <td className="font-medium text-gray-900 w-2/5">{item.description}</td>
                                    <td className="text-sm text-gray-600">{item.event}</td>
                                    <td>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCostTypeClass(item.costType)}`}>
                                            {item.costType}
                                        </span>
                                    </td>
                                    <td className={`text-sm font-semibold ${item.status === 'Unpriced' ? 'text-red-500' : 'text-primary-blue'}`}>
                                        {formatCurrency(item.cost)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ProcurementTable;
```

-----

## 4\. Main Application Component (`src/App.jsx`)

This component will manage the application state, filtering logic, and export functionality.

```jsx
// src/App.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { initialData as rawInitialData } from './data/initialData';
import { calculateMetrics } from './utils/helpers';
import SummaryCards from './components/SummaryCards';
import UnpricedList from './components/UnpricedList';
import ProcurementTable from './components/ProcurementTable';

function App() {
    // State for the full, mutable data
    const [data, setData] = useState(rawInitialData);
    // State for the filters
    const [filters, setFilters] = useState({ type: 'All', cost: 'All' });

    // Memoized computation for the dashboard metrics
    const metrics = useMemo(() => calculateMetrics(data), [data]);
    
    // Filtering logic (returns the data to be displayed in the table)
    const filteredData = useMemo(() => {
        return data.filter(item => {
            // Include summary/budget lines only if no filters are applied
            if (item.costType === 'Summary' || item.costType === 'Budget') {
                return filters.type === 'All' && filters.cost === 'All';
            }

            const matchesType = filters.type === 'All' || item.type === filters.type;
            const matchesCostStatus = filters.cost === 'All' || item.status === filters.cost;

            return matchesType && matchesCostStatus;
        });
    }, [data, filters]);

    // Handler for filter changes
    const handleFilterChange = useCallback((e) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [e.target.id.replace('filter-', '')]: e.target.value
        }));
    }, []);

    // Handler for the "Done" checkbox
    const handleToggleDone = useCallback((id, isChecked) => {
        setData(prevData => 
            prevData.map(item => 
                item.id === id ? { ...item, done: isChecked } : item
            )
        );
    }, []);

    // Handler for CSV Export
    const handleExportToCSV = useCallback(() => {
        const headers = ["Completed", "ID", "Description", "Event Phase", "Type", "Cost Type", "Projected Cost (₦)", "Notes"];
        
        const csvRows = data.map(item => {
            let costStr = item.cost === 'N/A' ? 'N/A' : (typeof item.cost === 'number' ? item.cost.toString() : '');
            
            return [
                item.done ? 'YES' : 'NO',
                item.id,
                item.description.replace(/"/g, '""'),
                item.event,
                item.type,
                item.costType,
                costStr,
                item.status === 'Unpriced' ? 'QUOTE NEEDED' : (item.costType === 'Summary' ? 'SUMMARY LINE' : '')
            ].map(field => `"${field}"`).join(','); 
        });

        const csvContent = [
            headers.join(','),
            ...csvRows
        ].join('\n');

        // Logic to copy to clipboard (simplified for React/Vite)
        navigator.clipboard.writeText(csvContent).then(() => {
            alert('Procurement log copied to clipboard as CSV!');
        }).catch(err => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy. Check console for details.');
        });
    }, [data]);

    return (
        <div id="app" className="max-w-7xl mx-auto p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-primary-blue mb-2">SWE Week Procurement & Budget Tracker</h1>
                <p className="text-lg text-gray-600">Final analysis and interactive tracking log consolidated from all 7 documents.</p>
            </header>

            <SummaryCards metrics={metrics} />

            <UnpricedList unpricedItems={metrics.unpricedItems} />

            <ProcurementTable
                data={filteredData}
                handleFilterChange={handleFilterChange}
                handleExport={handleExportToCSV}
                handleToggleDone={handleToggleDone}
            />
        </div>
    );
}

export default App;
```