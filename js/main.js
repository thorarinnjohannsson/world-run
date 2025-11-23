// MAIN GAME LOGIC AND LOOP

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants (will be updated based on canvas size)
let GROUND_Y = 320; // Will be recalculated
let PLAYER_START_X = 100;
let PLAYER_START_Y = 280; // Will be recalculated

// Setup responsive canvas
function setupResponsiveCanvas() {
    const size = getOptimalCanvasSize();
    canvas.width = size.width;
    canvas.height = size.height;
    
    // Update game constants based on canvas size
    updateGameDimensions();
}

// Update game dimensions when canvas size changes
function updateGameDimensions() {
    GROUND_Y = canvas.height - 80;
    PLAYER_START_X = 100;
    PLAYER_START_Y = GROUND_Y - 40;
    
    // Update player position if in game
    if (player) {
        player.y = Math.min(player.y, GROUND_Y - player.height);
    }
}

// Game states
const GAME_STATES = {
    START_SCREEN: 'START_SCREEN',
    COUNTDOWN: 'COUNTDOWN',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
};

// Pause management
let wasPausedByUser = false; // Track if pause was user-initiated vs life-loss
let pausedTime = 0; // Track time spent paused

// Game variables
let gameState = GAME_STATES.START_SCREEN;
let player = null;
let obstacles = [];
let particles = []; // Particle effects
let trailParticles = []; // Trail particles
let ripples = []; // Touch ripple effects
let score = 0;
let lives = 3;
let startTime = 0;
let elapsedTime = 0;
let pauseCountdown = 0;
let countdownInterval = null;

// Level colors
let currentLevelColors = null;

// Screen shake effect
let screenShake = 0;
let shakeOffsetX = 0;
let shakeOffsetY = 0;
let groundScroll = 0; // Track ground texture scrolling

// Selected character
let selectedCharacter = null;

// Character options (Surrealistic Animals)
const characters = [
    { id: 'cat', name: 'Neon', color: '#FF6600' },      // Bright Orange Cat
    { id: 'frog', name: 'Zapper', color: '#9D00FF' },   // Electric Purple Frog
    { id: 'duck', name: 'Quacky', color: '#FF69B4' },   // Hot Pink Duck
    { id: 'cow', name: 'Moo-tron', color: '#00FFFF' },  // Cyan Cow
    { id: 'dog', name: 'Barkley', color: '#FFFF00' }    // Neon Yellow Dog
];

// Expose characters globally for UI
window.characters = characters;

