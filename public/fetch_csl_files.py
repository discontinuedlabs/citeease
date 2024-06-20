"""
**Fetches and Processes CSL Styles for citationEngine.js**

This script automates the creation and update of a local JSON file ("styles.json") containing
information about citation styles. It retrieves data from a cloned copy of the official Citation
Style Language (CSL) styles repository (https://github.com/citation-style-language).

**Function:**

1. Parses Citation Style Files (CSL) within the specified directory.
2. Extracts relevant information for citation rendering:
   - Title
   - Code (essential for citationEngine.js)
   - License

**Benefits:**

- **Efficiency:** Leverages local processing to overcome limitations of the GitHub REST API, which
restricts file retrieval to 1,000 per request.

- **Performance:** Local processing significantly improves speed compared to using the API.

**Prerequisties:**

- **Git:** https://git-scm.com/downloads
- **Python:** https://www.python.org/downloads/

**Usage:**

1. Clone the official CSL styles repository:
    `git clone https://github.com/citation-style-language/styles.git`
2. Move to the script directory:
    `cd public`
3. Run the script to process the CSL files and specify the location of the local "styles" repository:
    `python fetch_csl_files.py "C:\\Users\\USERNAME\\styles"`

**Scheduled Execution:**

This script can be integrated into a scheduled task to ensure "styles.json" remains current with the
latest CSL styles.
"""


import sys
import os
import re
import json
import time


class Colors:
    PURPLE = "\033[95m"
    GREEN = "\033[92m"
    BLUE = "\033[94m"
    RED = "\033[91m"
    BG_GREEN = "\033[6;30;42;1m"
    BG_RED = "\033[6;30;41;1m"
    ENDC = "\033[0m"

class Result:
    SUCCESS = f"{Colors.BG_GREEN} SUCCESS {Colors.ENDC}"
    ERROR = f"{Colors.BG_RED} ERROR {Colors.ENDC}"


def get_progress_bar(current_index, total_files):
    bar_length = 25
    percent = float(current_index + 1) / total_files
    arrow = "\u2588" * int(round(percent * bar_length))
    spaces = "\u2591" * (bar_length - len(arrow))
    percentage = int(percent * 100)
    
    percentage_str = f"%{percentage:<3d}"
    
    progress_bar = f"{arrow}{spaces} {percentage_str}"

    return progress_bar


def fetch_local_csl_files(directory):
    # Fetches all CSL files from the specified directory and processes them.

    # Parameters:
    # - directory: The path to the directory containing the CSL files.

    # Returns:
    # - A list of dictionaries, each representing a CSL file with its details.

    if not os.path.exists(directory):
        raise FileNotFoundError(f"\n{Result.ERROR}\n{Colors.RED}The specified directory '{directory}' does not exist. Please check the path and try again.{Colors.ENDC}")

    all_files = []

    print(f"\n{Colors.PURPLE}Fetching CSL files...{Colors.ENDC}")

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".csl"):
                total_files = len(files)
                index = files.index(file)
                max_length = len(files[index-1][0:20]) + 1
                progress = f"{index + 1}/{total_files}"
                end_char = "" if index + 1 != total_files else "\n"
                progress_bar = get_progress_bar(index, total_files)

                print(f"\r{progress_bar} | {index}/{total_files} | {" " * max_length}", end="") 
                print(f"\r{progress_bar} | {index}/{total_files} | {file[0:20] if index + 1 != total_files else "DONE"}", end=end_char)

                file_path = os.path.join(root, file)

                with open(file_path, "r", encoding="utf-8") as file:
                    content = file.read()

                filename_without_extension, _ = os.path.splitext(file_path)
                code = os.path.basename(filename_without_extension).replace(".csl", "")

                longTitle = content.split("<title>")[1].split("</title>")[0].strip()
                shortTitle = (
                    content.split("<title-short>")[1].split("</title-short>")[0].strip()
                    if "<title-short>" in content
                    else None
                )

                license_match = re.search(
                    r'<rights license="(.*?)"(.*?)</rights>', content, re.DOTALL
                )
                if license_match:
                    license_url = license_match.group(1)
                    license_text = (
                        license_match.group(2).strip()
                        if license_match.group(2)
                        else None
                    )
                else:
                    license_url = None
                    license_text = None

                item = {
                    "name": {"long": longTitle, "short": shortTitle},
                    "code": code,
                    "license": {"text": license_text, "url": license_url},
                }

                all_files.append(item)
    
    return all_files


def process_csl_files(all_files):
    # Processes the list of CSL files, appending each file"s information to a new list.

    # Parameters:
    # - all_files: A list of dictionaries, each representing a CSL file.

    # Returns:
    # - A list of dictionaries, each representing a processed CSL file.

    data = []

    print(f"\n{Colors.PURPLE}Processing CSL files...{Colors.ENDC}")

    for file_info in all_files:
        total_files = len(all_files)
        index = all_files.index(file_info)
        max_length = len(all_files[index-1]["code"][0:20]) + 1
        progress = f"{index + 1}/{total_files}"
        end_char = "" if index + 1 != total_files else "\n"
        progress_bar = get_progress_bar(index, total_files)

        print(f"\r{progress_bar} | {index}/{total_files} | {" " * max_length}", end="") 
        print(f"\r{progress_bar} | {index}/{total_files} | {file_info["code"][0:20] if index + 1 != total_files else "DONE"}", end=end_char)

        data.append(file_info)

    return data


def main(directory):
    start = time.time()

    print(f"{Colors.BLUE}Starting to fetch CSL files from {directory}...{Colors.ENDC}")

    all_files = fetch_local_csl_files(directory)
    data = process_csl_files(all_files)

    json_data = json.dumps(data, indent=4)
    output_file_path = "./styles.json"

    end = time.time()
    total_time = int(end - start)

    try:
        with open(output_file_path, "w", encoding="utf-8") as file:
            file.write(json_data)
        print(f"\n{Result.SUCCESS}\n{Colors.GREEN}Successfully saved citation styles data to {output_file_path}.\nTotal files processed: {len(all_files)} file\nProcessing time: {total_time}s{Colors.ENDC}")
    except IOError as error:
        print(f"\n{Result.ERROR}\n{Colors.RED}Error writing to file: {str(error)}.{Colors.ENDC}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        directory = sys.argv[1]
        main(directory)
    else: 
        print(f"{Result.ERROR}\n{Colors.RED}Please provide the path to the local 'styles' repository as a command-line argument.{Colors.ENDC}")
