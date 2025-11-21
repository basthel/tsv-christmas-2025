"""
Process Excel file containing 10-year historical player count data
"""
import pandas as pd
import json

def process_excel_to_json(excel_path, output_path):
    """Convert Excel historical data to JSON format"""

    # Read the Excel file
    df = pd.read_excel(excel_path)

    print("Excel file columns:", df.columns.tolist())
    print("\nFirst few rows:")
    print(df.head())
    print(f"\nTotal rows: {len(df)}")

    # Replace NaN values with None for valid JSON
    df = df.fillna(0)

    # Convert to dictionary format suitable for web charts
    data = {
        'columns': df.columns.tolist(),
        'data': df.to_dict('records'),
        'summary': {
            'total_rows': len(df),
            'years': df.columns.tolist() if 'year' not in str(df.columns[0]).lower() else df.iloc[:, 0].tolist()
        }
    }

    # Save to JSON (replace NaN with null)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False, allow_nan=False, default=str)

    print(f"\nData saved to {output_path}")
    return data

if __name__ == '__main__':
    excel_path = '/home/shell/test_fb/data/First_Second_A_youth_playerscount_years.xlsx'
    output_path = '/home/shell/test_fb/docs/assets/data/historical_players.json'

    print("Processing Excel file...")
    data = process_excel_to_json(excel_path, output_path)

    print("\nProcessing complete!")
