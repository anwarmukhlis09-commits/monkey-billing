document.addEventListener('DOMContentLoaded', () => {
    const ptxInput = document.getElementById('ptx');
    const splitterList = document.getElementById('splitter-list');
    const addSplitterBtn = document.getElementById('add-splitter-btn');
    const resetBtn = document.getElementById('reset-btn');
    const finalPrxOutput = document.getElementById('final-prx');
    const statusCard = document.getElementById('status-card');
    const statusText = document.getElementById('status-text');
    const statusIcon = document.getElementById('status-icon');
    const recommendationText = document.getElementById('recommendation');

    let splitters = [];

    const createSplitterBlock = (index) => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        const item = document.createElement('div');
        item.className = 'splitter-item animate-in';
        item.dataset.id = id;
        
        item.innerHTML = `
            <div class="card splitter-card">
                <div class="splitter-header">
                    <h3>Tahap Splitter ${splitters.length + 1}</h3>
                    <button class="remove-btn" data-id="${id}">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        Hapus
                    </button>
                </div>
                <div class="input-group no-margin">
                    <select class="splitter-type-select">
                        <option value="3.5">1:2 (3.5 dB)</option>
                        <option value="7">1:4 (7.0 dB)</option>
                        <option value="10.5">1:8 (10.5 dB)</option>
                        <option value="13.5">1:16 (13.5 dB)</option>
                        <option value="17">1:32 (17.0 dB)</option>
                    </select>
                </div>
                <div class="splitter-metrics">
                    <div class="metric input">
                        <span class="label">Input</span>
                        <span class="val input-val">0.00</span>
                    </div>
                    <div class="metric loss">
                        <span class="label">Loss</span>
                        <span class="val loss-val">3.50</span>
                    </div>
                    <div class="metric output">
                        <span class="label">Output</span>
                        <span class="val output-val">0.00</span>
                    </div>
                </div>
            </div>
            <div class="flow-connector"></div>
        `;

        const select = item.querySelector('.splitter-type-select');
        select.addEventListener('change', calculateAll);
        
        const removeBtn = item.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => removeSplitter(id));

        return { id, element: item, select };
    };

    const addSplitter = () => {
        if (splitters.length >= 6) {
            alert('Maksimal 6 tahap splitter diperbolehkan dalam simulasi ini.');
            return;
        }
        
        const newBlock = createSplitterBlock();
        splitterList.appendChild(newBlock.element);
        splitters.push(newBlock);
        
        calculateAll();
        
        // Scroll to new block
        setTimeout(() => {
            newBlock.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const removeSplitter = (id) => {
        const index = splitters.findIndex(s => s.id === id);
        if (index > -1) {
            const item = splitters[index].element;
            item.classList.add('removing');
            setTimeout(() => {
                item.remove();
                splitters.splice(index, 1);
                updateTitles();
                calculateAll();
            }, 300);
        }
    };

    const updateTitles = () => {
        splitters.forEach((s, i) => {
            s.element.querySelector('h3').textContent = `Tahap Splitter ${i + 1}`;
        });
    };

    const calculateAll = () => {
        let currentPtx = parseFloat(ptxInput.value) || 0;
        
        splitters.forEach((s, i) => {
            const loss = parseFloat(s.select.value);
            const inputVal = currentPtx;
            const outputVal = inputVal - loss;
            
            // Update block UI
            s.element.querySelector('.input-val').textContent = inputVal.toFixed(2);
            s.element.querySelector('.loss-val').textContent = loss.toFixed(2);
            s.element.querySelector('.output-val').textContent = outputVal.toFixed(2);
            
            currentPtx = outputVal;
        });

        // Update Final Result
        finalPrxOutput.textContent = currentPtx.toFixed(2);
        updateStatus(currentPtx);
    };

    const updateStatus = (prx) => {
        statusCard.classList.remove('status-normal', 'status-warning', 'status-critical');
        
        let status = '';
        let recommendation = '';
        let iconSvg = '';

        if (prx > -25) {
            status = 'NORMAL';
            statusCard.classList.add('status-normal');
            recommendation = 'Sinyal berada dalam batas aman. Rantai simulasi sehat.';
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>`;
        } else if (prx >= -28) {
            status = 'PERINGATAN';
            statusCard.classList.add('status-warning');
            recommendation = 'Sinyal mendekati batas limit. Pertimbangkan untuk mengurangi rasio split.';
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`;
        } else {
            status = 'KRITIS';
            statusCard.classList.add('status-critical');
            recommendation = 'Sinyal terlalu lemah. Kurangi tahap split atau tingkatkan Ptx.';
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        }

        statusText.textContent = status;
        recommendationText.textContent = recommendation;
        statusIcon.innerHTML = iconSvg;
    };

    const resetSimulation = () => {
        ptxInput.value = 3;
        splitterList.innerHTML = '';
        splitters = [];
        calculateAll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Event Listeners
    ptxInput.addEventListener('input', calculateAll);
    addSplitterBtn.addEventListener('click', addSplitter);
    resetBtn.addEventListener('click', resetSimulation);

    // Init with one splitter
    addSplitter();
});
