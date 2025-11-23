// Character Drawing Functions (called by Player.draw)
// SURREALISTIC animal designs with vibrant colors and exaggerated features

// --- CAT (Enhanced Surrealistic - Neon) ---
function drawCat(ctx, colors, p, animationFrame, isOnGround, legOffset) {
    // Enhanced surrealistic cat colors
    const c = {
        fur: '#FF6600',        // Bright Orange
        stripes: '#00FFFF',    // Cyan stripes
        eyeGlow: '#39FF14',    // Neon green eyes
        nose: '#FF00FF'        // Magenta nose
    };
    
    // 1. TAIL (Animated with stripes)
    const tailWag = Math.sin(animationFrame * 3) * 4;
    ctx.fillStyle = c.fur;
    ctx.fillRect(-2 * p, (4 * p) + tailWag, 2 * p, 2 * p);
    ctx.fillRect(-3 * p, (3 * p) + tailWag, 2 * p, 2 * p);
    
    // Cyan stripe on tail
    ctx.fillStyle = c.stripes;
    ctx.fillRect(-2.5 * p, (3.5 * p) + tailWag, 1 * p, 0.5 * p);
    
    // 2. BACK LEGS
    ctx.fillStyle = c.fur;
    ctx.fillRect(2 * p + legOffset, 7 * p, 2 * p, 2 * p);
    
    // 3. BODY with geometric triangle patterns
    ctx.fillStyle = c.fur;
    ctx.fillRect(2 * p, 4 * p, 6 * p, 3 * p);
    
    // Geometric triangle patterns on body
    ctx.fillStyle = c.stripes;
    ctx.beginPath();
    ctx.moveTo(3 * p, 4.5 * p);
    ctx.lineTo(4 * p, 4.5 * p);
    ctx.lineTo(3.5 * p, 5.5 * p);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(5.5 * p, 5 * p);
    ctx.lineTo(6.5 * p, 5 * p);
    ctx.lineTo(6 * p, 6 * p);
    ctx.fill();
    
    // 4. FRONT LEGS
    ctx.fillStyle = c.fur;
    ctx.fillRect(6 * p - legOffset, 7 * p, 2 * p, 2 * p);
    
    // 5. HEAD
    ctx.fillStyle = c.fur;
    ctx.fillRect(0, 0, 9 * p, 5 * p);
    
    // Pointy Ears
    ctx.fillStyle = c.fur;
    ctx.fillRect(1 * p, -2 * p, 2 * p, 2 * p);
    ctx.fillRect(1 * p, -3 * p, 1 * p, 1 * p);
    ctx.fillRect(6 * p, -2 * p, 2 * p, 2 * p);
    ctx.fillRect(7 * p, -3 * p, 1 * p, 1 * p);
    
    // Cyan ear tips
    ctx.fillStyle = c.stripes;
    ctx.fillRect(1.5 * p, -2.5 * p, 1 * p, 1 * p);
    ctx.fillRect(6.5 * p, -2.5 * p, 1 * p, 1 * p);
    
    // 6. HUGE GLOWING EYES (exaggerated)
    ctx.fillStyle = c.eyeGlow;
    ctx.fillRect(1.5 * p, 1.5 * p, 2 * p, 2 * p); // Left Eye - HUGE
    ctx.fillRect(5.5 * p, 1.5 * p, 2 * p, 2 * p); // Right Eye - HUGE
    
    // Eye pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(2 * p, 2 * p, 1 * p, 1 * p);
    ctx.fillRect(6 * p, 2 * p, 1 * p, 1 * p);
    
    // Eye shine (glowing effect)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2.5 * p, 2.2 * p, 0.5 * p, 0.5 * p);
    ctx.fillRect(6.5 * p, 2.2 * p, 0.5 * p, 0.5 * p);
    
    // Magenta nose
    ctx.fillStyle = c.nose;
    ctx.fillRect(4 * p, 3.5 * p, 1 * p, 0.8 * p);
    
    // Long cyan whiskers
    ctx.fillStyle = c.stripes;
    ctx.fillRect(0, 3.5 * p, 2 * p, 1);
    ctx.fillRect(7 * p, 3.5 * p, 2 * p, 1);
}

