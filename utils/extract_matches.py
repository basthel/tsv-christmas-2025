#!/usr/bin/env python3
"""Extract football match data from HTML and write to CSV"""

from bs4 import BeautifulSoup
import csv
import re

# Read HTML from file
with open("/home/shell/test_fb/site.html", "r", encoding="utf-8") as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, 'html.parser')

# Find the main table
table = soup.find('table', class_='listtable')

matches = []
current_competition = ""

# Process table rows
rows = table.find('tbody').find_all('tr')

for row in rows:
    # Check if this is a competition header row
    td_colspan = row.find('td', colspan='12')
    if td_colspan:
        # Extract competition info
        spans = td_colspan.find_all('span', class_='lh-lg')
        if len(spans) >= 2:
            comp_line1 = spans[0].get_text(strip=True)
            comp_line2 = spans[1].get_text(strip=True)
            current_competition = f"{comp_line1} | {comp_line2}"
        continue

    # Check if this is a match data row
    if not row.get('class'):
        continue

    row_classes = ' '.join(row.get('class', []))
    if 'jlistTr' not in row_classes:
        continue

    # Extract match data
    tds = row.find_all('td')
    if len(tds) < 10:
        continue

    # Get date (column 4)
    date_div = tds[3].find('div', class_='d-flex')
    if date_div:
        date_spans = date_div.find_all('span', class_='dfb-label')
        if len(date_spans) >= 3:
            date_text = f"{date_spans[0].text} {date_spans[1].text} {date_spans[2].text}"
        else:
            date_text = date_div.get_text(strip=True)
    else:
        date_text = ""

    # Get home team (column 6)
    home_span = tds[5].find('span', class_='dfb-label')
    home_team = home_span.text.strip() if home_span else ""

    # Get away team (column 8)
    away_span = tds[7].find('span', class_='dfb-label')
    away_team = away_span.text.strip() if away_span else ""

    # Get result (column 9)
    result_span = tds[8].find('span', class_='dfb-label')
    result = result_span.text.strip() if result_span else ""

    # Skip if no result or if it's empty
    if not result or ':' not in result:
        continue

    # Parse the result
    match = re.match(r'(\d+)\s*:\s*(\d+)', result)
    if not match:
        continue

    home_goals = match.group(1)
    away_goals = match.group(2)

    # Determine goals for and against from TSV Marquartstein perspective
    is_home = "Marquartstein" in home_team

    if is_home:
        goals_for = home_goals
        goals_against = away_goals
        opponent = away_team
    else:
        goals_for = away_goals
        goals_against = home_goals
        opponent = home_team

    match_data = {
        "date": date_text,
        "competition": current_competition,
        "home_team": home_team,
        "away_team": away_team,
        "opponent": opponent,
        "goals_for": goals_for,
        "goals_against": goals_against,
        "result": result
    }

    matches.append(match_data)

# Write to CSV
with open("/home/shell/test_fb/matches.csv", "w", newline="", encoding="utf-8") as csvfile:
    fieldnames = ["date", "competition", "home_team", "away_team", "opponent", "goals_for", "goals_against", "result"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for match in matches:
        writer.writerow(match)

print(f"Extracted {len(matches)} matches to matches.csv")
