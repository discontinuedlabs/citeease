"""
This script fetches citation styles data from the Citation Style Language (CSL) GitHub repository,
parses the CSL files, extracts relevant information such as title, code (essential for citationEngine.js), and license,
and saves the data to a JSON file named 'styles.json'.
It is recommended to execute this script whenever an update to 'styles.json' is needed to maintain the most current citation style information.
"""

import requests
import json

# Fetch the list of CSL files
print("Fetching the list of CSL files...")
response = requests.get('https://api.github.com/repos/citation-style-language/styles/contents')
files = response.json()

# Filter out only the CSL files
csl_files = [file for file in files if file['type'] == 'file' and file['name'].endswith('.csl')]

print("Found CSL files:")

# Download and parse each CSL file
data = []
for file_info in csl_files:
    print(f"Processing {file_info['name']}...")

    # Download the file
    download_url = file_info['download_url']
    response = requests.get(download_url)
    content = response.text
    
    # Parse the CSL file to extract the required information
    longTitle = content.split('<title>')[1].split('</title>')[0].strip()
    if '<title-short>' in content:
        shortTitle = content.split('<title-short>')[1].split('</title-short>')[0].strip()
    else:
        shortTitle = None
    code = file_info['name'].replace('.csl', '')
    license_text = content.split('<rights license="http://creativecommons.org/licenses/by-sa/3.0/">')[1].split('</rights>')[0].strip()
    
    # Create a JSON object
    item = {
        'name': {
            'long': longTitle,
            'short': shortTitle
        },
        'code': code,
        'license': {
            'text': license_text,
            'url': 'http://creativecommons.org/licenses/by-sa/3.0/'
        }
    }
    
    data.append(item)
    print(f"Processed {file_info['name']}.")

print("All CSL files processed.")

# Convert the list of dictionaries to a JSON array
json_data = json.dumps(data, indent=4)

# Directory to save the JSON file
output_file_path = './styles.json'

try:
    # Write the JSON data to a file
    print(f"Writing citation styles data to {output_file_path}...")
    with open(output_file_path, 'w', encoding='utf-8') as file:
        file.write(json_data)
    print(f"Citation styles data saved to {output_file_path}")
except IOError as error:
    print(f"Error writing to file: {error}")