const treeData = {
    id: 'root',
    name: 'Transmitter',
    type: 'olt',
    power: 8, // dBm
    distance: 0,
    ratio: 1,
    children: []
};

let currentNodeId = null;
const LOSS_PER_KM = 0.35;
const RATIO_LOSS = {
    1: 0,
    2: 3.5,
    4: 7.2,
    8: 10.5,
    16: 13.8,
    32: 17.1
};

// UNBALANCED_LOSS table is no longer needed as we calculate dynamically

function init() {
    populatePercentageDropdown();
    renderTree();
    updateSummary();
}

function populatePercentageDropdown() {
    const select = document.getElementById('node-percentage');
    select.innerHTML = '';
    
    // Specific list from the user's image
    const ratios = [
        { val: 0, label: 'Tanpa Ratio' },
        { val: 1, label: '01:99' },
        { val: 2, label: '02:98' },
        { val: 3, label: '03:97' },
        { val: 4, label: '04:96' },
        { val: 5, label: '05:95' },
        { val: 6, label: '06:94' },
        { val: 7, label: '07:93' },
        { val: 8, label: '08:92' },
        { val: 9, label: '09:91' },
        { val: 10, label: '10:90' },
        { val: 15, label: '15:85' },
        { val: 20, label: '20:80' },
        { val: 25, label: '25:75' },
        { val: 30, label: '30:70' },
        { val: 35, label: '35:65' },
        { val: 40, label: '40:60' },
        { val: 45, label: '45:55' },
        { val: 50, label: '50:50' }
    ];

    ratios.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.val;
        opt.innerText = item.label;
        select.appendChild(opt);
    });
}

function renderTree() {
    const rootContainer = document.getElementById('tree-root');
    rootContainer.innerHTML = '';
    
    const treeHTML = createNodeElement(treeData);
    rootContainer.appendChild(treeHTML);
    
    // Initialize icons for dynamic elements
    lucide.createIcons();
    
    // Delay slightly to allow DOM to layout before drawing lines
    setTimeout(drawConnections, 50);
}

function createNodeElement(node) {
    const container = document.createElement('div');
    container.className = 'node-container';
    container.id = `container-${node.id}`;

    const nodeEl = document.createElement('div');
    nodeEl.className = `node ${node.type === 'olt' ? 'transmitter' : ''}`;
    nodeEl.id = `node-${node.id}`;
    
    // Status calculation
    const statusClass = getStatusClass(node.currentPower);
    nodeEl.classList.add(statusClass);

    const iconName = node.type === 'olt' ? 'zap' : 'share-2';
    
    let ratioText = '';
    if (node.ratio === 'unbalanced') {
        if (node.percentage === 0) {
            ratioText = 'Tanpa Ratio';
        } else {
            const p = node.percentage || 50;
            const p1 = p < 10 ? `0${p}` : p;
            ratioText = `${p1}:${100 - p}`;
        }
    } else if (node.ratio > 1) {
        ratioText = `1:${node.ratio}`;
    }

    nodeEl.innerHTML = `
        <i data-lucide="${iconName}" style="width: 16px; height: 16px; margin-bottom: 4px;"></i>
        <span class="name">${node.name}</span>
        <span class="value">${node.currentPower.toFixed(1)} dBm</span>
        ${ratioText ? `<span class="ratio">${ratioText}</span>` : ''}
    `;

    nodeEl.onclick = (e) => {
        e.stopPropagation();
        openModal(node);
    };

    container.appendChild(nodeEl);

    if (node.children && node.children.length > 0) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'children';
        node.children.forEach(child => {
            childrenContainer.appendChild(createNodeElement(child));
        });
        container.appendChild(childrenContainer);
    }

    return container;
}

function calculateAllLosses(node, parentPower = 8) {
    const cableLoss = node.distance * LOSS_PER_KM;
    
    // Starting power for this node
    if (node.type === 'olt') {
        node.currentPower = node.power;
    } else {
        node.currentPower = parentPower - cableLoss;
    }

    // Now calculate what the children will receive
    if (node.children && node.children.length > 0) {
        if (node.ratio === 'unbalanced') {
            const p = node.percentage || 0;
            
            if (p === 0) {
                // "Tanpa Ratio" - 1 output (100% / 0% or just pass through)
                // But unbalanced usually implies 2 outputs. 
                // If "Tanpa Ratio" is chosen, let's treat it as 1:1 (0 dB loss) for 1st child.
                if (node.children[0]) calculateAllLosses(node.children[0], node.currentPower);
                if (node.children[1]) calculateAllLosses(node.children[1], -99); // Dead end for 2nd child
            } else {
                // Formula: -10 * log10(p/100) + insertion_loss
                const loss1 = -10 * Math.log10(p / 100) + 0.5;
                const loss2 = -10 * Math.log10((100 - p) / 100) + 0.5;
                
                if (node.children[0]) calculateAllLosses(node.children[0], node.currentPower - loss1);
                if (node.children[1]) calculateAllLosses(node.children[1], node.currentPower - loss2);
            }
        } else {
            const splitLoss = RATIO_LOSS[node.ratio] || 0;
            node.children.forEach(child => {
                calculateAllLosses(child, node.currentPower - splitLoss);
            });
        }
    }
}

