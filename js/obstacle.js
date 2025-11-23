// OBSTACLE MANAGEMENT

// Obstacle class
class Obstacle {
    constructor(x, y, width, height, level, isFloating = false, isTerrain = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.level = level; // Height level (1-4)
        this.isFloating = isFloating;
        this.isTerrain = isTerrain;
        this.passed = false; // Whether player has passed this obstacle
        this.scored = false; // Whether we've awarded score for this obstacle
        this.closeCall = false; // Whether player barely cleared it
        
    // Color setup - High contrast, bright colors
        if (isTerrain) {
            this.color = '#FFFF00'; // Bright yellow for terrain
        } else if (isFloating) {
            this.color = '#00FFFF'; // Bright cyan for floating
        } else {
            this.color = this.getColorForLevel(level);
        }
        
        this.landedOn = false; // Track if player landed on it
    }
    
    // Get color based on level - Bright, high contrast colors
    getColorForLevel(level) {
        const colors = ['#FFFF00', '#00FFFF', '#FFFFFF', '#FF6600'];
        return colors[level - 1] || colors[0];
    }
    
    // Update obstacle position
    update(speed) {
        this.x -= speed;
    }
    
    // Draw obstacle
    draw(ctx) {
        if (this.isTerrain) {
            // Bright Yellow Terrain (elevated platform)
            ctx.fillStyle = '#FFD700'; // Gold yellow base
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Extend to bottom
            const bottomToFill = ctx.canvas.height - (this.y + this.height);
            if (bottomToFill > 0) {
                ctx.fillRect(this.x, this.y + this.height, this.width, bottomToFill);
            }
            
            // Bright Top Layer
            ctx.fillStyle = '#FFFF00'; // Pure bright yellow
            ctx.fillRect(this.x, this.y, this.width, 10);
            
            // White accent line for maximum visibility
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this.x, this.y + 10, this.width, 3);
            
            // Strong glow effect
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#FFFF00';
            ctx.shadowBlur = 20;
            ctx.strokeRect(this.x, this.y, this.width, this.height + bottomToFill);
            ctx.shadowBlur = 0;
            
            return;
        }
        
        if (this.isFloating) {
            // Bright Cyan Floating Platform
            ctx.fillStyle = '#00FFFF'; // Bright cyan
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Strong neon glow border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 20;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.shadowBlur = 0;
            
            // Bright white highlight
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this.x, this.y, this.width, 4);
            
            return;
        }

        // BRIGHT TRIANGULAR SPIKES (Standard Obstacles)
        ctx.save();
        
        // Main spike color - BRIGHT
        ctx.fillStyle = this.color;
        
        // Draw triangle spike
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y); // Top point
        ctx.lineTo(this.x, this.y + this.height); // Bottom left
        ctx.lineTo(this.x + this.width, this.y + this.height); // Bottom right
        ctx.closePath();
        ctx.fill();
        
        // Strong white border for maximum visibility
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Bright white highlight (larger)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 8);
        ctx.lineTo(this.x + 8, this.y + this.height - 8);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2 + 5);
        ctx.closePath();
        ctx.fill();
        
        // Draw level indicator text for multi-level
        if (this.level > 1) {
            ctx.fillStyle = '#000000'; // Black text for contrast
            ctx.font = 'bold 18px Arial'; 
            ctx.textAlign = 'center';
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 5;
            ctx.fillText(`${this.level}x`, this.x + this.width / 2, this.y + this.height - 12);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
        }
        
        ctx.restore();
    }
    
    // Get hitbox for collision detection
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    // Check if obstacle is off screen
    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// Obstacle spawning
let lastSpawnTime = 0;
let spawnInterval = 2000; // milliseconds

