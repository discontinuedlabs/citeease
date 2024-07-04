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


TERMINAL_WIDTH = os.get_terminal_size().columns
PROGRESS_BAR_LENGTH = 25
MAX_FILE_CODE_LENGTH = TERMINAL_WIDTH - PROGRESS_BAR_LENGTH - 30


def get_progress_bar(current_index, total_files, bar_length=PROGRESS_BAR_LENGTH):
    percent = float(current_index + 1) / total_files
    progress = "\u2588" * int(round(percent * bar_length))
    spaces = "\u2588" * (bar_length - len(progress))
    percentage_str = f"%{int(percent * 100):<3d}"
    return f"{Colors.BLUE}{progress}{Colors.ENDC}{Colors.BG_DARK_BLUE}{spaces}{Colors.ENDC} {percentage_str}"


def fetch_local_csl_files(directory):
    if not os.path.exists(directory):
        raise FileNotFoundError(
            f"\n{Result.ERROR}\n{Colors.RED}The specified directory '{directory}' does not exist. Please check the path and try again.{Colors.ENDC}"
        )

    all_files = []

    sys.stdout.write("\nFetching CSL files...\n")

    for root, _, files in os.walk(directory):
        csl_files = [file for file in files if file.endswith(".csl")]
        total_files = len(csl_files)

        for index, file in enumerate(csl_files):
            progress_bar = get_progress_bar(index, total_files)
            file_name_display = file[:MAX_FILE_CODE_LENGTH] if index + 1 != total_files else "DONE\n"
            full_print_str = f"{progress_bar} | {index + 1}/{total_files} | {file_name_display}"
            fixed_print_str = f"\r{progress_bar} | {index + 1}/{total_files} | "

            sys.stdout.write(f"\r{fixed_print_str}{" " * (TERMINAL_WIDTH - len(fixed_print_str) + 15)}")
            sys.stdout.write(f"\r{full_print_str}")
            sys.stdout.flush()

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
        "name": {
            "long": long_title,
            "short": short_title if short_title != None else generate_short_title(long_title)
        },
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


def generate_short_title(title):
    paren_pattern = r'\([^)]*\)'
    match = re.search(paren_pattern, title)
    paren_info = match.group(0) if match else ''
    main_title = title.split("(")[0]
    acronym = "".join(char for char in main_title if char.isupper() or char.isdigit())
    
    if len(acronym) <= 2:
        acronym = main_title
        
    short_title = f"{acronym} {paren_info}"
    cleaned_title = re.sub(" +", " ", short_title)
        
    return cleaned_title


def process_csl_files(all_files):
    data = []

    sys.stdout.write("\nProcessing CSL files...\n")

    total_files = len(all_files)
    for index, file_info in enumerate(all_files):
        progress_bar = get_progress_bar(index, total_files)
        file_name_display = file_info["code"][:MAX_FILE_CODE_LENGTH] if index + 1 != total_files else "DONE\n"
        full_print_str = f"{progress_bar} | {index + 1}/{total_files} | {file_name_display}"
        fixed_print_str = f"\r{progress_bar} | {index + 1}/{total_files} | "

        sys.stdout.write(f"\r{fixed_print_str}{" " * (TERMINAL_WIDTH - len(fixed_print_str) + 15)}")
        sys.stdout.write(f"\r{full_print_str}")
        sys.stdout.flush()

        data.append(file_info)

    return data


def main(directory):
    start_time = time.time()

    sys.stdout.write(f"Starting to fetch CSL files from {directory}...\n")

    all_files = fetch_local_csl_files(directory)
    data = process_csl_files(all_files)

    json_data = json.dumps(data, indent=4)
    output_file_path = "./styles.json"

    try:
        with open(output_file_path, "w", encoding="utf-8") as file:
            file.write(json_data)
        sys.stdout.write(f"\n{Result.SUCCESS}\n{Colors.GREEN}Successfully saved citation styles data to {output_file_path}\nTotal files processed: {len(all_files)}\nProcessing time: {int(time.time() - start_time)}s{Colors.ENDC}")
    except IOError as error:
        sys.stdout.write(f"\n{Result.ERROR}\n{Colors.RED}Error writing to file: {str(error)}.{Colors.ENDC}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1])
    else:
        sys.stdout.write(f"{Result.ERROR}\n{Colors.RED}Please provide the path to the local 'styles' repository as an argument.{Colors.ENDC}")
