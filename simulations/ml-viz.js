/**
 * Machine Learning Interactive Visualization
 * Confusion Matrix, ROC Curve, EM Clustering
 */

class MLVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Mode: 'confusion', 'roc', 'clustering'
        this.mode = 'confusion';

        // Confusion matrix data
        this.confusionMatrix = [
            [45, 5, 2],
            [3, 48, 4],
            [2, 3, 47]
        ];
        this.classes = ['Class A', 'Class B', 'Class C'];
        this.hoveredCell = null;

        // ROC curve data
        this.rocThreshold = 0.5;

        // Clustering data
        this.clusterPoints = [];
        this.centroids = [];

        this.init();
    }

    init() {
        this.generateClusterData();
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.animate();
    }

    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        // Account for canvas scaling (CSS size vs actual canvas size)
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Mode buttons
        if (y < 30) {
            if (x < 70) {
                this.mode = 'confusion';
            } else if (x < 120) {
                this.mode = 'roc';
            } else if (x < 190) {
                this.mode = 'clustering';
                this.generateClusterData();
            }
        } else if (this.mode === 'clustering' && y > 30) {
            // Add point on click - classify by nearest centroid
            const colors = ['#ff6b6b', '#4ecdc4', '#ffd93d'];

            // Find nearest centroid
            let minDist = Infinity;
            let nearestCluster = 0;
            this.centroids.forEach((c, i) => {
                const dx = x - c.x;
                const dy = y - c.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) {
                    minDist = dist;
                    nearestCluster = i;
                }
            });

            this.clusterPoints.push({
                x: x,
                y: y,
                cluster: nearestCluster,
                color: colors[nearestCluster]
            });
        }

        this.render();
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        if (this.mode === 'confusion') {
            // Check hovered cell
            const startX = 80;
            const startY = 50;
            const cellSize = 45;

            const col = Math.floor((this.mouseX - startX) / cellSize);
            const row = Math.floor((this.mouseY - startY) / cellSize);

            if (col >= 0 && col < 3 && row >= 0 && row < 3) {
                this.hoveredCell = { row, col };
            } else {
                this.hoveredCell = null;
            }
        } else if (this.mode === 'roc') {
            // ROC threshold slider
            if (this.mouseX > 60 && this.mouseX < 310 && this.mouseY > 165 && this.mouseY < 185) {
                this.rocThreshold = (this.mouseX - 60) / 250;
            }
        }

        this.render();
    }

    generateClusterData() {
        this.clusterPoints = [];
        const colors = ['#ff6b6b', '#4ecdc4', '#ffd93d'];
        const centers = [
            { x: 100, y: 100 },
            { x: 250, y: 80 },
            { x: 180, y: 140 }
        ];

        for (let c = 0; c < 3; c++) {
            for (let i = 0; i < 15; i++) {
                this.clusterPoints.push({
                    x: centers[c].x + (Math.random() - 0.5) * 60,
                    y: centers[c].y + (Math.random() - 0.5) * 60,
                    cluster: c,
                    color: colors[c]
                });
            }
        }

        this.centroids = centers.map((c, i) => ({ ...c, color: colors[i] }));
    }

    render() {
        const ctx = this.ctx;

        // Background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, this.width, this.height);

        // Mode buttons
        const modes = [['Matrix', 70], ['ROC', 50], ['Cluster', 70]];
        let btnX = 5;
        modes.forEach(([label, width], i) => {
            const isActive = (i === 0 && this.mode === 'confusion') ||
                (i === 1 && this.mode === 'roc') ||
                (i === 2 && this.mode === 'clustering');
            ctx.fillStyle = isActive ? '#00d4ff' : '#333';
            ctx.fillRect(btnX, 5, width, 22);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(label, btnX + 8, 20);
            btnX += width + 5;
        });

        if (this.mode === 'confusion') {
            this.renderConfusionMatrix();
        } else if (this.mode === 'roc') {
            this.renderROC();
        } else {
            this.renderClustering();
        }
    }

    renderConfusionMatrix() {
        const ctx = this.ctx;
        const startX = 80;
        const startY = 50;
        const cellSize = 45;

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('📊 Confusion Matrix', 100, 42);

        // Draw cells
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const value = this.confusionMatrix[i][j];
                const x = startX + j * cellSize;
                const y = startY + i * cellSize;

                // Color based on value (diagonal = green, off = red)
                const isHovered = this.hoveredCell && this.hoveredCell.row === i && this.hoveredCell.col === j;
                if (i === j) {
                    ctx.fillStyle = isHovered ? '#4caf50' : '#2e7d32';
                } else {
                    const intensity = Math.min(value / 10, 1);
                    ctx.fillStyle = isHovered ? '#ff5252' : `rgba(244, 67, 54, ${0.3 + intensity * 0.5})`;
                }

                ctx.fillRect(x, y, cellSize - 2, cellSize - 2);

                // Value
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(value.toString(), x + cellSize / 2 - 1, y + cellSize / 2 + 5);
            }
        }

        ctx.textAlign = 'left';

        // Accuracy
        const correct = this.confusionMatrix[0][0] + this.confusionMatrix[1][1] + this.confusionMatrix[2][2];
        const total = 159;
        ctx.fillStyle = '#00d4ff';
        ctx.font = '11px Arial';
        ctx.fillText(`Accuracy: ${(correct / total * 100).toFixed(1)}%`, 230, 90);
        ctx.fillStyle = '#888';
        ctx.font = '9px Arial';
        ctx.fillText('Hover cells for details', 230, 110);
    }

    renderROC() {
        const ctx = this.ctx;
        const ox = 60, oy = 160;
        const w = 250, h = 120;

        // Axes
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ox, oy - h);
        ctx.lineTo(ox, oy);
        ctx.lineTo(ox + w, oy);
        ctx.stroke();

        // Diagonal (random)
        ctx.strokeStyle = '#666';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + w, oy - h);
        ctx.stroke();
        ctx.setLineDash([]);

        // ROC curve
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.bezierCurveTo(ox + 30, oy - 100, ox + 100, oy - 115, ox + w, oy - h);
        ctx.stroke();

        // Threshold point
        const tx = ox + this.rocThreshold * w;
        const ty = oy - (1 - Math.pow(1 - this.rocThreshold, 2)) * h;
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(tx, ty, 6, 0, Math.PI * 2);
        ctx.fill();

        // Labels
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.fillText('📈 ROC Curve', 130, 30);
        ctx.font = '9px Arial';
        ctx.fillStyle = '#888';
        ctx.fillText('FPR', ox + w / 2, oy + 12);
        ctx.fillText('AUC = 0.94', ox + w - 60, oy - h + 20);
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`Threshold: ${this.rocThreshold.toFixed(2)}`, ox, oy + 25);
    }

    renderClustering() {
        const ctx = this.ctx;

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.fillText('🎯 EM Clustering (click to add)', 200, 20);

        // Draw points
        this.clusterPoints.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw centroids
        this.centroids.forEach(c => {
            ctx.strokeStyle = c.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(c.x - 8, c.y);
            ctx.lineTo(c.x + 8, c.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(c.x, c.y - 8);
            ctx.lineTo(c.x, c.y + 8);
            ctx.stroke();
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.mlViz = new MLVisualization('ml-canvas');
});
