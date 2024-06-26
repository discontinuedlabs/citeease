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
2. Navigate to the directory of this script:
    `cd public`
3. Run the Python script to fetch CSL files from the specified "styles" directory:
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
    GREEN = "\033[92m"
    BLUE = "\033[94m"
    RED = "\033[91m"
    BG_GREEN = "\033[6;30;42;1m"
    BG_RED = "\033[6;30;41;1m"
    BG_DARK_BLUE = "\033[34;2m"
    ENDC = "\033[0m"


class Result:
    SUCCESS = f"{Colors.BG_GREEN} SUCCESS {Colors.ENDC}"
    ERROR = f"{Colors.BG_RED} ERROR {Colors.ENDC}"


MAX_FILENAME_LENGTH = 45


def get_progress_bar(current_index, total_files, bar_length=25):
    percent = float(current_index + 1) / total_files
    arrow = "\u2588" * int(round(percent * bar_length))
    spaces = "\u2588" * (bar_length - len(arrow))
    percentage_str = f"%{int(percent * 100):<3d}"
    return f"{Colors.BLUE}{arrow}{Colors.ENDC}{Colors.BG_DARK_BLUE}{spaces}{Colors.ENDC} {percentage_str}"


def fetch_local_csl_files(directory):
    if not os.path.exists(directory):
        raise FileNotFoundError(
            f"\n{Result.ERROR}\n{Colors.RED}The specified directory '{directory}' does not exist. Please check the path and try again.{Colors.ENDC}"
        )

    all_files = []

    print("\nFetching CSL files...")

    for root, _, files in os.walk(directory):
        csl_files = [file for file in files if file.endswith(".csl")]
        total_files = len(csl_files)

        for index, file in enumerate(csl_files):
            progress_bar = get_progress_bar(index, total_files)
            end_char = "" if index + 1 != total_files else "\n"
            file_name_display = file[:MAX_FILENAME_LENGTH] if index + 1 != total_files else "DONE"
            max_length = len(files[index-1][:MAX_FILENAME_LENGTH]) + 5

            print(f"\r{progress_bar} | {index + 1}/{total_files} | {" " * max_length}", end="") 
            print(f"\r{progress_bar} | {index + 1}/{total_files} | {file_name_display}", end=end_char)

            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            file_info = extract_file_info(file_path, content)
            all_files.append(file_info)

    return all_files


def extract_file_info(file_path, content):
    code = os.path.basename(file_path).replace(".csl", "")
    long_title = extract_tag_content(content, "title")
    short_title = extract_tag_content(content, "title-short")
    license_info = extract_license_info(content)

    return {
        "name": {"long": long_title, "short": short_title},
        "code": code,
        "license": license_info,
    }


def extract_tag_content(content, tag):
    match = re.search(f"<{tag}>(.*?)</{tag}>", content)
    return match.group(1).strip() if match else None


def extract_license_info(content):
    license_match = re.search(r'<rights license="(.*?)">(.*?)</rights>', content, re.DOTALL)
    if license_match:
        license_url = license_match.group(1)
        license_text = license_match.group(2).strip() if license_match.group(2) else None
        return {"text": license_text, "url": license_url}
    return {"text": None, "url": None}


def process_csl_files(all_files):
    data = []

    print("\nProcessing CSL files...")

    total_files = len(all_files)
    for index, file_info in enumerate(all_files):
        progress_bar = get_progress_bar(index, total_files)
        end_char = "" if index + 1 != total_files else "\n"
        file_code_display = file_info["code"][:MAX_FILENAME_LENGTH] if index + 1 != total_files else "DONE"
        max_length = len(all_files[index-1]["code"][:MAX_FILENAME_LENGTH]) + 5

        print(f"\r{progress_bar} | {index + 1}/{total_files} | {" " * max_length}", end="")
        print(f"\r{progress_bar} | {index + 1}/{total_files} | {file_code_display}", end=end_char)

        data.append(file_info)

    return data


def main(directory):
    start_time = time.time()

    print(f"Starting to fetch CSL files from {directory}...")

    all_files = fetch_local_csl_files(directory)
    data = process_csl_files(all_files)

    json_data = json.dumps(data, indent=4)
    output_file_path = "./styles.json"

    try:
        with open(output_file_path, "w", encoding="utf-8") as file:
            file.write(json_data)
        print(f"\n{Result.SUCCESS}\n{Colors.GREEN}Successfully saved citation styles data to {output_file_path}.\nTotal files processed: {len(all_files)}\nProcessing time: {int(time.time() - start_time)}s{Colors.ENDC}")
    except IOError as error:
        print(f"\n{Result.ERROR}\n{Colors.RED}Error writing to file: {str(error)}.{Colors.ENDC}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1])
    else:
        print(f"{Result.ERROR}\n{Colors.RED}Please provide the path to the local 'styles' repository as a command-line argument.{Colors.ENDC}")
