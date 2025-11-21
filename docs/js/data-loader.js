/**
 * Data Loader for TSV Marquartstein Statistics
 * Loads all JSON data files and makes them available globally
 */

const DataLoader = {
    colors: null,
    gamesStats: null,
    playerParticipation: null,
    historicalPlayers: null,

    /**
     * Load all data files
     */
    async loadAll() {
        try {
            console.log('Loading all data...');

            // Load all JSON files in parallel
            const [colors, games, players, historical] = await Promise.all([
                this.loadJSON('assets/data/colors.json'),
                this.loadJSON('assets/data/games_stats.json'),
                this.loadJSON('assets/data/player_participation.json'),
                this.loadJSON('assets/data/historical_players.json')
            ]);

            this.colors = colors;
            this.gamesStats = games;
            this.playerParticipation = players;
            this.historicalPlayers = historical;

            console.log('All data loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            return false;
        }
    },

    /**
     * Load a single JSON file
     */
    async loadJSON(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load ${path}: ${response.statusText}`);
        }
        return response.json();
    },

    /**
     * Get club colors for charts
     */
    getColors() {
        return {
            primary: this.colors?.primary || '#53a612',
            secondary: this.colors?.secondary || '#c0c7c7',
            accent: this.colors?.accent || '#04a0f6',
            highlight: this.colors?.highlight || '#8b0000',
            christmas: {
                red: '#c41e3a',
                green: '#165b33',
                gold: '#d4af37'
            }
        };
    }
};

// Make DataLoader available globally
window.DataLoader = DataLoader;
