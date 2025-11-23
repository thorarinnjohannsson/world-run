// DIFFICULTY SCALING - Level-based system

// Difficulty constants
const BASE_SPEED = 5.0; // Starting speed
const BASE_INTERVAL = 1600; // Starting spawn interval
const MAX_DIFFICULTY_TIME = 120; // Time-based scaling within level

// Current difficulty values
let gameSpeed = BASE_SPEED;
let multiLevelChance = 0.15; // Start at 15% chance
let floatingChance = 0.3; // Start at 30% chance
let terrainChance = 0; // Chance of elevated terrain

// Level-based difficulty modifiers
let levelSpeedMultiplier = 1.0;
let levelObstacleMultiplier = 1.0;

// Apply difficulty settings based on level
function applyLevelDifficulty(level) {
    // Speed increases by 15% per level, capped at 2.4x (level 10)
    levelSpeedMultiplier = Math.min(1 + (level - 1) * 0.15, 2.4);
    
    // Base speed for level
    const levelBaseSpeed = BASE_SPEED * levelSpeedMultiplier;
    gameSpeed = levelBaseSpeed;
    
    // Obstacle spawn frequency increases per level
    // Reduces spawn interval by 10% per level, minimum 50% of base
    levelObstacleMultiplier = Math.max(1 - (level - 1) * 0.1, 0.5);
    spawnInterval = BASE_INTERVAL * levelObstacleMultiplier;
    
    // Multi-level obstacle chance increases per level
    // Level 1-2: 15-20%
    // Level 3+: 30-60%
    if (level <= 2) {
        multiLevelChance = 0.15 + level * 0.025;
    } else {
        multiLevelChance = Math.min(0.3 + (level - 3) * 0.1, 0.6);
    }
    
    // Floating platforms
    // Level 1-2: 30%
    // Level 3+: gradually increase to 50%
    if (level <= 2) {
        floatingChance = 0.3;
    } else {
        floatingChance = Math.min(0.3 + (level - 2) * 0.05, 0.5);
    }
    
    // Terrain (elevated ground)
    // Level 1-6: None
    // Level 7+: gradually increase
    if (level < 7) {
        terrainChance = 0;
    } else {
        terrainChance = Math.min((level - 6) * 0.05, 0.25);
    }
}

// Get difficulty multiplier based on time (within level)
function getDifficultyMultiplier(timeElapsed) {
    // Progress from 0 to 1 over MAX_DIFFICULTY_TIME
    const progress = Math.min(timeElapsed / MAX_DIFFICULTY_TIME, 1);
    
    // Ease-in curve for smoother progression
    const easedProgress = progress * progress;
    
    // Multiply from 1x to 1.3x within level
    return 1 + easedProgress * 0.3;
}

// Update difficulty based on elapsed time (within current level)
function updateDifficulty(timeElapsed) {
    const mult = getDifficultyMultiplier(timeElapsed);
    
    // Apply time-based multiplier on top of level multiplier
    const levelBaseSpeed = BASE_SPEED * levelSpeedMultiplier;
    gameSpeed = levelBaseSpeed * mult;
    
    // Update spawn interval
    const levelBaseInterval = BASE_INTERVAL * levelObstacleMultiplier;
    spawnInterval = levelBaseInterval / mult;
}

// Reset difficulty (for new game)
function resetDifficulty() {
    applyLevelDifficulty(1);
    lastSpawnTime = Date.now();
}

