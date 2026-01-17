/**
 * RAG System Architecture Visualization
 * Interactive flow diagram showing Retrieval-Augmented Generation
 */

class RAGVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Animation state
        this.activeNode = null;
        this.dataFlowProgress = 0;
        this.animating = false;

        // Nodes
        this.nodes = [
            { id: 'query', x: 40, y: 90, w: 60, h: 35, label: '📝 Query', color: '#3b82f6' },
            { id: 'embed', x: 115, y: 90, w: 55, h: 35, label: '🔢 Embed', color: '#8b5cf6' },
            { id: 'vector', x: 185, y: 90, w: 60, h: 35, label: '📊 Vector DB', color: '#06b6d4' },
            { id: 'context', x: 260, y: 90, w: 50, h: 35, label: '📄 Docs', color: '#10b981' },
            { id: 'llm', x: 185, y: 145, w: 60, h: 35, label: '🤖 LLM', color: '#f59e0b' },
            { id: 'response', x: 260, y: 145, w: 60, h: 35, label: '💬 Response', color: '#ec4899' }
        ];

        // Edges
        this.edges = [
            { from: 'query', to: 'embed' },
            { from: 'embed', to: 'vector' },
            { from: 'vector', to: 'context' },
            { from: 'context', to: 'llm' },
            { from: 'query', to: 'llm' },
            { from: 'llm', to: 'response' }
        ];

        this.init();
    }

    init() {
        this.canvas.addEventListener('click', () => this.startAnimation());
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.animate();
    }

    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.activeNode = null;
        for (const node of this.nodes) {
            if (x >= node.x && x <= node.x + node.w && y >= node.y && y <= node.y + node.h) {
                this.activeNode = node.id;
                break;
            }
        }

        if (!this.animating) this.render();
    }

    startAnimation() {
        if (this.animating) return;
        this.animating = true;
        this.dataFlowProgress = 0;
        this.animate();
    }

    animate() {
        this.dataFlowProgress += 0.008; // Slowed down animation
        this.render();

        if (this.dataFlowProgress < 1) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.animating = false;
            this.dataFlowProgress = 0;
        }
    }

    render() {
        const ctx = this.ctx;

        // Background
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(1, '#0f0f2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('🔄 RAG Pipeline (Click to animate)', 90, 20);

        // Draw edges
        this.edges.forEach((edge, i) => {
            const from = this.nodes.find(n => n.id === edge.from);
            const to = this.nodes.find(n => n.id === edge.to);

            ctx.strokeStyle = 'rgba(100, 100, 150, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(from.x + from.w, from.y + from.h / 2);
            ctx.lineTo(to.x, to.y + to.h / 2);
            ctx.stroke();

            // Animated data flow
            if (this.animating) {
                const edgeProgress = (this.dataFlowProgress * (this.edges.length + 1) - i);
                if (edgeProgress > 0 && edgeProgress < 1) {
                    const px = from.x + from.w + (to.x - from.x - from.w) * edgeProgress;
                    const py = from.y + from.h / 2 + (to.y - from.y) * edgeProgress;
                    ctx.fillStyle = '#ffd700';
                    ctx.beginPath();
                    ctx.arc(px, py, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        // Draw nodes
        this.nodes.forEach(node => {
            const isActive = this.activeNode === node.id;

            // Glow
            if (isActive) {
                ctx.shadowColor = node.color;
                ctx.shadowBlur = 15;
            }

            // Node background
            ctx.fillStyle = isActive ? node.color : this.adjustAlpha(node.color, 0.3);
            ctx.beginPath();
            ctx.roundRect(node.x, node.y, node.w, node.h, 6);
            ctx.fill();

            ctx.shadowBlur = 0;

            // Border
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = '9px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(node.label, node.x + node.w / 2, node.y + node.h / 2 + 3);
        });

        ctx.textAlign = 'left';
    }

    adjustAlpha(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.ragViz = new RAGVisualization('rag-canvas');
});
