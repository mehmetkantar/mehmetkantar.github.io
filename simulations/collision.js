/**
 * Collision Physics Simulation
 * Interactive 2D bouncing particles with proper collision resolution
 */

class CollisionSimulation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.particles = [];
        this.running = true;

        // Physics settings
        this.substeps = 4; // Multiple physics steps per frame for accuracy
        this.restitution = 0.98; // High bounciness
        this.gravity = 0; // No gravity - free floating

        this.init();
    }

    init() {
        // Create initial particles with safe spacing
        const positions = [
            { x: 60, y: 50 }, { x: 150, y: 60 }, { x: 250, y: 50 }, { x: 300, y: 70 },
            { x: 80, y: 120 }, { x: 180, y: 130 }, { x: 270, y: 110 }
        ];

        positions.forEach(pos => {
            this.addParticle(pos.x, pos.y);
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (y < 40 && x < 80) {
                this.running = !this.running;
                if (this.running) this.animate();
            } else {
                this.addParticle(x, y);
            }
        });

        this.animate();
    }

    addParticle(x, y) {
        const radius = Math.random() * 8 + 10;

        // Check if position overlaps with existing particles
        let safeX = x, safeY = y;
        let attempts = 0;
        while (attempts < 10) {
            let overlapping = false;
            for (const p of this.particles) {
                const dx = safeX - p.x;
                const dy = safeY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < radius + p.radius + 5) {
                    overlapping = true;
                    safeX += (Math.random() - 0.5) * 30;
                    safeY += (Math.random() - 0.5) * 30;
                    safeX = Math.max(radius, Math.min(this.width - radius, safeX));
                    safeY = Math.max(radius, Math.min(this.height - radius, safeY));
                    break;
                }
            }
            if (!overlapping) break;
            attempts++;
        }

        this.particles.push({
            x: safeX,
            y: safeY,
            radius,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            mass: radius * radius
        });
    }

    update() {
        const dt = 1 / this.substeps;

        for (let step = 0; step < this.substeps; step++) {
            // Apply forces and move particles
            this.particles.forEach(p => {
                // Gravity
                p.vy += this.gravity * dt;

                // Move
                p.x += p.vx * dt;
                p.y += p.vy * dt;
            });

            // Resolve collisions multiple times to handle stacking
            for (let iter = 0; iter < 3; iter++) {
                this.resolveCollisions();
            }

            // Wall collisions
            this.particles.forEach(p => {
                // Left wall
                if (p.x - p.radius < 0) {
                    p.x = p.radius;
                    p.vx = Math.abs(p.vx) * this.restitution;
                }
                // Right wall
                if (p.x + p.radius > this.width) {
                    p.x = this.width - p.radius;
                    p.vx = -Math.abs(p.vx) * this.restitution;
                }
                // Top wall
                if (p.y - p.radius < 0) {
                    p.y = p.radius;
                    p.vy = Math.abs(p.vy) * this.restitution;
                }
                // Bottom wall
                if (p.y + p.radius > this.height) {
                    p.y = this.height - p.radius;
                    p.vy = -Math.abs(p.vy) * this.restitution;

                    // Friction on ground
                    p.vx *= 0.98;
                }
            });
        }
    }

    resolveCollisions() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const distSq = dx * dx + dy * dy;
                const minDist = p1.radius + p2.radius;
                const minDistSq = minDist * minDist;

                if (distSq < minDistSq && distSq > 0.0001) {
                    const dist = Math.sqrt(distSq);

                    // Normalized collision vector
                    const nx = dx / dist;
                    const ny = dy / dist;

                    // Overlap amount
                    const overlap = minDist - dist;

                    // Position correction - separate particles based on mass
                    const totalMass = p1.mass + p2.mass;
                    const p1Ratio = p2.mass / totalMass;
                    const p2Ratio = p1.mass / totalMass;

                    // Push apart immediately to prevent overlap
                    const separationFactor = 1.01; // Slightly more than needed
                    p1.x -= overlap * p1Ratio * nx * separationFactor;
                    p1.y -= overlap * p1Ratio * ny * separationFactor;
                    p2.x += overlap * p2Ratio * nx * separationFactor;
                    p2.y += overlap * p2Ratio * ny * separationFactor;

                    // Relative velocity
                    const dvx = p1.vx - p2.vx;
                    const dvy = p1.vy - p2.vy;
                    const dvn = dvx * nx + dvy * ny;

                    // Only resolve if moving towards each other
                    if (dvn > 0) {
                        // Elastic collision impulse
                        const impulse = (2 * dvn * this.restitution) / totalMass;

                        p1.vx -= impulse * p2.mass * nx;
                        p1.vy -= impulse * p2.mass * ny;
                        p2.vx += impulse * p1.mass * nx;
                        p2.vy += impulse * p1.mass * ny;
                    }
                }
            }
        }
    }

    render() {
        const ctx = this.ctx;

        // Background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, this.width, this.height);

        // Control button
        ctx.fillStyle = this.running ? '#ff6b6b' : '#4caf50';
        ctx.fillRect(5, 5, 70, 25);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(this.running ? '⏸ Pause' : '▶ Play', 15, 22);

        // Particles
        this.particles.forEach(p => {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.arc(p.x + 3, p.y + 3, p.radius, 0, Math.PI * 2);
            ctx.fill();

            // Particle with gradient
            const gradient = ctx.createRadialGradient(
                p.x - p.radius / 3, p.y - p.radius / 3, 0,
                p.x, p.y, p.radius
            );
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(0.3, p.color);
            gradient.addColorStop(1, p.color);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();

            // Border for visibility
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Info
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '10px Arial';
        ctx.fillText(`Particles: ${this.particles.length} | Click to add`, 85, 20);
    }

    animate() {
        if (!this.running) return;

        this.update();
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.collisionSim = new CollisionSimulation('collision-canvas');
});