// --- FROG (Electric Purple - Zapper) ---
function drawFrog(ctx, colors, p, animationFrame, isOnGround, legOffset) {
    // Surrealistic frog colors
    const c = {
        body: '#9D00FF',       // Electric Purple
        belly: '#FF00FF',      // Magenta belly
        eyes: '#FFFF00',       // Yellow eyes
        tongue: '#FF1493',     // Hot pink tongue
        spots: '#39FF14'       // Neon green spots
    };
    
    // WEBBED FEET (exaggerated)
    const hopOffset = isOnGround ? 0 : -3;
    ctx.fillStyle = c.body;
    // Left foot
    ctx.fillRect(1 * p + legOffset, 7 * p + hopOffset, 3 * p, 1.5 * p);
    // Webbing triangles
    ctx.beginPath();
    ctx.moveTo(1 * p + legOffset, 8 * p + hopOffset);
    ctx.lineTo(2 * p + legOffset, 9 * p + hopOffset);
    ctx.lineTo(3 * p + legOffset, 8 * p + hopOffset);
    ctx.fill();
    
    // Right foot
    ctx.fillRect(5 * p - legOffset, 7 * p + hopOffset, 3 * p, 1.5 * p);
    ctx.beginPath();
    ctx.moveTo(5 * p - legOffset, 8 * p + hopOffset);
    ctx.lineTo(6 * p - legOffset, 9 * p + hopOffset);
    ctx.lineTo(7 * p - legOffset, 8 * p + hopOffset);
    ctx.fill();
    
    // BODY (round and squatty)
    ctx.fillStyle = c.body;
    ctx.fillRect(1 * p, 3 * p, 7 * p, 4 * p); // Main body
    ctx.fillRect(0.5 * p, 4 * p, 8 * p, 2 * p); // Wider middle
    
    // Magenta belly
    ctx.fillStyle = c.belly;
    ctx.fillRect(2.5 * p, 4.5 * p, 4 * p, 2 * p);
    
    // Geometric circle spots on body
    ctx.fillStyle = c.spots;
    ctx.fillRect(1.5 * p, 3.5 * p, 1.5 * p, 1.5 * p); // Left spot
    ctx.fillRect(6 * p, 4 * p, 1.5 * p, 1.5 * p); // Right spot
    ctx.fillRect(3.5 * p, 5.5 * p, 1 * p, 1 * p); // Bottom spot
    
    // HEAD (merged with body)
    ctx.fillStyle = c.body;
    ctx.fillRect(0.5 * p, 0, 8 * p, 4 * p);
    
    // HUGE BULGING EYES (exaggerated!)
    ctx.fillStyle = c.eyes;
    ctx.fillRect(1 * p, -1 * p, 2.5 * p, 3 * p); // Left eye - HUGE
    ctx.fillRect(5.5 * p, -1 * p, 2.5 * p, 3 * p); // Right eye - HUGE
    
    // Eye border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(1 * p, -1 * p, 2.5 * p, 3 * p);
    ctx.strokeRect(5.5 * p, -1 * p, 2.5 * p, 3 * p);
    
    // Pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(2 * p, 0.5 * p, 1 * p, 1 * p);
    ctx.fillRect(6.5 * p, 0.5 * p, 1 * p, 1 * p);
    
    // Eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2.5 * p, 0.5 * p, 0.5 * p, 0.5 * p);
    ctx.fillRect(7 * p, 0.5 * p, 0.5 * p, 0.5 * p);
    
    // LONG STICKY TONGUE hanging out
    const tongueWag = Math.sin(animationFrame * 2) * 2;
    ctx.fillStyle = c.tongue;
    ctx.fillRect(3.5 * p, 3 * p, 2 * p, 1 * p); // Mouth
    ctx.fillRect(4 * p, 4 * p + tongueWag, 1 * p, 3 * p); // Tongue hanging down
    // Tongue tip (wider)
    ctx.fillRect(3.5 * p, 6.5 * p + tongueWag, 2 * p, 0.8 * p);
    
    // FRONT ARMS (small)
    ctx.fillStyle = c.body;
    ctx.fillRect(2 * p, 5.5 * p, 1.5 * p, 1.5 * p);
    ctx.fillRect(5.5 * p, 5.5 * p, 1.5 * p, 1.5 * p);
}