// Initialize game
function init() {
    // Setup responsive canvas first
    setupResponsiveCanvas();
    
    // Initialize level manager
    initLevelManager();
    
    // Start with start screen
    gameState = GAME_STATES.START_SCREEN;
    
    // Load saved character preference
    const savedCharIndex = localStorage.getItem('lastCharacterIndex');
    if (savedCharIndex !== null) {
        const index = parseInt(savedCharIndex);
        if (index >= 0 && index < characters.length) {
            selectedCharacter = characters[index];
        } else {
            selectedCharacter = characters[0];
        }
    } else {
        selectedCharacter = characters[0]; // Smart default
    }
    
    // Set up input handler
    setupInput();
    
    // Set up UI event listeners
    setupUIListeners();
    
    // Start game loop
    gameLoop();
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply screen shake (only on desktop)
    if (screenShake > 0 && shouldUseScreenShake()) {
        shakeOffsetX = (Math.random() - 0.5) * screenShake;
        shakeOffsetY = (Math.random() - 0.5) * screenShake;
        screenShake *= 0.9; // Decay
        if (screenShake < 0.1) screenShake = 0;
        ctx.save();
        ctx.translate(shakeOffsetX, shakeOffsetY);
    }
    
    // Update background if playing
    if (gameState === GAME_STATES.PLAYING) {
        updateBackground();
    }
    
    // Draw background
    drawBackground();
    
    // Handle different game states
    switch (gameState) {
        case GAME_STATES.START_SCREEN:
            drawStartScreen();
            // Check if modal active
            if (gameState === 'HIGHSCORE_MODAL') {
               drawHighScoreModal();
            }
            break;
            
        case 'HIGHSCORE_MODAL':
            drawStartScreen(); // Draw bg
            drawHighScoreModal();
            break;
            
        case GAME_STATES.COUNTDOWN:
            updateCountdown();
            drawGameplay();
            drawCountdownOverlay();
            break;
            
        case GAME_STATES.PLAYING:
            updateGameplay();
            drawGameplay();
            break;
            
        case GAME_STATES.PAUSED:
            drawGameplay();
            drawPauseOverlay();
            break;
            
        case GAME_STATES.GAME_OVER:
            drawGameplay();
            drawGameOverScreen();
            break;
    }
    
    // Restore context if shake was applied
    if (screenShake > 0 || shakeOffsetX !== 0 || shakeOffsetY !== 0) {
        ctx.restore();
        if (screenShake === 0) {
            shakeOffsetX = 0;
            shakeOffsetY = 0;
        }
    }
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Update background position
function updateBackground() {
    if (!parallaxBg) {
        initParallax();
    }
    
    // Update parallax
    parallaxBg.update(gameSpeed);
    
    // Move ground texture
    groundScroll += gameSpeed;
}

// Draw background
function drawBackground() {
    if (!parallaxBg) {
        initParallax();
    }
    
    // Get current level colors (default to Level 1 if not set)
    const levelColors = currentLevelColors || {
        sky: ['#FF00FF', '#FF1493'],
        ground: '#C71585',
        groundTop: '#FF1493',
        groundAccent: '#00FFFF'
    };
    
    // Draw parallax layers with sky colors
    parallaxBg.draw(ctx, canvas.width, GROUND_Y, levelColors.sky);

    // --- GEOMETRIC GROUND BASE ---
    ctx.fillStyle = levelColors.ground; // Deep magenta (or level color)
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    
    // --- GEOMETRIC GRID PATTERN ---
    const gridColors = {
        primary: levelColors.groundTop,
        secondary: levelColors.groundAccent,
        dark: adjustColor(levelColors.ground, -30) // Darker version
    };
    
    const tileSize = 20; // Size of grid cells
    const cols = Math.ceil(canvas.width / tileSize) + 1;
    const rows = Math.ceil((canvas.height - GROUND_Y) / tileSize);
    
    for (let col = 0; col < cols; col++) {
        const worldCol = Math.floor(groundScroll / tileSize) + col;
        const screenX = (worldCol * tileSize) - groundScroll;
        
        if (screenX < -tileSize || screenX > canvas.width) continue;

        for (let row = 0; row < rows; row++) {
            // Deterministic pseudo-random based on world grid position
            const seed = worldCol * 1234 + row * 5678;
            const rand = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000);
            
            const y = GROUND_Y + 30 + (row * tileSize); // Start below surface
            if (y > canvas.height) break;
            
            // Draw geometric squares
            if (rand > 0.85) {
                // Bright pink square
                ctx.fillStyle = gridColors.primary;
                const size = 6 + (rand * 4); // 6-10px
                ctx.fillRect(screenX + 4, y + 4, size, size);
            } else if (rand < 0.15) {
                // Cyan accent square
                ctx.fillStyle = gridColors.secondary;
                const size = 6 + (rand * 4);
                ctx.fillRect(screenX + 8, y + 8, size, size);
            }
        }
    }

    // --- GEOMETRIC PLATFORM SURFACE (Scrolling) ---
    const platformPrimary = levelColors.groundTop; // Bright pink (or level color)
    const platformAccent = levelColors.groundAccent; // Cyan (or level color)
    const platformBorder = gridColors.dark; // Dark magenta (or level color)
    
    // Platform is a repeating pattern. Let's define a block size.
    const blockWidth = 32; 
    const platformTopHeight = 16;
    
    const totalBlocks = Math.ceil(canvas.width / blockWidth) + 1;
    const startBlock = Math.floor(groundScroll / blockWidth);
    
    for (let i = 0; i < totalBlocks; i++) {
        const blockIndex = startBlock + i;
        const x = (blockIndex * blockWidth) - groundScroll;
        
        // 1. Top Solid Layer (Bright Pink)
        ctx.fillStyle = platformPrimary;
        ctx.fillRect(x, GROUND_Y, blockWidth, platformTopHeight);
        
        // 2. Geometric Edge Pattern
        const pixelSize = 4;
        const subBlocks = blockWidth / pixelSize; // 8 sub-blocks
        
        for (let j = 0; j < subBlocks; j++) {
            const subX = x + (j * pixelSize);
            
            // Alternating pattern
            const isEven = j % 2 === 0;
            
            if (isEven) {
                // Cyan accent stripe
                ctx.fillStyle = platformAccent;
                ctx.fillRect(subX, GROUND_Y + platformTopHeight, pixelSize, pixelSize);
                
                // Shadow below it
                ctx.fillStyle = platformBorder;
                ctx.fillRect(subX, GROUND_Y + platformTopHeight + pixelSize, pixelSize, pixelSize);
            } else {
                // Dark border
                ctx.fillStyle = platformBorder;
                ctx.fillRect(subX, GROUND_Y + platformTopHeight, pixelSize, pixelSize * 2);
            }
        }
    }
}

