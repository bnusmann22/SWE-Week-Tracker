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