// --- DUCK (Hot Pink - Quacky) ---
function drawDuck(ctx, colors, p, animationFrame, isOnGround, legOffset) {
    // Surrealistic duck colors
    const c = {
        body: '#FF69B4',       // Hot Pink
        accent: '#00FFFF',     // Cyan accents
        bill: '#FF6600',       // Bright Orange bill
        wing1: '#FFFF00',      // Yellow wing
        wing2: '#FF00FF',      // Magenta wing
        wing3: '#39FF14'       // Neon green wing
    };
    
    // TINY LEGS (comically small)
    ctx.fillStyle = c.bill;
    ctx.fillRect(3 * p + legOffset, 7.5 * p, 1 * p, 1 * p); // Left
    ctx.fillRect(5 * p - legOffset, 7.5 * p, 1 * p, 1 * p); // Right
    
    // BODY (chubby and round)
    ctx.fillStyle = c.body;
    ctx.fillRect(1.5 * p, 2 * p, 6 * p, 5 * p); // Main body
    ctx.fillRect(1 * p, 3 * p, 7 * p, 3 * p); // Wider middle
    
    // Cyan accent stripe on body
    ctx.fillStyle = c.accent;
    ctx.fillRect(1.5 * p, 4 * p, 6 * p, 0.5 * p);
    
    // RAINBOW GEOMETRIC WINGS (layered)
    const wingFlap = Math.sin(animationFrame * 5) * 2;
    
    // Left wing - layered rainbow
    ctx.fillStyle = c.wing1; // Yellow layer
    ctx.fillRect(0.5 * p, 4 * p + wingFlap, 2 * p, 2 * p);
    ctx.fillStyle = c.wing2; // Magenta layer
    ctx.fillRect(-0.5 * p, 4.5 * p + wingFlap, 2 * p, 1.5 * p);
    ctx.fillStyle = c.wing3; // Green tip
    ctx.fillRect(-1 * p, 5 * p + wingFlap, 1.5 * p, 1 * p);
    
    // Right wing - layered rainbow
    ctx.fillStyle = c.wing1;
    ctx.fillRect(6.5 * p, 4 * p - wingFlap, 2 * p, 2 * p);
    ctx.fillStyle = c.wing2;
    ctx.fillRect(7.5 * p, 4.5 * p - wingFlap, 2 * p, 1.5 * p);
    ctx.fillStyle = c.wing3;
    ctx.fillRect(8.5 * p, 5 * p - wingFlap, 1.5 * p, 1 * p);
    
    // HEAD
    ctx.fillStyle = c.body;
    ctx.fillRect(2 * p, 0, 5 * p, 3 * p);
    ctx.fillRect(2.5 * p, -0.5 * p, 4 * p, 1 * p); // Top round
    
    // HUGE EXAGGERATED BILL (bright orange)
    ctx.fillStyle = c.bill;
    ctx.fillRect(6.5 * p, 1.5 * p, 3 * p, 1.5 * p); // Upper bill
    ctx.fillRect(6.5 * p, 2.5 * p, 3 * p, 1 * p); // Lower bill
    // Bill lines
    ctx.fillStyle = '#FF3300';
    ctx.fillRect(7 * p, 1.8 * p, 0.3 * p, 1.5 * p);
    ctx.fillRect(8 * p, 1.8 * p, 0.3 * p, 1.5 * p);
    
    // EYES
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2.5 * p, 1 * p, 1.5 * p, 1.5 * p);
    ctx.fillRect(5 * p, 1 * p, 1.5 * p, 1.5 * p);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(3 * p, 1.3 * p, 0.8 * p, 0.8 * p);
    ctx.fillRect(5.5 * p, 1.3 * p, 0.8 * p, 0.8 * p);
    
    // COMICALLY LARGE TAIL FEATHERS (geometric)
    const tailWag = Math.sin(animationFrame * 3) * 2;
    ctx.fillStyle = c.wing1;
    ctx.fillRect(-1.5 * p, 5 * p + tailWag, 2 * p, 1.5 * p);
    ctx.fillStyle = c.wing2;
    ctx.fillRect(-2 * p, 5.5 * p + tailWag, 2 * p, 1 * p);
    ctx.fillStyle = c.wing3;
    ctx.fillRect(-2.5 * p, 6 * p + tailWag, 2 * p, 1 * p);
}