// Helper function to adjust color brightness
function adjustColor(hex, amount) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Adjust each component
    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));
    
    // Convert back to hex
    return '#' + 
        newR.toString(16).padStart(2, '0') +
        newG.toString(16).padStart(2, '0') +
        newB.toString(16).padStart(2, '0');
}

// Draw Pixel Cloud
function drawCloud(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    const pixelSize = 6;
    
    // Define cloud shape using a matrix of 1s (white)
    // 0 = empty, 1 = white, 2 = shadow
    const shape = [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0] // Bottom shadow line would go here manually
    ];

    // Draw Shadow first (offset)
    ctx.fillStyle = '#D3E0EA'; // Light blue-grey
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                ctx.fillRect((c * pixelSize) + pixelSize, (r * pixelSize) + pixelSize, pixelSize, pixelSize);
            }
        }
    }

    // Draw Cloud Body
    ctx.fillStyle = '#FFFFFF';
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
            }
        }
    }
    
    ctx.restore();
}

// Draw Pixel Bush
function drawBush(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    const pixelSize = 5;
    
    // Bush shape definition (centers at bottom)
    // 1 = light green, 2 = dark green
    const shape = [
        [0,0,1,1,1,0,0],
        [0,1,1,1,1,1,0],
        [1,1,1,1,1,1,1],
        [1,1,2,2,2,1,1],
        [1,2,2,2,2,2,1]
    ];
    
    const cols = shape[0].length;
    const rows = shape.length;
    const width = cols * pixelSize;
    const height = rows * pixelSize;
    
    // Offset to draw relative to bottom center
    const xOff = -width / 2;
    const yOff = -height;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const val = shape[r][c];
            if (val === 1) {
                ctx.fillStyle = '#43A047'; // Green
                ctx.fillRect(xOff + c * pixelSize, yOff + r * pixelSize, pixelSize, pixelSize);
            } else if (val === 2) {
                ctx.fillStyle = '#2E7D32'; // Dark Green
                ctx.fillRect(xOff + c * pixelSize, yOff + r * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    ctx.restore();
}

// Start a new game
function startNewGame() {
    // Reset game variables
    score = 0;
    lives = 3;
    obstacles = [];
    startTime = Date.now();
    elapsedTime = 0;
    pausedTime = 0;
    wasPausedByUser = false;
    
    // Reset level manager
    if (levelManager) {
        levelManager.reset();
    }
    
    // Set initial level colors
    currentLevelColors = levelManager ? levelManager.getLevelColors() : {
        sky: ['#FF00FF', '#FF1493'],
        ground: '#C71585',
        groundTop: '#FF1493',
        groundAccent: '#00FFFF'
    };
    
    // Reset scoring system
    resetScoring();
    screenShake = 0;
    
    // Create player
    player = new Player(
        PLAYER_START_X,
        PLAYER_START_Y,
        30,
        40,
        selectedCharacter.color,
        selectedCharacter.id || 'cat'
    );
    
    // Save selected character
    const charIndex = characters.indexOf(selectedCharacter);
    if (charIndex !== -1) {
        localStorage.setItem('lastCharacterIndex', charIndex);
    }
    
    // Get player name from input
    const nameInput = document.getElementById('playerNameInput');
    if (nameInput) {
        player.name = nameInput.value.trim() || 'Player';
        // Save for next time
        localStorage.setItem('lastPlayerName', player.name);
        // Hide input
        nameInput.style.display = 'none';
        nameInput.blur(); // Remove focus
    } else {
        player.name = 'Player';
    }
    
    // Reset difficulty
    resetDifficulty();
    
    // Start countdown
    gameState = GAME_STATES.COUNTDOWN;
    startCountdown();
    
    // Start music if enabled
    if (typeof audioManager !== 'undefined') {
        audioManager.startMusic();
    }
}

// Complete level transition
function completeLevelTransition() {
    // Advance to next level
    levelManager.advanceLevel();
    
    // Update level colors
    currentLevelColors = levelManager.getLevelColors();
    
    // Reset lives to 3
    lives = 3;
    
    // Clear all obstacles
    obstacles = [];
    
    // Reset player position
    if (player) {
        player.x = PLAYER_START_X;
        player.y = PLAYER_START_Y;
        player.velocityY = 0;
        player.isOnGround = false;
    }
    
    // Reset time for new level
    startTime = Date.now();
    elapsedTime = 0;
    pausedTime = 0;
    
    // Clear particles
    particles = [];
    trailParticles = [];
    ripples = [];
}

// Draw level transition overlay
function drawLevelTransition() {
    // Calculate transition progress (0 to 1)
    const elapsed = Date.now() - levelManager.transitionStartTime;
    const progress = Math.min(elapsed / levelManager.transitionDuration, 1);
    
    // Fade to black (first half) then fade from black (second half)
    let alpha;
    if (progress < 0.5) {
        // Fade to black
        alpha = progress * 2; // 0 to 1 over first half
    } else {
        // Fade from black
        alpha = 2 - (progress * 2); // 1 to 0 over second half
    }
    
    // Semi-transparent overlay
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get old and new level info
    const oldLevel = levelManager.currentLevel - 1;
    const newLevel = levelManager.currentLevel;
    const newTheme = levelManager.getLevelColors();
    
    // Show "LEVEL COMPLETE" during first half
    if (progress < 0.5) {
        const textAlpha = 1 - (Math.abs(progress - 0.25) / 0.25); // Pulse at 0.25
        ctx.globalAlpha = textAlpha;
        
        // Level complete text
        ctx.fillStyle = currentLevelColors.groundTop || '#FFFF00';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = currentLevelColors.groundTop || '#FFFF00';
        ctx.shadowBlur = 20;
        ctx.fillText(`LEVEL ${oldLevel} COMPLETE!`, canvas.width / 2, canvas.height / 2 - 40);
        ctx.shadowBlur = 0;
        
        // Score display
        ctx.fillStyle = currentLevelColors.groundAccent || '#00FFFF';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        
        ctx.globalAlpha = 1;
    }
    // Show "LEVEL X - Theme" during second half
    else {
        const textAlpha = (progress - 0.5) * 2; // 0 to 1 over second half
        ctx.globalAlpha = textAlpha;
        
        // New level text
        ctx.fillStyle = newTheme.groundTop || '#FF1493';
        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = newTheme.groundTop || '#FF1493';
        ctx.shadowBlur = 30;
        ctx.fillText(`LEVEL ${newLevel}`, canvas.width / 2, canvas.height / 2 - 20);
        ctx.shadowBlur = 0;
        
        // Theme name
        ctx.fillStyle = newTheme.groundAccent || '#00FFFF';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(newTheme.name || 'Next Level', canvas.width / 2, canvas.height / 2 + 40);
        
        ctx.globalAlpha = 1;
    }
    
    ctx.textAlign = 'left';
}

// Start countdown before game
function startCountdown() {
    let count = 3;
    pauseCountdown = count;
    
    countdownInterval = setInterval(() => {
        count--;
        pauseCountdown = count;
        
        if (count <= 0) {
            clearInterval(countdownInterval);
            gameState = GAME_STATES.PLAYING;
            startTime = Date.now(); // Reset start time after countdown
        }
    }, 1000);
}

// Update countdown state
function updateCountdown() {
    // Just wait for the interval to finish
}

// Update gameplay
function updateGameplay() {
    // Don't update if paused by user
    if (wasPausedByUser) return;
    
    // Check if in level transition
    if (levelManager.isTransitioning) {
        if (levelManager.isTransitionComplete()) {
            // Complete transition - advance to next level
            completeLevelTransition();
        }
        return; // Don't update game during transition
    }
    
    // Calculate elapsed time
    const currentTime = Date.now();
    const deltaTime = (currentTime - startTime - pausedTime) / 1000;
    const timeDelta = deltaTime - elapsedTime; // Time since last frame
    elapsedTime = deltaTime;
    
    // Check for autopilot slowdown
    let autopilotInfo = { active: false, multiplier: 1, shouldAutoJump: false };
    if (player && levelManager) {
        autopilotInfo = levelManager.shouldSlowdown(player.x);
    }
    
    // Apply autopilot slowdown to game speed
    let adjustedGameSpeed = gameSpeed;
    if (autopilotInfo.active) {
        adjustedGameSpeed *= autopilotInfo.multiplier;
    }
    
    // Update difficulty (with normal game speed)
    updateDifficulty(elapsedTime);
    
    // Update player
    if (player) {
        player.update(GROUND_Y);
        
        // Auto-jump when near portal
        if (autopilotInfo.shouldAutoJump && player.isOnGround) {
            player.jump(2); // Mid-level jump into portal
        }
        
        // Track if player lands on ground (reset combo)
        if (player.isOnGround && comboTracker.count > 0) {
            comboTracker.reset();
        }
    }
    
    // Update level manager (with adjusted speed)
    levelManager.update(adjustedGameSpeed);
    
    // Check if should spawn portal
    if (levelManager.checkLevelAdvancement(score, adjustedGameSpeed)) {
        levelManager.spawnPortal(canvas.width + 100, GROUND_Y);
    }
    
    // Check if player enters portal
    if (player && levelManager.checkPortalEntry(player)) {
        // Play sound effect
        if (typeof audioManager !== 'undefined') {
            audioManager.playSound('score'); // Reuse score sound for now
        }
    }
    
    // Update obstacles (stop spawning during autopilot, use adjusted speed)
    updateObstacles(autopilotInfo.active, adjustedGameSpeed);
    
    // Update particles
    updateParticles();
    
    // Update trail particles
    updateTrailParticles();
    
    // Update ripples
    updateRipples();
    
    // Update score popups
    updateScorePopups();
    
    // Check collisions
    checkCollisions();
    
    // Update time-based score
    updateTimeScore(timeDelta);
    
    // Update total score
    score = scoreStats.totalScore;
}

// Draw gameplay elements
function drawGameplay() {
    // Draw ripples (at the back)
    drawRipples();
    
    // Draw trail particles (behind player)
    drawTrailParticles();
    
    // Draw particles (behind everything)
    drawParticles();
    
    // Draw portal if exists
    if (levelManager) {
        levelManager.draw(ctx);
    }
    
    // Draw player
    if (player) {
        player.draw(ctx);
    }
    
    // Draw obstacles
    drawObstacles();
    
    // Draw score popups
    drawScorePopups();
    
    // Draw HUD
    if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.PAUSED) {
        drawHUD();
    }
    
    // Draw level transition overlay
    if (levelManager && levelManager.isTransitioning) {
        drawLevelTransition();
    }
}

// Draw HUD (timer, score, lives, level)
function drawHUD() {
    const sizes = getMobileSizes();
    
    ctx.fillStyle = '#333';
    ctx.font = `bold ${sizes.hudSize}px Arial`;
    
    // LEVEL display (top left - prominent)
    ctx.fillStyle = '#FFFF00';
    ctx.font = `bold ${sizes.hudSize + 6}px Arial`;
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 3;
    ctx.fillText(`LEVEL ${levelManager ? levelManager.currentLevel : 1}`, 10, isMobile ? 25 : 30);
    ctx.shadowBlur = 0;
    
    // Progress bar for level
    if (levelManager) {
        const progress = levelManager.getCurrentLevelProgress(score);
        const barWidth = isMobile ? 120 : 150;
        const barHeight = isMobile ? 8 : 10;
        const barX = 10;
        const barY = isMobile ? 32 : 38;
        
        // Background bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress fill
        const fillWidth = (progress.current / progress.needed) * barWidth;
        const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
        gradient.addColorStop(0, '#00FFFF');
        gradient.addColorStop(1, '#FF1493');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, Math.max(0, fillWidth), barHeight);
        
        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Progress text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${isMobile ? 10 : 12}px Arial`;
        ctx.fillText(`${Math.max(0, progress.current)}/${progress.needed}`, barX + barWidth + 5, barY + barHeight);
        
        // Portal indicator when close
        if (levelManager.portalSpawned) {
            ctx.fillStyle = '#FFFF00';
            ctx.font = `bold ${isMobile ? 12 : 14}px Arial`;
            ctx.shadowColor = '#FFFF00';
            ctx.shadowBlur = 10;
            ctx.fillText('⚡ PORTAL AHEAD! ⚡', barX, barY + barHeight + (isMobile ? 15 : 18));
            ctx.shadowBlur = 0;
        }
    }
    
    // Timer (below level info)
    ctx.fillStyle = '#333';
    ctx.font = `bold ${sizes.hudSize}px Arial`;
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = Math.floor(elapsedTime % 60);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    ctx.fillText(`⏱ ${timeStr}`, 10, isMobile ? 62 : 70);
    
    // Pause button (top right of timer area)
    const pauseButtonX = isMobile ? 10 : 150;
    const pauseButtonY = isMobile ? 72 : 50;
    const pauseButtonWidth = isMobile ? 70 : 60;
    const pauseButtonHeight = isMobile ? 30 : 25;
    
    // Draw pause button
    ctx.fillStyle = wasPausedByUser ? '#FFD700' : '#4444FF';
    ctx.fillRect(pauseButtonX, pauseButtonY, pauseButtonWidth, pauseButtonHeight);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(pauseButtonX, pauseButtonY, pauseButtonWidth, pauseButtonHeight);
    
    // Button text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${isMobile ? 12 : 14}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(wasPausedByUser ? 'RESUME' : 'PAUSE', pauseButtonX + pauseButtonWidth / 2, pauseButtonY + pauseButtonHeight / 2 + 5);
    ctx.textAlign = 'left';
    
    // Store button bounds for click detection
    window.pauseButton = {
        x: pauseButtonX,
        y: pauseButtonY,
        width: pauseButtonWidth,
        height: pauseButtonHeight
    };
    
    // Combo display (top center) - only show if combo active
    if (comboTracker.active) {
        const comboText = comboTracker.display;
        ctx.save();
        
        // Pulse effect
        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.1;
        ctx.font = `bold ${Math.floor(sizes.hudSize * 1.2 * pulse)}px Arial`;
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        
        const comboX = canvas.width / 2;
        const comboY = isMobile ? 25 : 30;
        ctx.strokeText(comboText, comboX, comboY);
        ctx.fillText(comboText, comboX, comboY);
        
        ctx.restore();
    }
    
    // Score (top right)
    ctx.font = `bold ${sizes.hudSize}px Arial`;
    ctx.fillStyle = '#333';
    ctx.textAlign = 'right';
    ctx.fillText(`⭐ ${score}`, canvas.width - 10, isMobile ? 25 : 30);
    ctx.textAlign = 'left';
    
    // Lives (top center)
    ctx.textAlign = 'center';
    const hearts = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
    ctx.fillText(hearts, canvas.width / 2, isMobile ? 50 : 55);
    ctx.textAlign = 'left';
    
    // Show tap count if player is tapping
    if (tapCount > 0 && player && player.isOnGround) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
        ctx.font = `bold ${isMobile ? 20 : 24}px Arial`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 3;
        const tapText = `${'👆'.repeat(tapCount)} (${tapCount}x)`;
        ctx.strokeText(tapText, canvas.width / 2, isMobile ? 75 : 80);
        ctx.fillText(tapText, canvas.width / 2, isMobile ? 75 : 80);
        ctx.textAlign = 'left';
    }
    
    // Mobile-specific: Show "TAP to jump" hint at the start
    if (isMobile && elapsedTime < 3) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = `${sizes.instructionSize}px Arial`;
        ctx.textAlign = 'center';
        const alpha = 1 - (elapsedTime / 3); // Fade out
        ctx.globalAlpha = alpha;
        ctx.fillText('TAP anywhere to jump!', canvas.width / 2, canvas.height - 30);
        ctx.globalAlpha = 1.0;
        ctx.textAlign = 'left';
    }
}

// Draw pause overlay
function drawPauseOverlay() {
    // Darken screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (wasPausedByUser) {
        // User paused - show PAUSED text and score breakdown
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, 100);
        
        // Score breakdown box
        const boxY = 140;
        const boxHeight = 140;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width / 2 - 150, boxY, 300, boxHeight);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width / 2 - 150, boxY, 300, boxHeight);
        
        // Score breakdown
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('SCORE BREAKDOWN', canvas.width / 2, boxY + 25);
        
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        
        const leftX = canvas.width / 2 - 130;
        const rightX = canvas.width / 2 + 130;
        
        // Stats
        ctx.fillText('Time:', leftX, boxY + 50);
        ctx.textAlign = 'right';
        ctx.fillText(`${scoreStats.timePoints} pts`, rightX, boxY + 50);
        
        ctx.textAlign = 'left';
        ctx.fillText(`Obstacles (x${scoreStats.obstaclesCleared}):`, leftX, boxY + 72);
        ctx.textAlign = 'right';
        ctx.fillText(`${scoreStats.obstaclePoints} pts`, rightX, boxY + 72);
        
        ctx.textAlign = 'left';
        ctx.fillText('Bonuses:', leftX, boxY + 94);
        ctx.textAlign = 'right';
        ctx.fillText(`${scoreStats.bonusPoints} pts`, rightX, boxY + 94);
        
        // Separator
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftX, boxY + 102);
        ctx.lineTo(rightX, boxY + 102);
        ctx.stroke();
        
        // Total
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('TOTAL:', leftX, boxY + 125);
        ctx.textAlign = 'right';
        ctx.fillText(`${score} pts`, rightX, boxY + 125);
        
        // Resume instructions
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.font = '18px Arial';
        ctx.fillText('Press P to resume', canvas.width / 2, boxY + 170);
        ctx.font = '14px Arial';
        ctx.fillText(isMobile ? 'or tap PAUSE button' : '', canvas.width / 2, boxY + 195);
        
        // Audio Controls in Pause Menu
        if (typeof drawAudioControls === 'function') {
            drawAudioControls(canvas.width / 2 - 35, boxY + 210);
        }
        
        ctx.textAlign = 'left';
    } else {
        // Life lost countdown
        ctx.fillStyle = 'white';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(pauseCountdown > 0 ? pauseCountdown : 'GO!', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
    }
}

// Draw countdown overlay
function drawCountdownOverlay() {
    // Darken screen slightly
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Display countdown
    ctx.fillStyle = 'white';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(pauseCountdown > 0 ? pauseCountdown : 'GO!', canvas.width / 2, canvas.height / 2);
    ctx.textAlign = 'left';
}

// Handle collision event
function onCollision() {
    lives--;
    
    // Reset combo on collision
    comboTracker.reset();
    
    // Screen shake effect
    screenShake = 15;
    
    // Play collision sound
    if (typeof audioManager !== 'undefined') audioManager.playSound('collision');
    
    // Create particle explosion at collision point
    createParticleExplosion(player.x + player.width / 2, player.y + player.height / 2, '#FF4444');
    
    if (lives <= 0) {
        gameState = GAME_STATES.GAME_OVER;
        if (typeof audioManager !== 'undefined') {
            audioManager.playSound('gameOver');
            audioManager.stopMusic();
        }
        saveHighScore(player.name, score);
        return;
    }
    
    // Pause game (from life loss, not user)
    gameState = GAME_STATES.PAUSED;
    wasPausedByUser = false;
    pauseCountdown = 3;
    
    // Clear obstacles near player
    clearObstaclesInRange(player.x, player.x + 300);
    
    const pauseStartTime = Date.now();
    
    // Start countdown
    countdownInterval = setInterval(() => {
        pauseCountdown--;
        
        if (pauseCountdown <= 0) {
            clearInterval(countdownInterval);
            gameState = GAME_STATES.PLAYING;
            pausedTime += Date.now() - pauseStartTime;
        }
    }, 1000);
}

// Toggle pause (user-initiated)
function togglePause() {
    if (gameState === GAME_STATES.PLAYING) {
        // Pause the game
        gameState = GAME_STATES.PAUSED;
        wasPausedByUser = true;
        pauseCountdown = 0; // No countdown for user pause
        pausedTime -= Date.now(); // Start tracking pause time
    } else if (gameState === GAME_STATES.PAUSED && wasPausedByUser) {
        // Unpause the game
        gameState = GAME_STATES.PLAYING;
        wasPausedByUser = false;
        pausedTime += Date.now(); // End tracking pause time
    }
}

// Particle system
class Particle {
    constructor(x, y, vx, vy, color, size, type = 'square') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = 1.0;
        this.decay = 0.02;
        this.type = type; // 'square', 'circle', 'star'
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3; // Gravity
        this.life -= this.decay;
        this.rotation += this.rotationSpeed;
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.type === 'circle') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'star') {
            ctx.fillStyle = this.color;
            this.drawStar(ctx, 0, 0, 5, this.size, this.size / 2);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }
        
        ctx.restore();
        ctx.globalAlpha = 1.0;
    }
    
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// Trail particle class (lighter, fades faster)
class TrailParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = 1.0;
        this.decay = 0.05;
        this.size = 8 + Math.random() * 4;
    }
    
    update() {
        this.life -= this.decay;
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.life * 0.5;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// Create particle explosion - Neon pink/magenta theme
function createParticleExplosion(x, y, color) {
    const particleCount = getParticleCount(15);
    const types = ['square', 'circle', 'star'];
    
    // Override with neon colors for Geometry Dash theme
    const neonColors = ['#FF1493', '#FF69B4', '#00FFFF', '#FFD700'];
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - 2; // Bias upward
        const size = 3 + Math.random() * 3;
        const type = types[Math.floor(Math.random() * types.length)];
        const particleColor = neonColors[Math.floor(Math.random() * neonColors.length)];
        particles.push(new Particle(x, y, vx, vy, particleColor, size, type));
    }
}

// Create jump particles - Neon pink/cyan stars
function createJumpParticles(x, y, level) {
    const particleCount = getParticleCount(3 + level);
    const colors = ['#FF1493', '#00FFFF', '#FFD700', '#FF69B4'];
    
    for (let i = 0; i < particleCount; i++) {
        const vx = (Math.random() - 0.5) * 2;
        const vy = Math.random() * 2;
        const size = 3 + Math.random() * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push(new Particle(x, y, vx, vy, color, size, 'star'));
    }
}

// Create landing particles - Magenta theme
function createLandingParticles(x, y) {
    const particleCount = getParticleCount(5);
    const colors = ['#C71585', '#8B008B', '#FF1493'];
    
    for (let i = 0; i < particleCount; i++) {
        const vx = (Math.random() - 0.5) * 3;
        const vy = -Math.random() * 2;
        const size = 2 + Math.random() * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push(new Particle(x, y, vx, vy, color, size, 'circle'));
    }
}

// Create trail particle - Glowing pink/cyan trail
function createTrailParticle(x, y, color) {
    // Only create trail occasionally for performance
    if (Math.random() > 0.3) return;
    // Override color with neon pink/cyan
    const trailColors = ['#FF1493', '#00FFFF', '#FF69B4'];
    const trailColor = trailColors[Math.floor(Math.random() * trailColors.length)];
    trailParticles.push(new TrailParticle(x, y, trailColor));
}

// Update particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
}

// Update trail particles
function updateTrailParticles() {
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        trailParticles[i].update();
        if (trailParticles[i].isDead()) {
            trailParticles.splice(i, 1);
        }
    }
}

// Draw particles
function drawParticles() {
    particles.forEach(particle => particle.draw(ctx));
}

// Draw trail particles
function drawTrailParticles() {
    trailParticles.forEach(particle => particle.draw(ctx));
}

// Ripple effect class
class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = isMobile ? 40 : 30;
        this.life = 1.0;
        this.speed = isMobile ? 3 : 2.5;
    }
    
    update() {
        this.radius += this.speed;
        this.life = 1 - (this.radius / this.maxRadius);
    }
    
    draw(ctx) {
        if (this.life <= 0) return;
        
        ctx.globalAlpha = this.life * 0.5;
        ctx.strokeStyle = '#FF1493'; // Neon pink
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FF1493';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// Create ripple at touch/click location - Neon pink
function createRipple(x, y) {
    ripples.push(new Ripple(x, y));
}

// Update ripples
function updateRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].update();
        if (ripples[i].isDead()) {
            ripples.splice(i, 1);
        }
    }
}

// Draw ripples
function drawRipples() {
    ripples.forEach(ripple => ripple.draw(ctx));
}

// Initialize game when page loads
window.addEventListener('load', init);