function getStatusClass(dbm) {
    if (dbm > -20) return 'status-safe';
    if (dbm > -27) return 'status-warning';
    return 'status-danger';
}

function drawConnections() {
    const svg = document.getElementById('connections');
    svg.innerHTML = '';
    
    // Clear old labels
    document.querySelectorAll('.link-label').forEach(el => el.remove());

    const drawLink = (node) => {
        if (!node.children) return;
        
        const parentEl = document.getElementById(`node-${node.id}`);
        const parentRect = parentEl.getBoundingClientRect();
        const canvasRect = document.getElementById('diagram-canvas').getBoundingClientRect();

        const pX = (parentRect.left + parentRect.right) / 2 - canvasRect.left;
        const pY = parentRect.bottom - canvasRect.top;

        node.children.forEach(child => {
            const childEl = document.getElementById(`node-${child.id}`);
            const childRect = childEl.getBoundingClientRect();
            
            const cX = (childRect.left + childRect.right) / 2 - canvasRect.left;
            const cY = childRect.top - canvasRect.top;

            // Draw line
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const d = `M ${pX} ${pY} C ${pX} ${(pY + cY) / 2}, ${cX} ${(pY + cY) / 2}, ${cX} ${cY}`;
            path.setAttribute("d", d);
            path.setAttribute("stroke", "#e2e8f0");
            path.setAttribute("stroke-width", "2");
            path.setAttribute("fill", "none");
            svg.appendChild(path);

            // Add labels (Distance & Loss) - REMOVED AS PER USER REQUEST
            /*
            const labelX = (pX + cX) / 2;
            const labelY = (pY + cY) / 2;
            
            const label = document.createElement('div');
            label.className = 'link-label';
            label.style.left = `${labelX}px`;
            label.style.top = `${labelY}px`;
            
            const cableLoss = (child.distance * LOSS_PER_KM).toFixed(2);
            label.innerHTML = `
                <span class="link-dist">${child.distance}km</span> | 
                <span class="link-loss">-${cableLoss}dB</span>
            `;
            document.getElementById('diagram-canvas').appendChild(label);
            */

            drawLink(child);
        });
    };

    drawLink(treeData);
}

// Modal Logic
function openModal(node) {
    currentNodeId = node.id;
    document.getElementById('node-name').value = node.name;
    document.getElementById('node-ratio').value = node.ratio;
    document.getElementById('node-dist').value = node.distance;
    document.getElementById('node-power').value = node.power || 8;
    document.getElementById('node-percentage').value = node.percentage || 50;
    
    document.getElementById('modal-title').innerText = node.type === 'olt' ? 'Konfigurasi Transmitter' : 'Konfigurasi Splitter';
    document.getElementById('btn-delete').style.display = node.type === 'olt' ? 'none' : 'block';
    
    // Toggle fields based on type
    document.getElementById('group-power').style.display = node.type === 'olt' ? 'block' : 'none';
    document.getElementById('group-ratio').style.display = 'block'; 
    document.getElementById('group-percentage').style.display = node.ratio === 'unbalanced' ? 'block' : 'none';
    document.getElementById('node-dist').parentElement.style.display = node.type === 'olt' ? 'none' : 'block';

    document.getElementById('node-modal').style.display = 'flex';
    updateModalLoss();
}

// Handle ratio change in modal
document.getElementById('node-ratio').onchange = (e) => {
    document.getElementById('group-percentage').style.display = e.target.value === 'unbalanced' ? 'block' : 'none';
};

function closeModal() {
    document.getElementById('node-modal').style.display = 'none';
}

