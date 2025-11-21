"""
Process all CSV data and generate JSON files for the website
"""
import pandas as pd
import json
from datetime import datetime

def calculate_rolling_average(df, window=5):
    """Calculate rolling average for goals"""
    df['goals_for_rolling'] = df['goals_for'].rolling(window=window, min_periods=1).mean().round(2)
    df['goals_against_rolling'] = df['goals_against'].rolling(window=window, min_periods=1).mean().round(2)
    return df

def process_games_data(csv_path, output_path):
    """Process games data with rolling averages"""
    print("\n=== Processing Games Data ===")

    # Read CSV
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} games")

    # Filter out second team games (C Klasse and "Marquartstein II")
    second_team_mask = (
        df['competition'].str.contains('C Klasse', case=False, na=False) |
        df['competition'].str.contains('C-Klasse', case=False, na=False) |
        df['home_team'].str.contains('Marquartstein II', case=False, na=False) |
        df['away_team'].str.contains('Marquartstein II', case=False, na=False)
    )
    df = df[~second_team_mask]
    print(f"After filtering second team: {len(df)} games (first team only)")

    # Parse dates - format: "So. 27.07.2025 18:00"
    # Extract just the date portion after the day abbreviation
    df['date'] = df['date'].str.extract(r'(\d{2}\.\d{2}\.\d{4})')[0]
    df['date'] = pd.to_datetime(df['date'], format='%d.%m.%Y')
    df = df.sort_values('date')

    # Calculate W/D/L from goals
    def get_result_code(row):
        if row['goals_for'] > row['goals_against']:
            return 'W'
        elif row['goals_for'] < row['goals_against']:
            return 'L'
        else:
            return 'D'

    df['result_code'] = df.apply(get_result_code, axis=1)

    # Calculate rolling averages (5-game window)
    df = calculate_rolling_average(df, window=5)

    # Calculate additional statistics
    df['goal_difference'] = df['goals_for'] - df['goals_against']

    # Convert date to string for JSON
    df['date_str'] = df['date'].dt.strftime('%d.%m.%Y')

    # Overall statistics
    total_games = len(df)
    wins = len(df[df['result_code'] == 'W'])
    draws = len(df[df['result_code'] == 'D'])
    losses = len(df[df['result_code'] == 'L'])
    total_goals_for = df['goals_for'].sum()
    total_goals_against = df['goals_against'].sum()

    # Prepare data for JSON
    games_data = {
        'games': df.to_dict('records'),
        'statistics': {
            'total_games': int(total_games),
            'wins': int(wins),
            'draws': int(draws),
            'losses': int(losses),
            'total_goals_for': int(total_goals_for),
            'total_goals_against': int(total_goals_against),
            'goal_difference': int(total_goals_for - total_goals_against),
            'win_percentage': round(wins / total_games * 100, 1) if total_games > 0 else 0,
            'average_goals_for': round(total_goals_for / total_games, 2) if total_games > 0 else 0,
            'average_goals_against': round(total_goals_against / total_games, 2) if total_games > 0 else 0
        },
        'rolling_average_data': {
            'dates': df['date_str'].tolist(),
            'goals_for': df['goals_for_rolling'].tolist(),
            'goals_against': df['goals_against_rolling'].tolist(),
            'goal_difference': df['goal_difference'].tolist()
        }
    }

    # Save to JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(games_data, f, indent=2, ensure_ascii=False, default=str)

    print(f"Games data saved to {output_path}")
    print(f"Statistics: {wins}W-{draws}D-{losses}L")
    print(f"Goals: {total_goals_for} for, {total_goals_against} against")

    return games_data

