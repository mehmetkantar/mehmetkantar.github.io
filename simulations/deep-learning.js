/**
 * Deep Learning Interactive Visualization
 * Multi-mode: MLP, CNN, GNN, Transformer
 */

class DeepLearningViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Modes: 'mlp', 'cnn', 'gnn', 'transformer'
        this.mode = 'mlp';

        // Animation
        this.animating = false;
        this.progress = 0;
        this.time = 0;

        this.init();
    }

    init() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.animate();
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Mode buttons (top row) - adjusted for 400px width
        if (y < 30) {
            if (x < 50) this.mode = 'mlp';
            else if (x < 100) this.mode = 'cnn';
            else if (x < 150) this.mode = 'gnn';
            else if (x < 220) this.mode = 'transformer';
        } else {
            // Start animation on click
            this.animating = true;
            this.progress = 0;
        }
    }

    render() {
        const ctx = this.ctx;
        this.time += 0.02;

        // Background
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(1, '#1a0a2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Mode buttons - adjusted for 400px width
        const modes = [['MLP', 45], ['CNN', 45], ['GNN', 45], ['Trans', 60]];
        let btnX = 5;
        modes.forEach(([label, width], i) => {
            const modeKeys = ['mlp', 'cnn', 'gnn', 'transformer'];
            const isActive = this.mode === modeKeys[i];
            ctx.fillStyle = isActive ? '#00d4ff' : '#333';
            ctx.fillRect(btnX, 4, width, 22);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Arial';
            ctx.fillText(label, btnX + 8, 19);
            btnX += width + 5;
        });

        // Click hint
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.fillText('Click to animate', 230, 18);

        // Render based on mode
        if (this.mode === 'mlp') this.renderMLP();
        else if (this.mode === 'cnn') this.renderCNN();
        else if (this.mode === 'gnn') this.renderGNN();
        else this.renderTransformer();

        // Update animation
        if (this.animating) {
            this.progress += 0.005; // Slowed down animation
            if (this.progress >= 1) {
                this.animating = false;
                this.progress = 0;
            }
        }
    }

    renderMLP() {
        const ctx = this.ctx;
        const layers = [3, 5, 5, 2];
        const startX = 50;
        const layerSpacing = 85;

        // Draw connections
        for (let l = 0; l < layers.length - 1; l++) {
            for (let i = 0; i < layers[l]; i++) {
                for (let j = 0; j < layers[l + 1]; j++) {
                    const y1 = 55 + (130 / (layers[l] + 1)) * (i + 1);
                    const y2 = 55 + (130 / (layers[l + 1] + 1)) * (j + 1);
                    const x1 = startX + l * layerSpacing;
                    const x2 = startX + (l + 1) * layerSpacing;

                    const isActive = this.animating && this.progress > l / layers.length &&
                        this.progress < (l + 1) / layers.length;
                    ctx.strokeStyle = isActive ? 'rgba(0, 212, 255, 0.8)' : 'rgba(100, 150, 200, 0.2)';
                    ctx.lineWidth = isActive ? 2 : 1;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            }
        }

        // Draw neurons
        layers.forEach((count, l) => {
            for (let i = 0; i < count; i++) {
                const x = startX + l * layerSpacing;
                const y = 55 + (130 / (count + 1)) * (i + 1);
                const isActive = this.animating && Math.abs(this.progress - l / layers.length) < 0.15;

                ctx.fillStyle = isActive ? '#00d4ff' : '#4a6fa5';
                ctx.shadowColor = isActive ? '#00d4ff' : 'transparent';
                ctx.shadowBlur = isActive ? 10 : 0;
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });

        // Labels
        ctx.fillStyle = '#888';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ['Input', 'Hidden', 'Hidden', 'Output'].forEach((label, i) => {
            ctx.fillText(label, startX + i * layerSpacing, this.height - 5);
        });
        ctx.textAlign = 'left';
    }

    renderCNN() {
        const ctx = this.ctx;

        // Input image (grid)
        const imgX = 25, imgY = 45, imgSize = 50;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            ctx.beginPath();
            ctx.moveTo(imgX + i * 10, imgY);
            ctx.lineTo(imgX + i * 10, imgY + imgSize);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(imgX, imgY + i * 10);
            ctx.lineTo(imgX + imgSize, imgY + i * 10);
            ctx.stroke();
        }
        ctx.fillStyle = '#888';
        ctx.font = '8px Arial';
        ctx.fillText('Input', imgX + 10, imgY + imgSize + 12);

        // Convolution kernel (animated)
        if (this.animating && this.progress < 0.3) {
            const kx = imgX + (this.progress / 0.3) * 30;
            const ky = imgY + Math.sin(this.time * 3) * 15 + 15;
            ctx.fillStyle = 'rgba(255, 200, 0, 0.5)';
            ctx.fillRect(kx, ky, 20, 20);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.strokeRect(kx, ky, 20, 20);
        }

        // Feature maps
        const fmColors = ['#ff6b6b', '#4ecdc4', '#ffd93d'];
        for (let f = 0; f < 3; f++) {
            const fmX = 100 + f * 15;
            const fmY = 50 + f * 5;
            const isActive = this.animating && this.progress > 0.2 && this.progress < 0.5;
            ctx.fillStyle = isActive ? fmColors[f] : `${fmColors[f]}66`;
            ctx.fillRect(fmX, fmY, 35, 35);
            ctx.strokeStyle = fmColors[f];
            ctx.strokeRect(fmX, fmY, 35, 35);
        }
        ctx.fillStyle = '#888';
        ctx.fillText('Conv', 110, 110);

        // Pooling
        const poolX = 170;
        for (let f = 0; f < 3; f++) {
            const isActive = this.animating && this.progress > 0.4 && this.progress < 0.7;
            ctx.fillStyle = isActive ? fmColors[f] : `${fmColors[f]}44`;
            ctx.fillRect(poolX + f * 10, 55 + f * 4, 20, 20);
        }
        ctx.fillText('Pool', poolX + 5, 110);

        // Flatten arrow
        ctx.strokeStyle = this.animating && this.progress > 0.6 ? '#00d4ff' : '#444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(220, 75);
        ctx.lineTo(245, 75);
        ctx.lineTo(240, 70);
        ctx.moveTo(245, 75);
        ctx.lineTo(240, 80);
        ctx.stroke();

        // FC layers
        const fcX = 260;
        for (let l = 0; l < 2; l++) {
            const neurons = l === 0 ? 4 : 2;
            for (let n = 0; n < neurons; n++) {
                const ny = 50 + (100 / (neurons + 1)) * (n + 1);
                const isActive = this.animating && this.progress > 0.7 + l * 0.15;
                ctx.fillStyle = isActive ? '#00d4ff' : '#4a6fa5';
                ctx.beginPath();
                ctx.arc(fcX + l * 50, ny, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.fillStyle = '#888';
        ctx.fillText('FC', fcX + 15, 110);
    }

    renderGNN() {
        const ctx = this.ctx;

        // Graph nodes
        const nodes = [
            { x: 80, y: 70, label: 'A' },
            { x: 150, y: 50, label: 'B' },
            { x: 200, y: 90, label: 'C' },
            { x: 120, y: 130, label: 'D' },
            { x: 180, y: 150, label: 'E' },
            { x: 260, y: 70, label: 'F' },
            { x: 280, y: 140, label: 'G' }
        ];

        // Edges
        const edges = [
            [0, 1], [0, 3], [1, 2], [1, 5], [2, 5], [2, 4], [3, 4], [4, 6], [5, 6]
        ];

        // Draw edges
        edges.forEach(([i, j]) => {
            const isActive = this.animating && Math.random() > 0.5;
            ctx.strokeStyle = isActive ? '#00d4ff' : 'rgba(100, 150, 200, 0.4)';
            ctx.lineWidth = isActive ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            // Message passing animation
            if (this.animating) {
                const msgProgress = (this.progress * 3 + i * 0.1) % 1;
                const mx = nodes[i].x + (nodes[j].x - nodes[i].x) * msgProgress;
                const my = nodes[i].y + (nodes[j].y - nodes[i].y) * msgProgress;
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(mx, my, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw nodes
        nodes.forEach((node, i) => {
            const pulse = this.animating ? Math.sin(this.time * 5 + i) * 3 : 0;
            ctx.fillStyle = this.animating ? `hsl(${180 + i * 20}, 70%, 50%)` : '#4a6fa5';
            ctx.shadowColor = this.animating ? '#00d4ff' : 'transparent';
            ctx.shadowBlur = pulse + 5;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 12 + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(node.label, node.x, node.y + 4);
        });

        ctx.textAlign = 'left';
        ctx.fillStyle = '#888';
        ctx.font = '9px Arial';
        ctx.fillText('Message Passing Neural Network', 80, this.height - 8);
    }

    renderTransformer() {
        const ctx = this.ctx;

        // Input tokens
        const tokens = ['The', 'cat', 'sat', 'on', 'mat'];
        const tokenY = 45;
        tokens.forEach((tok, i) => {
            const tx = 30 + i * 50;
            const isActive = this.animating && this.progress > i * 0.1;
            ctx.fillStyle = isActive ? '#00d4ff' : '#333';
            ctx.fillRect(tx, tokenY, 40, 20);
            ctx.fillStyle = '#fff';
            ctx.font = '9px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(tok, tx + 20, tokenY + 14);
        });

        // Self-attention visualization
        if (this.animating && this.progress > 0.3) {
            const attentionY = 80;
            // Attention lines
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    const attn = Math.random() * 0.5 + (i === j ? 0.5 : 0);
                    ctx.strokeStyle = `rgba(255, 200, 0, ${attn})`;
                    ctx.lineWidth = attn * 3;
                    ctx.beginPath();
                    ctx.moveTo(50 + i * 50, tokenY + 25);
                    ctx.quadraticCurveTo(50 + (i + j) * 25, attentionY + 20, 50 + j * 50, attentionY + 40);
                    ctx.stroke();
                }
            }
        }

        // FFN block
        const ffnY = 130;
        ctx.fillStyle = this.animating && this.progress > 0.6 ? '#4ecdc4' : '#2a4a5a';
        ctx.fillRect(80, ffnY, 180, 25);
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Feed Forward Network', 170, ffnY + 16);

        // Output
        if (this.animating && this.progress > 0.8) {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(280, ffnY, 50, 25);
            ctx.fillStyle = '#000';
            ctx.fillText('the', 305, ffnY + 16);
        }

        ctx.textAlign = 'left';
        ctx.fillStyle = '#888';
        ctx.font = '9px Arial';
        ctx.fillText('Self-Attention Mechanism', 100, this.height - 8);
    }

    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.dlViz = new DeepLearningViz('dl-canvas');
});