// Update all obstacles
function updateObstacles(stopSpawning, speed) {
    // Use provided speed or default to gameSpeed
    const obstacleSpeed = speed !== undefined ? speed : gameSpeed;
    
    // Spawn new obstacles (unless in autopilot)
    if (!stopSpawning) {
        const now = Date.now();
        if (now - lastSpawnTime > spawnInterval) {
            spawnObstacle();
            lastSpawnTime = now;
        }
    }
    
    // Update existing obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update(obstacleSpeed);
        
        // Check if player passed obstacle (for scoring)
        if (!obstacles[i].scored && obstacles[i].x + obstacles[i].width < player.x) {
            obstacles[i].passed = true;
            obstacles[i].scored = true;
            
            // Check for close call (player barely cleared it - within 10 pixels)
            const playerBottom = player.y + player.height;
            const obstacleTop = obstacles[i].y;
            const clearance = Math.abs(playerBottom - obstacleTop);
            obstacles[i].closeCall = clearance < 15;
            
            // Determine clear type based on player state
            let clearType = player.lastClearType;
            const jumpsUsed = player.jumpsUsedForLastClear || player.jumpCount;
            const wasAtPeak = player.wasAtPeakOnClear;
            
            // Calculate sophisticated score
            const scoreResult = calculateObstacleScore(
                obstacles[i],
                clearType,
                jumpsUsed,
                wasAtPeak
            );
            
            // Add to total score
            score += scoreResult.total;
            
            // Create score popup
            createScorePopup(
                obstacles[i].x + obstacles[i].width / 2,
                obstacles[i].y - 20,
                scoreResult.total,
                scoreResult.bonusText
            );
            
            // Increment combo
            if (!player.isOnGround) {
                comboTracker.increment();
            }
            
            // Play score sound
            if (typeof playSound === 'function') {
                playSound('score');
            }
            
            // Create small particle effect for clearing obstacle
            createParticleExplosion(obstacles[i].x, obstacles[i].y, '#44FF44');
            
            // Check for milestones
            checkMilestones(score);
        }
        
        // Remove off-screen obstacles
        if (obstacles[i].isOffScreen()) {
            obstacles.splice(i, 1);
        }
    }
}

// Spawn a new obstacle
function spawnObstacle() {
    const groundY = (typeof GROUND_Y !== 'undefined') ? GROUND_Y : (canvas.height - 50);

    // Check for elevated terrain (elevated ground)
    // terrainChance is from difficulty.js
    const isTerrain = Math.random() < (typeof terrainChance !== 'undefined' ? terrainChance : 0);
    
    if (isTerrain) {
        const width = Math.floor(Math.random() * 600) + 400; // 400-1000px wide
        const height = Math.floor(Math.random() * 40) + 40; // 40-80px high
        
        const obstacle = new Obstacle(
            canvas.width,
            groundY - height,
            width,
            height,
            1,
            false,
            true // isTerrain
        );
        obstacles.push(obstacle);
        
        // Delay next spawn to prevent overlapping obstacles spawning inside the hill
        // We assume gameSpeed is available globally from difficulty.js
        const speed = (typeof gameSpeed !== 'undefined') ? gameSpeed : 5;
        const extraDelay = (width / speed) * 16.6;
        lastSpawnTime += extraDelay;
        return;
    }

    // Determine if we should spawn a floating platform
    // floatingChance is from difficulty.js
    const isFloating = Math.random() < (typeof floatingChance !== 'undefined' ? floatingChance : 0);
    
    if (isFloating) {
        // Create floating platform
        const width = Math.floor(Math.random() * 100) + 80; // 80-180px wide
        const height = 20; // Fixed thickness
        
        // Calculate Y position to allow running under
        // Platform should be high enough to run under (player height ~40px)
        // But low enough to jump onto.
        // Range: 80px to 130px above ground
        const y = groundY - (Math.floor(Math.random() * 50) + 80);
        
        const obstacle = new Obstacle(
            canvas.width,
            y,
            width,
            height,
            1, // Level irrelevant for floating
            true // isFloating
        );
        obstacles.push(obstacle);
        return;
    }

    const baseHeight = 30;
    const level = getRandomObstacleLevel();
    const height = baseHeight * level;
    const width = 20 + (level * 5);
    
    const obstacle = new Obstacle(
        canvas.width,
        groundY - height,
        width,
        height,
        level,
        false
    );
    
    obstacles.push(obstacle);
}

// Get random obstacle level based on difficulty
function getRandomObstacleLevel() {
    const rand = Math.random();
    
    // Use difficulty to determine probability of higher levels
    if (rand > 1 - multiLevelChance) {
        // Multi-level obstacle
        const levels = [2, 2, 3, 3, 4]; // Weighted towards 2 and 3
        return levels[Math.floor(Math.random() * levels.length)];
    } else {
        // Single level
        return 1;
    }
}

// Draw all obstacles
function drawObstacles() {
    obstacles.forEach(obstacle => obstacle.draw(ctx));
}

// Clear obstacles in a range (used after losing a life)
function clearObstaclesInRange(minX, maxX) {
    obstacles = obstacles.filter(obstacle => {
        return obstacle.x < minX || obstacle.x > maxX;
    });
}

