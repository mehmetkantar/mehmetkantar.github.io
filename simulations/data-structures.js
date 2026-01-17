/**
 * Data Structures Comprehensive Visualization
 * Multi-tab: Sorts (Bubble, Insert, Merge, Quick, Heap), BST, Graph, Hash
 */

class DataStructuresViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Modes: 'sort', 'bst', 'graph', 'hash'
        this.mode = 'sort';

        // Sorting
        this.sortArray = [];
        this.sortSteps = [];
        this.currentStep = 0;
        this.sorting = false;
        this.sortAlgo = 'bubble'; // bubble, insert, merge, quick, heap
        this.highlightIndices = [];

        // BST
        this.bstRoot = null;

        // Graph
        this.graphNodes = [];
        this.graphEdges = [];
        this.visitedNodes = new Set();

        // HashMap
        this.hashTable = new Array(8).fill(null).map(() => []);

        this.time = 0;

        this.init();
    }

    init() {
        this.resetSort();
        this.buildBST();
        this.buildGraph();
        this.buildHashMap();
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.animate();
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Mode buttons (top row)
        if (y < 28) {
            if (x < 45) { this.mode = 'sort'; this.resetSort(); }
            else if (x < 90) { this.mode = 'bst'; }
            else if (x < 145) { this.mode = 'graph'; this.visitedNodes.clear(); }
            else if (x < 195) { this.mode = 'hash'; }
        } else if (this.mode === 'sort') {
            // Sort algorithm buttons (second row)
            if (y >= 28 && y < 50) {
                if (x < 55) { this.sortAlgo = 'bubble'; this.resetSort(); }
                else if (x < 105) { this.sortAlgo = 'insert'; this.resetSort(); }
                else if (x < 160) { this.sortAlgo = 'merge'; this.resetSort(); }
                else if (x < 210) { this.sortAlgo = 'quick'; this.resetSort(); }
                else if (x < 260) { this.sortAlgo = 'heap'; this.resetSort(); }
                else if (x < 320) { this.startSort(); }
            } else if (!this.sorting) {
                this.startSort();
            }
        } else if (this.mode === 'graph') {
            this.runBFS();
        } else if (this.mode === 'hash') {
            this.addToHash(Math.floor(Math.random() * 100));
        }
    }

    resetSort() {
        this.sortArray = [];
        for (let i = 0; i < 12; i++) {
            this.sortArray.push({
                value: Math.floor(Math.random() * 80) + 20,
                color: `hsl(${i * 30}, 70%, 50%)`
            });
        }
        this.sortSteps = [];
        this.currentStep = 0;
        this.sorting = false;
        this.highlightIndices = [];
    }

    startSort() {
        if (this.sorting) return;
        this.sortSteps = [];
        const arr = this.sortArray.map(a => a.value);

        if (this.sortAlgo === 'bubble') this.generateBubbleSteps(arr);
        else if (this.sortAlgo === 'insert') this.generateInsertionSteps(arr);
        else if (this.sortAlgo === 'merge') this.generateMergeSteps(arr, 0, arr.length - 1);
        else if (this.sortAlgo === 'quick') this.generateQuickSteps(arr, 0, arr.length - 1);
        else if (this.sortAlgo === 'heap') this.generateHeapSteps(arr);

        this.currentStep = 0;
        this.sorting = true;
    }

    generateBubbleSteps(arr) {
        const a = [...arr];
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < a.length - i - 1; j++) {
                this.sortSteps.push({ arr: [...a], highlight: [j, j + 1], type: 'compare' });
                if (a[j] > a[j + 1]) {
                    [a[j], a[j + 1]] = [a[j + 1], a[j]];
                    this.sortSteps.push({ arr: [...a], highlight: [j, j + 1], type: 'swap' });
                }
            }
        }
        this.sortSteps.push({ arr: [...a], highlight: [], type: 'done' });
    }

    generateInsertionSteps(arr) {
        const a = [...arr];
        for (let i = 1; i < a.length; i++) {
            let j = i;
            while (j > 0 && a[j - 1] > a[j]) {
                this.sortSteps.push({ arr: [...a], highlight: [j - 1, j], type: 'compare' });
                [a[j - 1], a[j]] = [a[j], a[j - 1]];
                this.sortSteps.push({ arr: [...a], highlight: [j - 1, j], type: 'swap' });
                j--;
            }
        }
        this.sortSteps.push({ arr: [...a], highlight: [], type: 'done' });
    }

    generateMergeSteps(arr, l, r) {
        if (l >= r) return;
        const m = Math.floor((l + r) / 2);
        this.generateMergeSteps(arr, l, m);
        this.generateMergeSteps(arr, m + 1, r);

        // Merge
        const left = arr.slice(l, m + 1);
        const right = arr.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;
        while (i < left.length && j < right.length) {
            this.sortSteps.push({ arr: [...arr], highlight: [l + i, m + 1 + j], type: 'compare' });
            if (left[i] <= right[j]) {
                arr[k++] = left[i++];
            } else {
                arr[k++] = right[j++];
            }
            this.sortSteps.push({ arr: [...arr], highlight: [k - 1], type: 'merge' });
        }
        while (i < left.length) arr[k++] = left[i++];
        while (j < right.length) arr[k++] = right[j++];
    }

    generateQuickSteps(arr, low, high) {
        if (low >= high) return;
        const pivot = arr[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
            this.sortSteps.push({ arr: [...arr], highlight: [j, high], type: 'compare' });
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                this.sortSteps.push({ arr: [...arr], highlight: [i, j], type: 'swap' });
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        this.sortSteps.push({ arr: [...arr], highlight: [i + 1], type: 'pivot' });

        this.generateQuickSteps(arr, low, i);
        this.generateQuickSteps(arr, i + 2, high);
    }

    generateHeapSteps(arr) {
        const a = [...arr];
        const n = a.length;

        // Build heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            this.heapify(a, n, i);
        }

        // Extract elements
        for (let i = n - 1; i > 0; i--) {
            this.sortSteps.push({ arr: [...a], highlight: [0, i], type: 'swap' });
            [a[0], a[i]] = [a[i], a[0]];
            this.heapify(a, i, 0);
        }
        this.sortSteps.push({ arr: [...a], highlight: [], type: 'done' });
    }

    heapify(arr, n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n && arr[left] > arr[largest]) largest = left;
        if (right < n && arr[right] > arr[largest]) largest = right;

        if (largest !== i) {
            this.sortSteps.push({ arr: [...arr], highlight: [i, largest], type: 'compare' });
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            this.heapify(arr, n, largest);
        }
    }

    buildBST() {
        const values = [50, 30, 70, 20, 40, 60, 80, 15, 35];
        this.bstRoot = null;
        values.forEach(v => this.insertBST(v));
    }

    insertBST(value, node = null, x = 200, y = 55, level = 0) {
        if (!this.bstRoot) {
            this.bstRoot = { value, x, y, left: null, right: null };
            return;
        }
        node = node || this.bstRoot;
        const offset = 70 / (level + 1);
        if (value < node.value) {
            if (node.left) this.insertBST(value, node.left, node.x - offset, node.y + 35, level + 1);
            else node.left = { value, x: node.x - offset, y: node.y + 35, left: null, right: null };
        } else {
            if (node.right) this.insertBST(value, node.right, node.x + offset, node.y + 35, level + 1);
            else node.right = { value, x: node.x + offset, y: node.y + 35, left: null, right: null };
        }
    }

    buildGraph() {
        this.graphNodes = [
            { id: 0, x: 60, y: 90, label: 'A' },
            { id: 1, x: 140, y: 60, label: 'B' },
            { id: 2, x: 220, y: 90, label: 'C' },
            { id: 3, x: 100, y: 150, label: 'D' },
            { id: 4, x: 180, y: 150, label: 'E' },
            { id: 5, x: 300, y: 100, label: 'F' },
            { id: 6, x: 350, y: 70, label: 'G' }
        ];
        this.graphEdges = [
            [0, 1], [0, 3], [1, 2], [1, 4], [2, 5], [3, 4], [4, 5], [5, 6]
        ];
        this.visitedNodes.clear();
    }

    buildHashMap() {
        this.hashTable = new Array(8).fill(null).map(() => []);
        [15, 22, 37, 8, 45, 30, 12, 28].forEach(v => this.addToHash(v));
    }

    addToHash(value) {
        const index = value % 8;
        if (!this.hashTable[index].includes(value)) {
            this.hashTable[index].push(value);
        }
    }

    runBFS() {
        if (this.visitedNodes.size >= this.graphNodes.length) {
            this.visitedNodes.clear();
        }
        for (let i = 0; i < this.graphNodes.length; i++) {
            if (!this.visitedNodes.has(i)) {
                this.visitedNodes.add(i);
                break;
            }
        }
    }

    updateSort() {
        if (!this.sorting || this.sortSteps.length === 0) return;

        if (this.currentStep < this.sortSteps.length) {
            const step = this.sortSteps[this.currentStep];
            // Update array values
            step.arr.forEach((val, i) => {
                this.sortArray[i].value = val;
            });
            this.highlightIndices = step.highlight;
            this.currentStep++;
        } else {
            this.sorting = false;
            this.highlightIndices = [];
        }
    }

    render() {
        const ctx = this.ctx;
        this.time += 0.016;

        // Background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, this.width, this.height);

        // Mode buttons
        const modes = [['Sort', 40], ['BST', 40], ['Graph', 50], ['Hash', 45]];
        let btnX = 5;
        const modeKeys = ['sort', 'bst', 'graph', 'hash'];
        modes.forEach(([label, width], i) => {
            const isActive = this.mode === modeKeys[i];
            ctx.fillStyle = isActive ? '#00d4ff' : '#333';
            ctx.fillRect(btnX, 4, width, 20);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(label, btnX + 6, 18);
            btnX += width + 5;
        });

        // Render based on mode
        if (this.mode === 'sort') this.renderSort();
        else if (this.mode === 'bst') this.renderBST();
        else if (this.mode === 'graph') this.renderGraph();
        else this.renderHash();
    }

    renderSort() {
        const ctx = this.ctx;

        // Sort algorithm buttons
        const algos = [['Bubble', 50], ['Insert', 45], ['Merge', 50], ['Quick', 45], ['Heap', 45], ['▶ Run', 55]];
        let btnX = 5;
        const algoKeys = ['bubble', 'insert', 'merge', 'quick', 'heap', 'run'];
        algos.forEach(([label, width], i) => {
            const isActive = i < 5 && this.sortAlgo === algoKeys[i];
            const isRun = i === 5;
            ctx.fillStyle = isRun ? '#4caf50' : (isActive ? '#ff6b6b' : '#222');
            ctx.fillRect(btnX, 28, width, 18);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px Arial';
            ctx.fillText(label, btnX + 5, 41);
            btnX += width + 4;
        });

        // Algorithm name
        ctx.fillStyle = '#888';
        ctx.font = '10px Arial';
        const algoNames = { bubble: 'Bubble Sort', insert: 'Insertion Sort', merge: 'Merge Sort', quick: 'Quick Sort', heap: 'Heap Sort' };
        ctx.fillText(algoNames[this.sortAlgo] || 'Bubble Sort', 320, 42);

        // Bars
        const barWidth = 25;
        const startX = 20;
        const baseY = 200;
        const maxHeight = 130;

        this.sortArray.forEach((bar, i) => {
            const height = (bar.value / 100) * maxHeight;
            const x = startX + i * (barWidth + 5);
            const isHighlighted = this.highlightIndices.includes(i);

            ctx.fillStyle = isHighlighted ? '#ffd700' : bar.color;
            ctx.fillRect(x, baseY - height, barWidth, height);

            // Border
            ctx.strokeStyle = isHighlighted ? '#fff' : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = isHighlighted ? 2 : 1;
            ctx.strokeRect(x, baseY - height, barWidth, height);

            // Value
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(bar.value, x + barWidth / 2, baseY - height - 5);
        });
        ctx.textAlign = 'left';
    }

    renderBST() {
        const ctx = this.ctx;

        ctx.fillStyle = '#888';
        ctx.font = '11px Arial';
        ctx.fillText('Binary Search Tree - Inorder: sorted!', 200, 18);

        const drawNode = (node) => {
            if (!node) return;

            if (node.left) {
                ctx.strokeStyle = '#4a6fa5';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(node.left.x, node.left.y);
                ctx.stroke();
                drawNode(node.left);
            }
            if (node.right) {
                ctx.strokeStyle = '#4a6fa5';
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(node.right.x, node.right.y);
                ctx.stroke();
                drawNode(node.right);
            }

            ctx.fillStyle = '#00d4ff';
            ctx.beginPath();
            ctx.arc(node.x, node.y, 16, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(node.value, node.x, node.y + 4);
        };

        drawNode(this.bstRoot);
        ctx.textAlign = 'left';
    }

    renderGraph() {
        const ctx = this.ctx;

        ctx.fillStyle = '#888';
        ctx.font = '11px Arial';
        ctx.fillText('Graph BFS Traversal - Click to visit next', 180, 18);

        // Edges
        this.graphEdges.forEach(([from, to]) => {
            ctx.strokeStyle = 'rgba(100, 150, 200, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.graphNodes[from].x, this.graphNodes[from].y);
            ctx.lineTo(this.graphNodes[to].x, this.graphNodes[to].y);
            ctx.stroke();
        });

        // Nodes
        this.graphNodes.forEach((node, i) => {
            const visited = this.visitedNodes.has(i);
            ctx.fillStyle = visited ? '#4caf50' : '#3b82f6';
            ctx.shadowColor = visited ? '#4caf50' : 'transparent';
            ctx.shadowBlur = visited ? 15 : 0;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(node.label, node.x, node.y + 5);
        });
        ctx.textAlign = 'left';
    }

    renderHash() {
        const ctx = this.ctx;

        ctx.fillStyle = '#888';
        ctx.font = '11px Arial';
        ctx.fillText('HashMap (mod 8) - Click to add random', 180, 18);

        const bucketH = 22;
        const startY = 32;

        this.hashTable.forEach((bucket, i) => {
            const y = startY + i * (bucketH + 3);

            // Bucket index
            ctx.fillStyle = '#00d4ff';
            ctx.fillRect(15, y, 30, bucketH);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`[${i}]`, 30, y + 16);

            // Chain
            let x = 55;
            bucket.forEach((val, j) => {
                ctx.fillStyle = `hsl(${val * 3.6}, 60%, 45%)`;
                ctx.fillRect(x, y, 35, bucketH);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, 35, bucketH);

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 11px Arial';
                ctx.fillText(val, x + 17, y + 16);

                if (j < bucket.length - 1) {
                    ctx.fillStyle = '#ffd700';
                    ctx.fillText('→', x + 40, y + 16);
                }
                x += 50;
            });

            if (bucket.length === 0) {
                ctx.fillStyle = '#555';
                ctx.font = '10px Arial';
                ctx.fillText('null', 70, y + 16);
            }
        });
        ctx.textAlign = 'left';
    }

    animate() {
        if (this.sorting && this.time % 0.08 < 0.02) {
            this.updateSort();
        }
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.dsaViz = new DataStructuresViz('dsa-canvas');
});
