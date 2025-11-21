/**
 * Chart Creator for TSV Marquartstein Statistics
 * Creates all Chart.js visualizations
 */

const ChartCreator = {
    charts: {},

    /**
     * Create the rolling average chart (Featured)
     */
    createRollingAverageChart(data, colors) {
        const ctx = document.getElementById('rollingAverageChart');
        if (!ctx) return;

        const rollingData = data.rolling_average_data;

        this.charts.rollingAverage = new Chart(ctx, {
            type: 'line',
            data: {
                labels: rollingData.dates,
                datasets: [
                    {
                        label: 'Tore erzielt (Durchschnitt)',
                        data: rollingData.goals_for,
                        borderColor: colors.primary,
                        backgroundColor: colors.primary + '30',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        label: 'Tore kassiert (Durchschnitt)',
                        data: rollingData.goals_against,
                        borderColor: colors.highlight,
                        backgroundColor: colors.highlight + '30',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: { size: 14 },
                            padding: 15
                        }
                    },
                    title: {
                        display: true,
                        text: 'Rollierender 5-Spiele-Durchschnitt',
                        font: { size: 16 }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' Tore';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Durchschnittliche Tore'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Datum'
                        }
                    }
                }
            }
        });

        // Generate trend insight
        this.generateTrendInsight(rollingData, colors);
    },

    /**
     * Generate insight text for rolling average trend
     */
    generateTrendInsight(rollingData, colors) {
        const goalsFor = rollingData.goals_for;
        const goalsAgainst = rollingData.goals_against;

        // Compare first half vs second half of season
        const midPoint = Math.floor(goalsFor.length / 2);
        const firstHalfFor = goalsFor.slice(0, midPoint).reduce((a, b) => a + b, 0) / midPoint;
        const secondHalfFor = goalsFor.slice(midPoint).reduce((a, b) => a + b, 0) / (goalsFor.length - midPoint);
        const firstHalfAgainst = goalsAgainst.slice(0, midPoint).reduce((a, b) => a + b, 0) / midPoint;
        const secondHalfAgainst = goalsAgainst.slice(midPoint).reduce((a, b) => a + b, 0) / (goalsAgainst.length - midPoint);

        const forImprovement = secondHalfFor - firstHalfFor;
        const againstImprovement = firstHalfAgainst - secondHalfAgainst;

        let insight = '📊 Trend-Analyse: ';

        if (forImprovement > 0.3 && againstImprovement > 0.3) {
            insight += 'Großartige Entwicklung! Die Mannschaft erzielt mehr Tore und kassiert weniger. 🚀';
        } else if (forImprovement > 0.3) {
            insight += 'Offensive stark verbessert! Die Mannschaft erzielt deutlich mehr Tore. ⚽';
        } else if (againstImprovement > 0.3) {
            insight += 'Defensive stabilisiert! Die Mannschaft kassiert weniger Gegentore. 🛡️';
        } else if (forImprovement < -0.3 && againstImprovement < -0.3) {
            insight += 'Herausfordernde Phase. Fokus auf Training und Teamgeist! 💪';
        } else {
            insight += 'Konstante Leistung über die Saison. Weiter so! 👍';
        }

        document.getElementById('trendInsight').textContent = insight;
    },

    /**
     * Create historical player count chart
     */
    createHistoricalChart(data, colors) {
        const ctx = document.getElementById('historicalChart');
        if (!ctx) return;

        // Extract data
        const seasons = data.data.map(row => row['Saison']);
        const firstTeam = data.data.map(row => row['1.Mannschaft'] || 0);
        const secondTeam = data.data.map(row => row['2.Mannschaft'] || 0);
        const youth = data.data.map(row => row['A-Jugend'] || 0);
        const totalPlayers = data.data.map(row => row['Spieler'] || 0);

        this.charts.historical = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: seasons,
                datasets: [
                    {
                        label: '1. Mannschaft',
                        data: firstTeam,
                        backgroundColor: colors.primary + 'CC',
                        borderColor: colors.primary,
                        borderWidth: 2
                    },
                    {
                        label: '2. Mannschaft',
                        data: secondTeam,
                        backgroundColor: colors.accent + 'CC',
                        borderColor: colors.accent,
                        borderWidth: 2
                    },
                    {
                        label: 'A-Jugend',
                        data: youth,
                        backgroundColor: colors.christmas.gold + 'CC',
                        borderColor: colors.christmas.gold,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: { size: 12 },
                            padding: 10
                        }
                    },
                    title: {
                        display: true,
                        text: 'Spieleranzahl pro Team über 10 Jahre',
                        font: { size: 14 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: false,
                        title: {
                            display: true,
                            text: 'Anzahl Spieler'
                        }
                    },
                    x: {
                        stacked: false,
                        title: {
                            display: true,
                            text: 'Saison'
                        }
                    }
                }
            }
        });
    },

    /**
     * Create training attendance over time chart
     */
    createTrainingAttendanceChart(data, colors) {
        const ctx = document.getElementById('trainingAttendanceChart');
        if (!ctx) return;

        const attendanceData = data.training_attendance_over_time;

        this.charts.trainingAttendance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: attendanceData.dates,
                datasets: [{
                    label: 'Teilnehmer pro Training',
                    data: attendanceData.attendees,
                    borderColor: colors.accent,
                    backgroundColor: colors.accent + '30',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Trainingsteilnahme über das Jahr',
                        font: { size: 14 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Anzahl Teilnehmer'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Datum'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    },

    /**
     * Create monthly training statistics chart
     */
    createMonthlyTrainingChart(data, colors) {
        const ctx = document.getElementById('monthlyTrainingChart');
        if (!ctx) return;

        const monthlyData = data.monthly_training_stats;

        this.charts.monthlyTraining = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.months,
                datasets: [
                    {
                        label: 'Anzahl Trainings',
                        data: monthlyData.training_counts,
                        backgroundColor: colors.primary + 'CC',
                        borderColor: colors.primary,
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Ø Teilnehmer',
                        data: monthlyData.avg_attendees,
                        backgroundColor: colors.christmas.gold + 'CC',
                        borderColor: colors.christmas.gold,
                        borderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Monatliche Trainingsstatistiken',
                        font: { size: 14 }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Anzahl Trainings'
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Ø Teilnehmer'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
};

// Make ChartCreator available globally
window.ChartCreator = ChartCreator;