function saveNode() {
    const node = findNode(treeData, currentNodeId);
    if (node) {
        node.name = document.getElementById('node-name').value;
        const newRatio = document.getElementById('node-ratio').value;
        node.distance = parseFloat(document.getElementById('node-dist').value) || 0;
        
        if (node.type === 'olt') {
            node.power = parseFloat(document.getElementById('node-power').value) || 0;
        }

        // If ratio changed, update children
        if (newRatio !== node.ratio) {
            node.ratio = isNaN(newRatio) ? newRatio : parseInt(newRatio);
            syncChildren(node);
        }
        
        if (node.ratio === 'unbalanced') {
            node.percentage = parseInt(document.getElementById('node-percentage').value);
        }
    }
    
    closeModal();
    calculateAllLosses(treeData, treeData.power);
    renderTree();
    updateSummary();
}

function syncChildren(node) {
    let targetCount = 0;
    if (node.ratio === 'unbalanced') targetCount = 2;
    else if (node.ratio > 1) targetCount = node.ratio;
    
    // If we need more children
    if (node.children.length < targetCount) {
        for (let i = node.children.length; i < targetCount; i++) {
            node.children.push({
                id: Math.random().toString(36).substr(2, 9),
                name: `SPL-${node.name.split('-')[1] || ''}.${i+1}`,
                ratio: 1,
                distance: 1,
                children: []
            });
        }
    } 
    // If we need fewer
    else if (node.children.length > targetCount) {
        node.children = node.children.slice(0, targetCount);
    }
}

function deleteNode() {
    if (confirm('Hapus node ini dan semua turunannya?')) {
        removeNode(treeData, currentNodeId);
        closeModal();
        calculateAllLosses(treeData);
        renderTree();
        updateSummary();
    }
}

function findNode(root, id) {
    if (root.id === id) return root;
    for (let child of root.children) {
        const found = findNode(child, id);
        if (found) return found;
    }
    return null;
}

function removeNode(parent, id) {
    for (let i = 0; i < parent.children.length; i++) {
        if (parent.children[i].id === id) {
            parent.children.splice(i, 1);
            return true;
        }
        if (removeNode(parent.children[i], id)) return true;
    }
    return false;
}

function updateModalLoss() {
    const dist = parseFloat(document.getElementById('node-dist').value) || 0;
    const loss = (dist * LOSS_PER_KM).toFixed(2);
    document.getElementById('node-cable-loss').innerText = `-${loss}`;
}

document.getElementById('node-dist').oninput = updateModalLoss;

function updateSummary() {
    let totalDist = 0;
    let totalSplitters = 0;
    let worstPower = treeData.power;

    const traverse = (node, currentDist) => {
        const d = currentDist + node.distance;
        totalDist = Math.max(totalDist, d); // Simple approximation or sum? User asked for "Total Jarak"
        
        if (node.ratio > 1) totalSplitters++;
        if (node.currentPower < worstPower) worstPower = node.currentPower;
        
        node.children.forEach(c => traverse(c, d));
    };
    
    // Recalculate total distance as a sum of unique paths? 
    // Usually, total distance in FTTH is the longest path from OLT to ONT.
    traverse(treeData, 0);

    document.getElementById('sum-tx').innerText = `${treeData.power} dBm`;
    document.getElementById('sum-dist').innerText = `${totalDist.toFixed(1)} km`;
    document.getElementById('sum-splitters').innerText = totalSplitters;
    document.getElementById('sum-worst').innerText = `${worstPower.toFixed(1)} dBm`;
    
    // Update Power Bar
    const powerBar = document.getElementById('power-bar');
    const powerText = document.getElementById('power-current');
    
    // Map -40 to 10 range to 0-100%
    const min = -35;
    const max = 10;
    const percent = Math.min(100, Math.max(0, ((worstPower - min) / (max - min)) * 100));
    
    powerBar.style.width = `${percent}%`;
    powerText.innerText = `Worst: ${worstPower.toFixed(1)} dBm`;
    
    if (worstPower > -20) powerBar.style.background = 'var(--success)';
    else if (worstPower > -27) powerBar.style.background = 'var(--warning)';
    else powerBar.style.background = 'var(--danger)';
}

function resetApp() {
    if (confirm('Reset semua data?')) {
        treeData.children = [];
        treeData.name = 'Transmitter';
        treeData.ratio = 1;
        treeData.power = 8;
        calculateAllLosses(treeData, treeData.power);
        init();
    }
}

// Global resize handler to redraw lines
window.onresize = drawConnections;

// Start the app
calculateAllLosses(treeData, treeData.power);
init();
lucide.createIcons();
