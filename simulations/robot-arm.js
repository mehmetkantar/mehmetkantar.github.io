/**
 * Robot Arm 2D Interactive Simulation
 * 2-DoF Robot Arm with Inverse Kinematics
 * Based on MATLAB trajectory planning algorithm
 */

class RobotArmSimulation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Robot parameters (link lengths)
        this.d1 = 80; // First link length (pixels)
        this.d2 = 80; // Second link length (pixels)

        // Joint angles (radians)
        this.alpha = Math.PI / 4; // First joint
        this.beta = Math.PI / 4;  // Second joint

        // Target position
        this.targetX = null;
        this.targetY = null;

        // Animation
        this.targetAlpha = this.alpha;
        this.targetBeta = this.beta;
        this.animating = false;

        // Origin offset
        this.originX = this.width / 2;
        this.originY = this.height - 40;

        // Trail
        this.trail = [];

        // Control mode
        this.mode = 'click'; // 'click' or 'slider'

        this.init();
    }

    init() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.animate();
    }

    animate() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    update() {
        // Smooth animation to target angles
        if (this.animating) {
            const alphaSpeed = 0.08;
            const betaSpeed = 0.08;

            this.alpha += (this.targetAlpha - this.alpha) * alphaSpeed;
            this.beta += (this.targetBeta - this.beta) * betaSpeed;

            if (Math.abs(this.targetAlpha - this.alpha) < 0.01 &&
                Math.abs(this.targetBeta - this.beta) < 0.01) {
                this.alpha = this.targetAlpha;
                this.beta = this.targetBeta;
                this.animating = false;
            }
        }
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.originX;
        const y = -(e.clientY - rect.top - this.originY);

        this.targetX = x;
        this.targetY = y;

        // Solve inverse kinematics
        this.solveIK(x, y);
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }

    // Inverse Kinematics using Newton-Raphson (same as MATLAB)
    solveIK(px, py) {
        const tol = 0.001;
        const maxIter = 50;
        let angles = [this.alpha, this.beta];

        for (let iter = 0; iter < maxIter; iter++) {
            const alpha = angles[0];
            const beta = angles[1];

            // Forward kinematics error
            const fx = this.d1 * Math.cos(alpha) + this.d2 * Math.cos(alpha + beta) - px;
            const fy = this.d1 * Math.sin(alpha) + this.d2 * Math.sin(alpha + beta) - py;

            // Jacobian matrix
            const J11 = -this.d1 * Math.sin(alpha) - this.d2 * Math.sin(alpha + beta);
            const J12 = -this.d2 * Math.sin(alpha + beta);
            const J21 = this.d1 * Math.cos(alpha) + this.d2 * Math.cos(alpha + beta);
            const J22 = this.d2 * Math.cos(alpha + beta);

            // Inverse Jacobian (2x2)
            const det = J11 * J22 - J12 * J21;
            if (Math.abs(det) < 0.0001) break; // Singular

            const invJ11 = J22 / det;
            const invJ12 = -J12 / det;
            const invJ21 = -J21 / det;
            const invJ22 = J11 / det;

            // Newton update
            const dAlpha = invJ11 * fx + invJ12 * fy;
            const dBeta = invJ21 * fx + invJ22 * fy;

            const newAlpha = alpha - dAlpha;
            const newBeta = beta - dBeta;

            if (Math.abs(newAlpha - alpha) < tol && Math.abs(newBeta - beta) < tol) {
                this.targetAlpha = newAlpha;
                this.targetBeta = newBeta;
                this.animate();
                return;
            }

            angles = [newAlpha, newBeta];
        }

        // If IK failed, find closest reachable point
        const dist = Math.sqrt(px * px + py * py);
        const maxReach = this.d1 + this.d2;
        if (dist > maxReach * 0.95) {
            const scale = maxReach * 0.9 / dist;
            this.solveIK(px * scale, py * scale);
        }
    }

    animate() {
        this.animating = true;
        const speed = 0.08;

        const animStep = () => {
            const dAlpha = this.targetAlpha - this.alpha;
            const dBeta = this.targetBeta - this.beta;

            if (Math.abs(dAlpha) < 0.01 && Math.abs(dBeta) < 0.01) {
                this.alpha = this.targetAlpha;
                this.beta = this.targetBeta;
                this.animating = false;
                this.render();
                return;
            }

            this.alpha += dAlpha * speed;
            this.beta += dBeta * speed;

            // Add to trail
            const endX = this.originX + this.d1 * Math.cos(this.alpha) + this.d2 * Math.cos(this.alpha + this.beta);
            const endY = this.originY - this.d1 * Math.sin(this.alpha) - this.d2 * Math.sin(this.alpha + this.beta);
            this.trail.push({ x: endX, y: endY });
            if (this.trail.length > 100) this.trail.shift();

            this.render();
            requestAnimationFrame(animStep);
        };

        animStep();
    }

    render() {
        const ctx = this.ctx;

        // Clear
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, this.width, this.height);

        // Grid
        ctx.strokeStyle = '#1a1a3a';
        ctx.lineWidth = 1;
        for (let x = 0; x < this.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        for (let y = 0; y < this.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }

        // Workspace circle
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(this.originX, this.originY, this.d1 + this.d2, Math.PI, 0);
        ctx.stroke();
        ctx.setLineDash([]);

        // Trail
        if (this.trail.length > 1) {
            ctx.strokeStyle = 'rgba(255, 165, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }

        // Calculate positions
        const x0 = this.originX;
        const y0 = this.originY;
        const x1 = x0 + this.d1 * Math.cos(this.alpha);
        const y1 = y0 - this.d1 * Math.sin(this.alpha);
        const x2 = x1 + this.d2 * Math.cos(this.alpha + this.beta);
        const y2 = y1 - this.d2 * Math.sin(this.alpha + this.beta);

        // Base
        ctx.fillStyle = '#444';
        ctx.fillRect(x0 - 25, y0, 50, 20);

        // Link 1
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();

        // Link 2
        ctx.strokeStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Joints
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x0, y0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x1, y1, 8, 0, Math.PI * 2);
        ctx.fill();

        // End effector
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(x2, y2, 10, 0, Math.PI * 2);
        ctx.fill();

        // Target
        if (this.targetX !== null) {
            const tx = this.originX + this.targetX;
            const ty = this.originY - this.targetY;
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(tx - 10, ty);
            ctx.lineTo(tx + 10, ty);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(tx, ty - 10);
            ctx.lineTo(tx, ty + 10);
            ctx.stroke();
        }

        // Info panel
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(10, 10, 180, 80);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('🤖 Robot Arm IK', 20, 30);
        ctx.font = '12px monospace';
        ctx.fillStyle = '#00d4ff';
        const alphaDeg = ((this.alpha * 180 / Math.PI) % 360 + 360) % 360;
        ctx.fillText(`α = ${alphaDeg.toFixed(1)}°`, 20, 50);
        ctx.fillStyle = '#ff6b6b';
        const betaDeg = ((this.beta * 180 / Math.PI) % 360 + 360) % 360;
        ctx.fillText(`β = ${betaDeg.toFixed(1)}°`, 100, 50);
        ctx.fillStyle = '#888';
        ctx.fillText('Click anywhere to move', 20, 75);
    }

    setAngles(alpha, beta) {
        this.targetAlpha = alpha * Math.PI / 180;
        this.targetBeta = beta * Math.PI / 180;
        this.animate();
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.robotArm = new RobotArmSimulation('robot-arm-canvas');
});