// --- COW (Neon Pink/Cyan - Moo-tron) ---
function drawCow(ctx, colors, p, animationFrame, isOnGround, legOffset) {
    // Surrealistic cow colors
    const c = {
        base: '#FF69B4',       // Hot Pink base
        patches: '#00FFFF',    // Cyan patches (not black!)
        accent: '#FFFF00',     // Yellow accents
        horns: '#FF00FF',      // Magenta horns
        udder: '#FF1493'       // Deep pink udder
    };
    
    // LEGS
    ctx.fillStyle = c.base;
    ctx.fillRect(2 * p + legOffset, 6.5 * p, 1.5 * p, 2 * p); // Back left
    ctx.fillRect(3.5 * p + legOffset, 6.5 * p, 1.5 * p, 2 * p); // Back right
    ctx.fillRect(5.5 * p - legOffset, 6.5 * p, 1.5 * p, 2 * p); // Front left
    ctx.fillRect(7 * p - legOffset, 6.5 * p, 1.5 * p, 2 * p); // Front right
    
    // EXAGGERATED UDDER
    ctx.fillStyle = c.udder;
    ctx.fillRect(3 * p, 6 * p, 3 * p, 1 * p);
    ctx.fillRect(3.5 * p, 6.5 * p, 0.5 * p, 0.8 * p); // Teat 1
    ctx.fillRect(4.5 * p, 6.5 * p, 0.5 * p, 0.8 * p); // Teat 2
    ctx.fillRect(5.5 * p, 6.5 * p, 0.5 * p, 0.8 * p); // Teat 3
    
    // BODY (rectangular, chunky)
    ctx.fillStyle = c.base;
    ctx.fillRect(1 * p, 3.5 * p, 7.5 * p, 3 * p);
    
    // GEOMETRIC SQUARE/DIAMOND PATCHES (not traditional spots!)
    ctx.fillStyle = c.patches;
    // Diamond 1
    ctx.beginPath();
    ctx.moveTo(2 * p, 4 * p);
    ctx.lineTo(3 * p, 4.5 * p);
    ctx.lineTo(2 * p, 5 * p);
    ctx.lineTo(1 * p, 4.5 * p);
    ctx.fill();
    
    // Square 2
    ctx.fillRect(4.5 * p, 4 * p, 1.5 * p, 1.5 * p);
    
    // Diamond 3
    ctx.beginPath();
    ctx.moveTo(7 * p, 5 * p);
    ctx.lineTo(7.5 * p, 5.5 * p);
    ctx.lineTo(7 * p, 6 * p);
    ctx.lineTo(6.5 * p, 5.5 * p);
    ctx.fill();
    
    // TAIL (swishing)
    const tailSwish = Math.sin(animationFrame * 4) * 3;
    ctx.fillStyle = c.base;
    ctx.fillRect(8 * p, 4.5 * p, 1 * p, 2 * p);
    ctx.fillRect(8.5 * p + tailSwish, 5.5 * p, 1 * p, 2 * p); // Tail tuft
    ctx.fillStyle = c.patches;
    ctx.fillRect(9 * p + tailSwish, 6.5 * p, 0.8 * p, 1 * p); // Cyan tip
    
    // HEAD (boxy with snout)
    ctx.fillStyle = c.base;
    ctx.fillRect(1.5 * p, 0.5 * p, 5 * p, 4 * p);
    
    // Cyan patch on head
    ctx.fillStyle = c.patches;
    ctx.fillRect(2 * p, 1 * p, 2 * p, 2 * p);
    
    // SNOUT/NOSE
    ctx.fillStyle = c.base;
    ctx.fillRect(6 * p, 2 * p, 2.5 * p, 2 * p);
    // Nostrils
    ctx.fillStyle = '#000000';
    ctx.fillRect(6.5 * p, 2.8 * p, 0.5 * p, 0.6 * p);
    ctx.fillRect(7.5 * p, 2.8 * p, 0.5 * p, 0.6 * p);
    
    // HORNS (magenta, exaggerated)
    ctx.fillStyle = c.horns;
    ctx.fillRect(1.5 * p, -0.5 * p, 1 * p, 1.5 * p); // Left horn base
    ctx.fillRect(1.2 * p, -1.5 * p, 0.6 * p, 1 * p); // Left horn tip
    ctx.fillRect(5.5 * p, -0.5 * p, 1 * p, 1.5 * p); // Right horn base
    ctx.fillRect(5.8 * p, -1.5 * p, 0.6 * p, 1 * p); // Right horn tip
    
    // BIG GOOFY EYES
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2.5 * p, 1.5 * p, 1.8 * p, 1.8 * p); // Left eye
    ctx.fillRect(4.5 * p, 1.5 * p, 1.8 * p, 1.8 * p); // Right eye
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(3 * p, 2 * p, 1 * p, 1 * p); // Left pupil
    ctx.fillRect(5 * p, 2 * p, 1 * p, 1 * p); // Right pupil
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(3.5 * p, 2.2 * p, 0.4 * p, 0.4 * p); // Left shine
    ctx.fillRect(5.5 * p, 2.2 * p, 0.4 * p, 0.4 * p); // Right shine
    
    // GRINNING TEETH (visible)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(6.5 * p, 3.5 * p, 1.5 * p, 0.5 * p); // Teeth row
    ctx.fillStyle = '#000000';
    ctx.fillRect(6.8 * p, 3.5 * p, 0.2 * p, 0.5 * p); // Tooth gap
    ctx.fillRect(7.3 * p, 3.5 * p, 0.2 * p, 0.5 * p); // Tooth gap
    
    // EARS
    ctx.fillStyle = c.base;
    ctx.fillRect(1 * p, 0.8 * p, 1.2 * p, 2 * p); // Left ear
    ctx.fillRect(6 * p, 0.8 * p, 1.2 * p, 2 * p); // Right ear
    ctx.fillStyle = c.accent;
    ctx.fillRect(1.2 * p, 1.2 * p, 0.6 * p, 1 * p); // Left ear inner
    ctx.fillRect(6.2 * p, 1.2 * p, 0.6 * p, 1 * p); // Right ear inner
}

