/**
 * MCP Agent Benchmark Visualization
 * Multi-model AI benchmarking with progress bars and metrics
 */

class MCPBenchmarkViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Benchmark state
        this.running = false;
        this.currentTask = 0;
        this.currentModel = 0;
        this.progress = 0;

        // Models
        this.models = [
            { name: 'DeepSeek', color: '#3b82f6', score: 0, time: 0, status: 'waiting' },
            { name: 'Gemini', color: '#10b981', score: 0, time: 0, status: 'waiting' }
        ];

        // Tasks
        this.tasks = ['Amazon Scrape', 'Blog Analysis'];

        // Results
        this.results = [];
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
        const x = (e.clientX - rect.left) * scaleX;

        // Start button
        if (x < 80 && !this.running) {
            this.startBenchmark();
        }
    }

    startBenchmark() {
        this.running = true;
        this.currentTask = 0;
        this.currentModel = 0;
        this.progress = 0;
        this.results = [];

        // Reset models
        this.models.forEach(m => {
            m.score = 0;
            m.time = 0;
            m.status = 'waiting';
        });
    }

    update() {
        if (!this.running) return;

        this.time += 0.016;
        this.progress += 0.008;

        // Update current model status
        this.models[this.currentModel].status = 'running';

        if (this.progress >= 1) {
            // Complete current test - use realistic values from repo
            // DeepSeek: 100% success, Gemini: 50% (rate limited on 2nd task)
            const isDeepSeek = this.currentModel === 0;
            const isSecondTask = this.currentTask === 1;

            // Gemini fails on second task due to rate limiting (as per repo)
            const success = isDeepSeek ? true : (isSecondTask ? false : true);

            // Realistic times from repo: DeepSeek ~5.6s, Gemini ~5.0s
            const time = isDeepSeek ?
                (4.67 + Math.random() * 2).toFixed(2) :
                (5.00 + Math.random() * 0.5).toFixed(2);

            // Score based on completeness (100% when successful)
            const score = success ? 100 : 0;

            this.results.push({
                model: this.currentModel,
                task: this.currentTask,
                success,
                time,
                score
            });

            this.models[this.currentModel].score += score;
            this.models[this.currentModel].time += parseFloat(time);
            this.models[this.currentModel].status = success ? 'success' : 'failed';

            this.progress = 0;
            this.currentModel++;

            if (this.currentModel >= this.models.length) {
                this.currentModel = 0;
                this.currentTask++;

                if (this.currentTask >= this.tasks.length) {
                    this.running = false;
                    // Mark winner - DeepSeek wins with 100% vs Gemini's 50%
                    const winner = this.models[0].score > this.models[1].score ? 0 : 1;
                    this.models[winner].status = 'winner';
                }
            }
        }
    }

    render() {
        const ctx = this.ctx;

        // Background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, this.width, this.height);

        // Header
        ctx.fillStyle = this.running ? '#666' : '#00d4ff';
        ctx.fillRect(5, 4, 75, 20);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px Arial';
        ctx.fillText(this.running ? '⏳ Running' : '▶ Benchmark', 10, 17);

        // Title
        ctx.fillStyle = '#888';
        ctx.font = '9px Arial';
        ctx.fillText('🔄 MCP Agent Benchmark', 90, 16);

        // Current task indicator
        if (this.running) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 9px Arial';
            ctx.fillText(`Task: ${this.tasks[this.currentTask]}`, 240, 16);
        }

        // Model panels
        const panelY = 28;
        const panelH = 55;

        this.models.forEach((model, i) => {
            const px = 10 + i * 170;

            // Panel background
            ctx.fillStyle = model.status === 'winner' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(50, 50, 80, 0.5)';
            ctx.fillRect(px, panelY, 160, panelH);
            ctx.strokeStyle = model.color;
            ctx.lineWidth = model.status === 'running' ? 2 : 1;
            ctx.strokeRect(px, panelY, 160, panelH);

            // Model name
            ctx.fillStyle = model.color;
            ctx.font = 'bold 11px Arial';
            ctx.fillText(model.name, px + 5, panelY + 15);

            // Status indicator
            let statusIcon = '⏸';
            if (model.status === 'running') statusIcon = '🔄';
            else if (model.status === 'success') statusIcon = '✅';
            else if (model.status === 'failed') statusIcon = '❌';
            else if (model.status === 'winner') statusIcon = '🏆';
            ctx.font = '10px Arial';
            ctx.fillText(statusIcon, px + 140, panelY + 15);

            // Progress bar (if running)
            if (model.status === 'running' && this.currentModel === i) {
                ctx.fillStyle = '#333';
                ctx.fillRect(px + 5, panelY + 22, 150, 8);
                ctx.fillStyle = model.color;
                ctx.fillRect(px + 5, panelY + 22, 150 * this.progress, 8);
            }

            // Score (show average, not cumulative)
            const taskCount = this.results.filter(r => r.model === i).length;
            const avgScore = taskCount > 0 ? Math.round(model.score / taskCount) : 0;
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText(`Score: ${avgScore}%`, px + 5, panelY + 42);

            // Time
            ctx.fillStyle = '#888';
            ctx.fillText(`Time: ${model.time.toFixed(1)}s`, px + 85, panelY + 42);

            // Pydantic validation
            const validations = this.results.filter(r => r.model === i && r.success).length;
            ctx.fillStyle = validations > 0 ? '#4caf50' : '#666';
            ctx.font = '9px Arial';
            ctx.fillText(`Pydantic: ${validations}/${this.results.filter(r => r.model === i).length}`, px + 5, panelY + 52);
        });

        // Task results
        const resultsY = 90;
        ctx.fillStyle = '#888';
        ctx.font = '9px Arial';
        ctx.fillText('Tasks:', 10, resultsY + 8);

        this.tasks.forEach((task, ti) => {
            const tx = 50 + ti * 100;
            ctx.fillStyle = this.currentTask > ti ? '#4caf50' :
                (this.currentTask === ti && this.running) ? '#ffd700' : '#444';
            ctx.fillText(task, tx, resultsY + 8);

            // Check marks for completed
            if (this.currentTask > ti) {
                ctx.fillText('✓', tx + 75, resultsY + 8);
            }
        });

        // Pipeline flow visualization
        this.renderPipeline();
    }

    renderPipeline() {
        const ctx = this.ctx;
        const py = 110;

        // Pipeline stages
        const stages = ['📝 Scrape', '🔢 Parse', '✅ Validate', '📊 Score'];
        const stageWidth = 75;

        stages.forEach((stage, i) => {
            const sx = 15 + i * stageWidth;
            const isActive = this.running && Math.floor(this.progress * 4) === i;

            ctx.fillStyle = isActive ? '#00d4ff' : '#333';
            ctx.fillRect(sx, py, stageWidth - 10, 22);

            ctx.fillStyle = '#fff';
            ctx.font = '8px Arial';
            ctx.fillText(stage, sx + 5, py + 14);

            // Arrow
            if (i < stages.length - 1) {
                ctx.fillStyle = '#666';
                ctx.fillText('→', sx + stageWidth - 12, py + 14);
            }

            // Active pulse
            if (isActive) {
                ctx.strokeStyle = '#00d4ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(sx, py, stageWidth - 10, 22);
            }
        });

        // Bottom info
        ctx.fillStyle = '#666';
        ctx.font = '8px Arial';
        ctx.fillText('LangChain + Firecrawl MCP + OpenRouter', 90, this.height - 5);
    }

    animate() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.mcpViz = new MCPBenchmarkViz('mcp-canvas');
});
