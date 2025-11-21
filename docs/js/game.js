/**
 * Interactive Snowflake Game
 * Catch snowflakes to win prizes!
 */

// Game configuration
const GAME_CONFIG = {
    goal: 10,  // Number of snowflakes to catch (easily adjustable)
    respawnDelay: 1000,  // Delay before respawning snowflake (ms)
    progressBarDisplayTime: 3000,  // How long to show progress bar (ms)
};

// Prize configuration with weights (higher = more common)
const PRIZES = [
    {
        name: 'Morgen auframa',
        emoji: '🧹',
        weight: 34,
        title: 'Oh nein!',
        message: 'Du musst morgen auframa! 😂'
    },
    {
        name: 'Kabinendienst',
        emoji: '🚿',
        weight: 20,
        title: 'Du hast gewonnen...',
        message: 'Kabinendienst! 😅'
    },
    {
        name: 'A scharfe Chilli vom Zapp',
        emoji: '🌶️',
        weight: 10,
        title: 'Heißer Gewinn!',
        message: 'A scharfe Chilli vom Zapp! 🔥'
    },
    {
        name: 'Schias liaba moi a Bude',
        emoji: '🎯',
        weight: 10,
        title: 'Treffer!',
        message: 'Schias liaba moi a Bude! 😂⚽'
    },
    {
        name: 'Wennst sonst so treffsicher waradst',
        emoji: '🥅',
        weight: 10,
        title: 'Treffsicher?',
        message: 'Wennst sonst so treffsicher waradst! 😂'
    },
    {
        name: 'A Hoibe Freibier',
        emoji: '🍺',
        weight: 10,
        title: 'Nicht schlecht!',
        message: 'A Hoibe Freibier für dich! 🎉'
    },
    {
        name: 'Goasmaß',
        emoji: '🍻',
        weight: 6,
        title: 'JACKPOT!',
        message: 'Eine Goasmaß! 🎊🎊🎊'
    }
];

// Game state
let gameState = {
    caughtCount: 0,
    isGameOver: false,
    progressBarHideTimer: null
};

/**
 * Initialize the game when page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Initializing Snowflake Game...');

    // Set goal count in UI
    document.getElementById('goalCount').textContent = GAME_CONFIG.goal;

    // Add click listeners to all snowflakes
    initializeSnowflakes();

    // Add play again button listener
    document.getElementById('playAgainBtn').addEventListener('click', resetGame);

    console.log('✅ Game initialized!');
});

/**
 * Initialize snowflake click handlers
 */
function initializeSnowflakes() {
    const snowflakes = document.querySelectorAll('.snowflake');

    snowflakes.forEach((snowflake, index) => {
        // Add click event for desktop
        snowflake.addEventListener('click', function(e) {
            if (!gameState.isGameOver) {
                catchSnowflake(snowflake);
            }
        });

        // Add touch event for mobile (prevents double-firing)
        snowflake.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (!gameState.isGameOver) {
                catchSnowflake(snowflake);
            }
        }, { passive: false });
    });
}

/**
 * Handle catching a snowflake
 */
function catchSnowflake(snowflakeElement) {
    // Check if already caught
    if (snowflakeElement.classList.contains('caught')) {
        return;
    }

    // Mark as caught
    snowflakeElement.classList.add('caught');

    // Increment counter
    gameState.caughtCount++;

    // Update UI
    updateProgressBar();

    // Play sound effect (optional - could add later)
    // playSound('pop');

    // Respawn snowflake after delay
    setTimeout(() => {
        respawnSnowflake(snowflakeElement);
    }, GAME_CONFIG.respawnDelay);

    // Check if game is won
    if (gameState.caughtCount >= GAME_CONFIG.goal) {
        winGame();
    }
}

/**
 * Respawn a snowflake at the top
 */
