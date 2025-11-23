// LEVEL MANAGEMENT SYSTEM

class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.portalSpawned = false;
        this.portalDistance = 200; // Distance to run after hitting threshold
        this.distanceAfterThreshold = 0;
        this.isTransitioning = false;
        this.transitionStartTime = 0;
        this.transitionDuration = 1000; // 1 second pause
        this.portal = null;
        this.inAutopilot = false;
        this.stopObstacleSpawning = false;
        
        // Color themes for each level
        this.colorThemes = [
            { 
                name: 'Hot Pink',
                sky: ['#FF00FF', '#FF1493'], 
                ground: '#C71585', 
                groundTop: '#FF1493',
                groundAccent: '#00FFFF'
            },
            { 
                name: 'Electric Blue',
                sky: ['#00BFFF', '#00CED1'], 
                ground: '#008B8B', 
                groundTop: '#00FFFF',
                groundAccent: '#FF1493'
            },
            { 
                name: 'Lime Green',
                sky: ['#ADFF2F', '#FFD700'], 
                ground: '#9ACD32', 
                groundTop: '#FFFF00',
                groundAccent: '#9D00FF'
            },
            { 
                name: 'Purple Violet',
                sky: ['#9370DB', '#8B00FF'], 
                ground: '#6A0DAD', 
                groundTop: '#9D00FF',
                groundAccent: '#00FFFF'
            },
            { 
                name: 'Orange Red',
                sky: ['#FF4500', '#FF6347'], 
                ground: '#FF8C00', 
                groundTop: '#FF6600',
                groundAccent: '#00FFFF'
            }
        ];
    }
    
    // Get score needed for next level (5% incremental increase)
    // Base 3000 points (~3-4 minutes of gameplay with current scoring)
    getScoreThreshold() {
        return Math.floor(3000 * Math.pow(1.05, this.currentLevel - 1));
    }
    
    // Get colors for current level
    getLevelColors() {
        return this.colorThemes[(this.currentLevel - 1) % this.colorThemes.length];
    }
    
    // Get score needed for current level progress
    getCurrentLevelProgress(score) {
        const previousThreshold = this.currentLevel > 1 
            ? Math.floor(3000 * Math.pow(1.05, this.currentLevel - 2))
            : 0;
        const currentThreshold = this.getScoreThreshold();
        const progressInLevel = score - previousThreshold;
        const neededForLevel = currentThreshold - previousThreshold;
        return {
            current: progressInLevel,
            needed: neededForLevel,
            percentage: (progressInLevel / neededForLevel) * 100
        };
    }
    
    // Check if should spawn portal
    checkLevelAdvancement(score, gameSpeed) {
        const threshold = this.getScoreThreshold();
        
        // If score threshold reached and portal not yet spawned
        if (score >= threshold && !this.portalSpawned && !this.isTransitioning) {
            this.distanceAfterThreshold += gameSpeed;
            
            // Spawn portal after running the required distance
            if (this.distanceAfterThreshold >= this.portalDistance) {
                return true; // Signal to spawn portal
            }
        }
        
        return false;
    }
    
    // Spawn portal
    spawnPortal(x, groundY) {
        if (!this.portal) {
            this.portal = new Portal(x, groundY);
            this.portalSpawned = true;
        }
    }
    
    // Get distance from player to portal
    getDistanceToPortal(playerX) {
        if (!this.portal) return Infinity;
        return this.portal.x - playerX;
    }
    
    // Check autopilot slowdown
    shouldSlowdown(playerX) {
        if (!this.portalSpawned || !this.portal) return { active: false, multiplier: 1 };
        
        const distance = this.getDistanceToPortal(playerX);
        
        if (distance < 300) {
            this.inAutopilot = true;
            this.stopObstacleSpawning = true;
            
            // Calculate slowdown: from 1.0 to 0.1 over 300px
            const slowdownProgress = 1 - (distance / 300);
            const speedMultiplier = 1 - (slowdownProgress * 0.9); // Slow to 10%
            
            return { 
                active: true, 
                multiplier: speedMultiplier,
                shouldAutoJump: distance < 50
            };
        }
        
        return { active: false, multiplier: 1 };
    }
    
    // Check if player enters portal
    checkPortalEntry(player) {
        if (this.portal && !this.isTransitioning) {
            const collision = this.checkCollision(player.getHitbox(), this.portal.getHitbox());
            if (collision) {
                this.startTransition();
                return true;
            }
        }
        return false;
    }
    
    // Simple collision check
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // Start level transition
    startTransition() {
        this.isTransitioning = true;
        this.transitionStartTime = Date.now();
    }
    
    // Check if transition is complete
    isTransitionComplete() {
        if (!this.isTransitioning) return false;
        return Date.now() - this.transitionStartTime >= this.transitionDuration;
    }
    
    // Advance to next level
    advanceLevel() {
        this.currentLevel++;
        this.portalSpawned = false;
        this.distanceAfterThreshold = 0;
        this.isTransitioning = false;
        this.portal = null;
        this.inAutopilot = false;
        this.stopObstacleSpawning = false;
        
        // Apply difficulty for new level
        applyLevelDifficulty(this.currentLevel);
    }
    
    // Reset for new game
    reset() {
        this.currentLevel = 1;
        this.portalSpawned = false;
        this.distanceAfterThreshold = 0;
        this.isTransitioning = false;
        this.portal = null;
        this.inAutopilot = false;
        this.stopObstacleSpawning = false;
        applyLevelDifficulty(1);
    }
    
    // Update portal animation
    update(gameSpeed) {
        if (this.portal) {
            this.portal.update(gameSpeed);
        }
    }
    
    // Draw portal
    draw(ctx) {
        if (this.portal) {
            this.portal.draw(ctx);
        }
    }
}

// Global level manager instance
let levelManager = null;

function initLevelManager() {
    levelManager = new LevelManager();
}

