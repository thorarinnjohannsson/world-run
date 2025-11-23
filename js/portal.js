// PORTAL SYSTEM - Level completion portal

class Portal {
    constructor(x, groundY) {
        this.x = x;
        this.y = groundY - 120; // Height above ground
        this.width = 60;
        this.height = 120;
        this.animationFrame = 0;
        this.rotationAngle = 0;
        this.pulseScale = 1;
        this.particles = [];
    }
    
    update(gameSpeed) {
        // Move portal with game speed
        this.x -= gameSpeed;
        
        // Animation
        this.animationFrame += 0.1;
        this.rotationAngle += 0.05;
        this.pulseScale = 1 + Math.sin(this.animationFrame * 2) * 0.1;
        
        // Create particles around portal
        if (Math.random() < 0.3) {
            this.createPortalParticle();
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(gameSpeed);
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    createPortalParticle() {
        const angle = Math.random() * Math.PI * 2;
        const radius = (this.width / 2) + 10;
        const px = this.x + this.width / 2 + Math.cos(angle) * radius;
        const py = this.y + this.height / 2 + Math.sin(angle) * radius;
        
        this.particles.push({
            x: px,
            y: py,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1.0,
            decay: 0.02,
            size: 2 + Math.random() * 3,
            color: ['#FF1493', '#00FFFF', '#FFFF00'][Math.floor(Math.random() * 3)],
            update: function(gameSpeed) {
                this.x += this.vx - gameSpeed;
                this.y += this.vy;
                this.life -= this.decay;
            },
            isDead: function() {
                return this.life <= 0;
            }
        });
    }
    
    draw(ctx) {
        ctx.save();
        
        // Draw particles first (behind portal)
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
        
        // Portal position
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Outer glow
        ctx.shadowColor = '#FF1493';
        ctx.shadowBlur = 30;
        ctx.strokeStyle = '#FF1493';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 
                    (this.width / 2) * this.pulseScale, 
                    (this.height / 2) * this.pulseScale, 
                    0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Rotating inner rings
        for (let i = 0; i < 3; i++) {
            const ringRadius = (this.width / 2 - 10 - i * 8) * this.pulseScale;
            const ringHeight = (this.height / 2 - 10 - i * 12) * this.pulseScale;
            const colors = ['#00FFFF', '#FF1493', '#FFFF00'];
            const rotation = this.rotationAngle + (i * Math.PI / 3);
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);
            
            ctx.strokeStyle = colors[i];
            ctx.lineWidth = 3;
            ctx.shadowColor = colors[i];
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.ellipse(0, 0, ringRadius, ringHeight, 0, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
        ctx.shadowBlur = 0;
        
        // Dark center with stars
        ctx.fillStyle = '#1A001A';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 
                    (this.width / 2 - 20) * this.pulseScale, 
                    (this.height / 2 - 30) * this.pulseScale, 
                    0, 0, Math.PI * 2);
        ctx.fill();
        
        // Stars/sparkles in center
        for (let i = 0; i < 8; i++) {
            const starAngle = (this.animationFrame * 2 + i * Math.PI / 4) % (Math.PI * 2);
            const starDist = 10 + Math.sin(this.animationFrame + i) * 5;
            const sx = centerX + Math.cos(starAngle) * starDist;
            const sy = centerY + Math.sin(starAngle) * starDist;
            const starSize = 1 + Math.sin(this.animationFrame * 3 + i) * 1;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(sx, sy, starSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Portal indicator text above
        ctx.fillStyle = '#FFFF00';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 5;
        ctx.fillText('PORTAL', centerX, this.y - 10);
        ctx.shadowBlur = 0;
        
        ctx.restore();
    }
    
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
}