function respawnSnowflake(snowflakeElement) {
    // Remove caught class
    snowflakeElement.classList.remove('caught');

    // Reset position to top (by removing and re-adding animation)
    const animation = snowflakeElement.style.animation;
    snowflakeElement.style.animation = 'none';

    // Force reflow
    snowflakeElement.offsetHeight;

    // Re-enable animation
    snowflakeElement.style.animation = animation || '';
}

/**
 * Show progress bar (slides down)
 */
function showProgressBar() {
    const progressBar = document.getElementById('gameProgressBar');
    progressBar.classList.add('visible');

    // Clear existing hide timer
    if (gameState.progressBarHideTimer) {
        clearTimeout(gameState.progressBarHideTimer);
    }

    // Set new hide timer
    gameState.progressBarHideTimer = setTimeout(() => {
        hideProgressBar();
    }, GAME_CONFIG.progressBarDisplayTime);
}

/**
 * Hide progress bar (slides up)
 */
function hideProgressBar() {
    const progressBar = document.getElementById('gameProgressBar');
    progressBar.classList.remove('visible');
    gameState.progressBarHideTimer = null;
}

/**
 * Update progress bar UI
 */
function updateProgressBar() {
    // Update count text
    document.getElementById('caughtCount').textContent = gameState.caughtCount;

    // Update progress bar fill
    const percentage = (gameState.caughtCount / GAME_CONFIG.goal) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';

    // Show progress bar (will auto-hide after delay)
    showProgressBar();
}

/**
 * Win the game - select random prize and show celebration
 */
function winGame() {
    console.log('🎉 Game won!');
    gameState.isGameOver = true;

    // Select random prize
    const prize = selectRandomPrize();

    // Show celebration modal
    setTimeout(() => {
        showCelebration(prize);
    }, 500);
}

/**
 * Select a random prize based on weights
 */
function selectRandomPrize() {
    // Calculate total weight
    const totalWeight = PRIZES.reduce((sum, prize) => sum + prize.weight, 0);

    // Generate random number between 0 and totalWeight
    let random = Math.random() * totalWeight;

    // Select prize based on weights
    for (let prize of PRIZES) {
        random -= prize.weight;
        if (random <= 0) {
            return prize;
        }
    }

    // Fallback (should never reach here)
    return PRIZES[0];
}

/**
 * Show celebration modal with prize
 */
function showCelebration(prize) {
    const modal = document.getElementById('celebrationModal');

    // Update modal content
    document.getElementById('prizeEmoji').textContent = prize.emoji;
    document.getElementById('prizeTitle').textContent = prize.title;
    document.getElementById('prizeMessage').textContent = prize.message;

    // Show modal
    modal.classList.add('show');

    // Log prize for fun
    console.log(`🎁 Prize won: ${prize.name}`);
}

/**
 * Reset game to play again
 */
function resetGame() {
    console.log('🔄 Resetting game...');

    // Clear any existing hide timer
    if (gameState.progressBarHideTimer) {
        clearTimeout(gameState.progressBarHideTimer);
    }

    // Reset game state
    gameState.caughtCount = 0;
    gameState.isGameOver = false;
    gameState.progressBarHideTimer = null;

    // Hide progress bar immediately
    hideProgressBar();

    // Reset progress bar display to 0%
    document.getElementById('caughtCount').textContent = 0;
    document.getElementById('progressFill').style.width = '0%';

    // Hide modal
    document.getElementById('celebrationModal').classList.remove('show');

    // Reset all snowflakes
    const snowflakes = document.querySelectorAll('.snowflake');
    snowflakes.forEach(snowflake => {
        snowflake.classList.remove('caught');
    });

    console.log('✅ Game reset!');
}

/**
 * Optional: Play sound effect
 * Uncomment and add sound files if desired
 */
/*
function playSound(soundName) {
    const audio = new Audio(`assets/sounds/${soundName}.mp3`);
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Sound play failed:', e));
}
*/

// Export for debugging (optional)
window.SnowflakeGame = {
    state: gameState,
    config: GAME_CONFIG,
    prizes: PRIZES,
    reset: resetGame
};