def process_player_participation(csv_path, output_path, anonymize=True):
    """Process player participation data with optional anonymization"""
    print("\n=== Processing Player Participation Data ===")

    # Read CSV with semicolon delimiter
    df = pd.read_csv(csv_path, sep=';')
    print(f"Loaded {len(df)} participation records")

    # Parse dates - format: "17-11-2025"
    df['event_date_start'] = pd.to_datetime(df['event_date_start'], format='%d-%m-%Y', errors='coerce')

    # Create anonymization mapping if needed
    player_name_map = {}
    if anonymize:
        unique_ids = sorted(df['user_id'].unique())
        for idx, user_id in enumerate(unique_ids, 1):
            player_name_map[user_id] = f"Spieler {idx}"
        print(f"Anonymizing {len(player_name_map)} players")

    # Calculate statistics per player
    player_stats = []

    for user_id in df['user_id'].unique():
        player_data = df[df['user_id'] == user_id]
        real_name = player_data['user_name'].iloc[0]
        player_name = player_name_map.get(user_id, real_name) if anonymize else real_name
        team_name = player_data['team_name'].iloc[0]

        # Count participation types
        confirmed = len(player_data[player_data['user_participation'] == 'STATUS_CONFIRMED'])
        rejected = len(player_data[player_data['user_participation'] == 'STATUS_REJECTED'])
        absent = len(player_data[player_data['user_participation'] == 'STATUS_ABSENCE'])

        # Separate training and games
        training_events = player_data[player_data['event_type'] == 'training']
        game_events = player_data[player_data['event_type'] == 'game']

        training_confirmed = len(training_events[training_events['user_participation'] == 'STATUS_CONFIRMED'])
        games_confirmed = len(game_events[game_events['user_participation'] == 'STATUS_CONFIRMED'])

        total_events = len(player_data)
        attendance_rate = round(confirmed / total_events * 100, 1) if total_events > 0 else 0

        # Anonymize user_id as well (just use sequential numbers)
        anon_user_id = list(player_name_map.keys()).index(user_id) + 1 if anonymize else int(user_id)

        player_stats.append({
            'user_id': anon_user_id,
            'user_name': player_name,
            'team_name': team_name,
            'total_events': int(total_events),
            'confirmed': int(confirmed),
            'rejected': int(rejected),
            'absent': int(absent),
            'training_confirmed': int(training_confirmed),
            'games_confirmed': int(games_confirmed),
            'attendance_rate': attendance_rate
        })

    # Sort by attendance rate
    player_stats.sort(key=lambda x: x['attendance_rate'], reverse=True)

    # Calculate aggregate statistics
    total_events = len(df)
    total_confirmed = len(df[df['user_participation'] == 'STATUS_CONFIRMED'])
    total_rejected = len(df[df['user_participation'] == 'STATUS_REJECTED'])
    total_absence = len(df[df['user_participation'] == 'STATUS_ABSENCE'])

    # Calculate non-responses (STATUS_NOT_NOMINATED or STATUS_NOT_CHOOSED means didn't respond)
    total_no_response = len(df[df['user_participation'].isin(['STATUS_NOT_NOMINATED', 'STATUS_NOT_CHOOSED'])])
    total_responses = total_confirmed + total_rejected + total_absence

    # Get unique training and game sessions
    unique_training_sessions = df[df['event_type'] == 'training']['event_id'].nunique()
    unique_game_sessions = df[df['event_type'] == 'game']['event_id'].nunique()

    # Calculate average attendance per training over time
    training_df = df[df['event_type'] == 'training'].copy()
    training_attendance = training_df.groupby(['event_id', 'event_date_start']).agg({
        'user_participation': lambda x: (x == 'STATUS_CONFIRMED').sum()
    }).reset_index()
    training_attendance.columns = ['event_id', 'date', 'confirmed_count']
    training_attendance = training_attendance.sort_values('date')

    # Calculate rolling average (6-session window)
    training_attendance['rolling_avg'] = training_attendance['confirmed_count'].rolling(window=6, min_periods=1).mean().round(1)

    # Monthly aggregation
    training_attendance['month'] = training_attendance['date'].dt.to_period('M').astype(str)
    monthly_training = training_attendance.groupby('month').agg({
        'event_id': 'count',  # number of trainings
        'confirmed_count': 'mean'  # average attendees
    }).reset_index()
    monthly_training.columns = ['month', 'training_count', 'avg_attendees']

    participation_data = {
        'overall_statistics': {
            'unique_players': len(df['user_id'].unique()),
            'total_training_sessions': int(unique_training_sessions),
            'total_game_sessions': int(unique_game_sessions),
            'total_events': int(unique_training_sessions + unique_game_sessions),
            'total_event_registrations': int(total_events),
            'total_confirmed': int(total_confirmed),
            'total_rejected': int(total_rejected),
            'total_absence': int(total_absence),
            'total_responses': int(total_responses),
            'total_no_response': int(total_no_response),
            'response_rate': round(total_responses / total_events * 100, 1) if total_events > 0 else 0,
            'no_response_rate': round(total_no_response / total_events * 100, 1) if total_events > 0 else 0,
            'overall_attendance_rate': round(total_confirmed / total_events * 100, 1) if total_events > 0 else 0,
            'avg_attendees_per_training': round(training_attendance['confirmed_count'].mean(), 1) if len(training_attendance) > 0 else 0
        },
        'monthly_training_stats': {
            'months': monthly_training['month'].tolist(),
            'training_counts': monthly_training['training_count'].tolist(),
            'avg_attendees': [round(x, 1) for x in monthly_training['avg_attendees'].tolist()]
        },
        'training_attendance_over_time': {
            'dates': [d.strftime('%d.%m.%Y') if pd.notna(d) else '' for d in training_attendance['date']],
            'attendees': training_attendance['confirmed_count'].tolist(),
            'rolling_avg': training_attendance['rolling_avg'].tolist()
        }
    }

    # Save to JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(participation_data, f, indent=2, ensure_ascii=False)

    print(f"Player participation data saved to {output_path}")
    print(f"Unique players: {len(df['user_id'].unique())}")
    print(f"Overall attendance rate: {participation_data['overall_statistics']['overall_attendance_rate']}%")

    return participation_data

if __name__ == '__main__':
    # File paths
    games_csv = '/home/shell/test_fb/data/games_first_second_team_friendlies.csv'
    player_csv = '/home/shell/test_fb/data/training_game_playerlist.csv'

    games_output = '/home/shell/test_fb/website/assets/data/games_stats.json'
    player_output = '/home/shell/test_fb/website/assets/data/player_participation.json'

    # Process all data
    print("Starting data processing...")

    games_data = process_games_data(games_csv, games_output)
    player_data = process_player_participation(player_csv, player_output)

    print("\n=== All Data Processing Complete! ===")
    print(f"Games data: {games_output}")
    print(f"Player data: {player_output}")
