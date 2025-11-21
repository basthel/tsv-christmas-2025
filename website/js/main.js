/**
 * Main Application Script
 * Initializes the TSV Marquartstein Statistics Website
 */

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing TSV Marquartstein Statistics...');

    // Show loading state
    showLoadingState();

    // Load all data
    const success = await DataLoader.loadAll();

    if (!success) {
        showErrorState();
        return;
    }

    // Get club colors
    const colors = DataLoader.getColors();

    // Populate all statistics
    populateSeasonOverview(DataLoader.gamesStats);
    populateTrainingStats(DataLoader.playerParticipation);

    // Create all charts
    ChartCreator.createRollingAverageChart(DataLoader.gamesStats, colors);
    ChartCreator.createHistoricalChart(DataLoader.historicalPlayers, colors);
    ChartCreator.createTrainingAttendanceChart(DataLoader.playerParticipation, colors);
    ChartCreator.createMonthlyTrainingChart(DataLoader.playerParticipation, colors);

    // Hide loading state
    hideLoadingState();

    console.log('✅ Website initialized successfully!');
});

/**
 * Populate season overview statistics
 */
function populateSeasonOverview(data) {
    const stats = data.statistics;

    document.getElementById('totalGames').textContent = stats.total_games;
    document.getElementById('totalWins').textContent = stats.wins;
    document.getElementById('totalDraws').textContent = stats.draws;
    document.getElementById('totalLosses').textContent = stats.losses;
    document.getElementById('goalsFor').textContent = stats.total_goals_for;
    document.getElementById('goalsAgainst').textContent = stats.total_goals_against;
}

/**
 * Populate training and participation statistics
 */
function populateTrainingStats(data) {
    const stats = data.overall_statistics;

    document.getElementById('uniquePlayers').textContent = stats.unique_players;
    document.getElementById('totalTrainingSessions').textContent = stats.total_training_sessions;
    document.getElementById('totalGameSessions').textContent = stats.total_game_sessions;
    document.getElementById('avgAttendeesPerTraining').textContent = stats.avg_attendees_per_training;
    document.getElementById('overallAttendance').textContent = stats.overall_attendance_rate;
    document.getElementById('totalConfirmed').textContent = stats.total_confirmed;
}

/**
 * Show loading state
 */
function showLoadingState() {
    // Simple loading indication
    console.log('Loading data...');
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    // Remove loading indication
    console.log('Data loaded!');
}

/**
 * Show error state
 */
function showErrorState() {
    alert('Fehler beim Laden der Daten. Bitte überprüfen Sie Ihre Internetverbindung und laden Sie die Seite neu.');
}

/**
 * Utility: Format number with thousand separators
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Utility: Format percentage
 */
function formatPercentage(num, decimals = 1) {
    return num.toFixed(decimals) + '%';
}

// Make utilities available globally if needed
window.AppUtils = {
    formatNumber,
    formatPercentage
};
