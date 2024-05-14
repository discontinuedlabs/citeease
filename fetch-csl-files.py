"""
**Fetches and Processes CSL Styles for citationEngine.js**

This script automates the creation and update of a local JSON file ("styles.json") containing information about citation styles. It retrieves data from a cloned copy of the official Citation Style Language (CSL) styles repository (https://github.com/citation-style-language).

**Function:**

1. Parses Citation Style Files (CSL) within the specified directory.
2. Extracts relevant information for citation rendering:
   - Title
   - Code (essential for citationEngine.js)
   - License

**Benefits:**

- **Efficiency:** Leverages local processing to overcome limitations of the GitHub REST API, which restricts file retrieval to 1,000 per request.
- **Performance:** Local processing significantly improves speed compared to using the API.

**Usage:**

1. Clone the official CSL styles repository:
    $ git clone https://github.com/citation-style-language/styles.git
2. Update the `directory` variable within the script to point to the location of your cloned repository.
3. Install required Python packages:
    $ pip install tqdm colorist
4. Run the script to process the CSL files and generate an updated "styles.json" file:
    $ python fetch-csl-files.py

**Scheduled Execution:**

This script can be integrated into a scheduled task to ensure "styles.json" remains current with the latest CSL styles.
"""

import os
import re
import json
from tqdm import tqdm
from colorist import red, green, blue

def fetch_local_csl_files(directory):
    """
    Fetches all CSL files from the specified directory and processes them.
    
    Parameters:
    - directory: The path to the directory containing the CSL files.
    
    Returns:
    - A list of dictionaries, each representing a CSL file with its details.
    """
    all_files = []
    # Wrap os.walk with tqdm to show progress
    for root, dirs, files in tqdm(os.walk(directory), desc="Fetching CSL files"):
        for file in files:
            if file.endswith('.csl'):
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                filename_without_extension, _ = os.path.splitext(file_path)
                code = os.path.basename(filename_without_extension).replace('.csl', '')
                
                longTitle = content.split('<title>')[1].split('</title>')[0].strip()
                shortTitle = content.split('<title-short>')[1].split('</title-short>')[0].strip() if '<title-short>' in content else None
                
                license_match = re.search(r'<rights license="(.*?)"(.*?)</rights>', content, re.DOTALL)
                if license_match:
                    license_url = license_match.group(1)
                    license_text = license_match.group(2).strip() if license_match.group(2) else None
                else:
                    license_url = None
                    license_text = None
                
                item = {
                    'name': {
                        'long': longTitle,
                        'short': shortTitle
                    },
                    'code': code,
                    'license': {
                        'text': license_text,
                        'url': license_url
                    }
                }
                
                all_files.append(item)
    
    return all_files

def process_csl_files(all_files):
    """
    Processes the list of CSL files, appending each file's information to a new list.
    
    Parameters:
    - all_files: A list of dictionaries, each representing a CSL file.
    
    Returns:
    - A list of dictionaries, each representing a processed CSL file.
    """
    data = []
    for file_info in tqdm(all_files, colour="green", desc="Processing CSL files: "):
        data.append(file_info)
    
    return data

def main():
    directory = r'C:\Users\USERNAME\styles' # Make sure to change this to the specified 'styles' directory
    print(blue(f"Starting to fetch CSL files from {directory}..."))
    
    all_files = fetch_local_csl_files(directory)
    data = process_csl_files(all_files)
    
    json_data = json.dumps(data, indent=4)
    output_file_path = './styles.json'

    try:
        with open(output_file_path, 'w', encoding='utf-8') as file:
            file.write(json_data)
        print(green("Citation styles data saved to " + output_file_path))
    except IOError as error:
        print(red("Error writing to file: " + str(error)))


if __name__ == "__main__":
    main()
