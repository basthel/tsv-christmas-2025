/**
 * Rotation Prompt
 * Shows overlay prompting users to rotate their phone to landscape mode
 */

// Configuration
const ROTATION_CONFIG = {
    maxWidth: 1024,  // Only show on devices narrower than this (tablets/phones)
    checkDelay: 100   // Delay before checking orientation (ms)
};

/**
 * Initialize rotation prompt on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Initializing rotation prompt...');

    // Check orientation immediately on load
    setTimeout(() => {
        checkOrientation();
    }, ROTATION_CONFIG.checkDelay);

    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);

    // Listen for window resize (more reliable than orientationchange)
    window.addEventListener('resize', debounce(checkOrientation, 250));

    console.log('✅ Rotation prompt initialized!');
});

/**
 * Handle orientation change event
 */
function handleOrientationChange() {
    // Small delay to ensure dimensions are updated
    setTimeout(() => {
        checkOrientation();
    }, ROTATION_CONFIG.checkDelay);
}

/**
 * Check current orientation and show/hide prompt
 */
function checkOrientation() {
    const rotationOverlay = document.getElementById('rotationPrompt');

    if (!rotationOverlay) {
        console.warn('Rotation overlay element not found');
        return;
    }

    // Get current viewport dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Determine if device is mobile/tablet
    const isMobileDevice = width <= ROTATION_CONFIG.maxWidth;

    // Determine if device is in portrait mode
    const isPortrait = height > width;

    // Show prompt if: mobile device AND portrait mode
    if (isMobileDevice && isPortrait) {
        showRotationPrompt();
    } else {
        hideRotationPrompt();
    }
}

/**
 * Show rotation prompt overlay
 */
function showRotationPrompt() {
    const rotationOverlay = document.getElementById('rotationPrompt');

    if (!rotationOverlay.classList.contains('show')) {
        rotationOverlay.classList.add('show');
        console.log('📱 Rotation prompt shown (portrait mode detected)');
    }
}

/**
 * Hide rotation prompt overlay
 */
function hideRotationPrompt() {
    const rotationOverlay = document.getElementById('rotationPrompt');

    if (rotationOverlay.classList.contains('show')) {
        rotationOverlay.classList.remove('show');
        console.log('🔄 Rotation prompt hidden (landscape mode detected)');
    }
}

/**
 * Debounce function to limit how often a function is called
 * Useful for resize events which fire rapidly
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for debugging (optional)
window.RotationPrompt = {
    check: checkOrientation,
    show: showRotationPrompt,
    hide: hideRotationPrompt,
    config: ROTATION_CONFIG
};