// --- DOG (Electric Yellow/Purple - Barkley) ---
function drawDog(ctx, colors, p, animationFrame, isOnGround, legOffset) {
    // Surrealistic dog colors
    const c = {
        body: '#FFFF00',       // Neon Yellow
        accent: '#9D00FF',     // Electric Purple
        tongue: '#FF00FF',     // Bright Magenta tongue
        nose: '#FF1493',       // Hot pink nose
        pattern: '#00FFFF'     // Cyan pattern
    };
    
    // LEGS
    ctx.fillStyle = c.body;
    ctx.fillRect(2 * p + legOffset, 7 * p, 1.5 * p, 2 * p);
    ctx.fillRect(6 * p - legOffset, 7 * p, 1.5 * p, 2 * p);
    
    // Lightning bolt pattern on legs
    ctx.fillStyle = c.pattern;
    ctx.fillRect(2.3 * p + legOffset, 7.5 * p, 0.4 * p, 0.8 * p);
    ctx.fillRect(6.3 * p - legOffset, 7.5 * p, 0.4 * p, 0.8 * p);
    
    // BODY
    ctx.fillStyle = c.body;
    ctx.fillRect(1.5 * p, 4 * p, 6.5 * p, 3.5 * p);
    
    // ZIGZAG/LIGHTNING PATTERN on body
    ctx.fillStyle = c.pattern;
    // Lightning bolt shape
    ctx.beginPath();
    ctx.moveTo(3 * p, 4.5 * p);
    ctx.lineTo(3.5 * p, 5 * p);
    ctx.lineTo(3 * p, 5.5 * p);
    ctx.lineTo(3.8 * p, 6 * p);
    ctx.lineTo(3.5 * p, 6.5 * p);
    ctx.lineTo(4 * p, 6 * p);
    ctx.lineTo(4.5 * p, 5.5 * p);
    ctx.lineTo(4 * p, 5 * p);
    ctx.lineTo(4.5 * p, 4.5 * p);
    ctx.fill();
    
    // Purple accent stripes
    ctx.fillStyle = c.accent;
    ctx.fillRect(1.5 * p, 4.5 * p, 6.5 * p, 0.3 * p);
    ctx.fillRect(1.5 * p, 6 * p, 6.5 * p, 0.3 * p);
    
    // EXAGGERATED WAGGING TAIL
    const wag = Math.sin(animationFrame * 10) * 5; // Fast wag!
    ctx.fillStyle = c.body;
    ctx.fillRect(-0.5 * p, 5 * p + wag, 2 * p, 1.5 * p);
    ctx.fillRect(-1.5 * p, 5.5 * p + wag, 1.5 * p, 1 * p);
    // Purple tip on tail
    ctx.fillStyle = c.accent;
    ctx.fillRect(-2 * p, 5.8 * p + wag, 1 * p, 0.5 * p);
    
    // HEAD
    ctx.fillStyle = c.body;
    ctx.fillRect(1.5 * p, 0.5 * p, 6 * p, 4.5 * p);
    
    // HUGE FLOPPY EARS with geometric patterns
    ctx.fillStyle = c.body;
    ctx.fillRect(0.5 * p, 1.5 * p, 2 * p, 4 * p); // Left ear
    ctx.fillRect(6.5 * p, 1.5 * p, 2 * p, 4 * p); // Right ear
    
    // Geometric patterns on ears
    ctx.fillStyle = c.accent;
    ctx.fillRect(1 * p, 2 * p, 1 * p, 1 * p); // Left ear square
    ctx.fillRect(1.2 * p, 3.5 * p, 0.6 * p, 0.6 * p); // Left ear small square
    ctx.fillRect(7 * p, 2 * p, 1 * p, 1 * p); // Right ear square
    ctx.fillRect(7.2 * p, 3.5 * p, 0.6 * p, 0.6 * p); // Right ear small square
    
    // Cyan accent on ear tips
    ctx.fillStyle = c.pattern;
    ctx.fillRect(1 * p, 4.8 * p, 1.2 * p, 0.5 * p);
    ctx.fillRect(7 * p, 4.8 * p, 1.2 * p, 0.5 * p);
    
    // EYES (happy and big)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2.5 * p, 1.5 * p, 1.5 * p, 1.5 * p);
    ctx.fillRect(5 * p, 1.5 * p, 1.5 * p, 1.5 * p);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(3 * p, 2 * p, 0.8 * p, 0.8 * p);
    ctx.fillRect(5.5 * p, 2 * p, 0.8 * p, 0.8 * p);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(3.3 * p, 2.1 * p, 0.3 * p, 0.3 * p);
    ctx.fillRect(5.8 * p, 2.1 * p, 0.3 * p, 0.3 * p);
    
    // LONG LOLLING TONGUE (bright magenta!)
    const tongueBounce = Math.sin(animationFrame * 3) * 1;
    ctx.fillStyle = c.tongue;
    ctx.fillRect(3.5 * p, 3.8 * p, 2 * p, 1 * p); // Mouth area
    ctx.fillRect(4 * p, 4.8 * p + tongueBounce, 1 * p, 3 * p); // Tongue hanging out
    // Tongue tip (wider)
    ctx.fillRect(3.5 * p, 7.5 * p + tongueBounce, 2 * p, 0.8 * p);
    
    // HOT PINK NOSE
    ctx.fillStyle = c.nose;
    ctx.fillRect(4 * p, 3.3 * p, 1 * p, 0.8 * p);
    
    // Snout
    ctx.fillStyle = c.body;
    ctx.fillRect(3 * p, 3 * p, 3 * p, 1.5 * p);
}

// Export functions for use in Player class
window.CharacterDrawers = {
    cat: drawCat,
    frog: drawFrog,
    duck: drawDuck,
    cow: drawCow,
    dog: drawDog
};
