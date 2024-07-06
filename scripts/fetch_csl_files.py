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
    `cd scripts`
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


class Font:
    BOLD = "\033[1m"
    BLACK = "\033[38;5;0m"
    GREEN = "\033[38;5;48m"
    BLUE = "\033[38;5;33m"
    DARK_BLUE = "\033[38;5;17m"
    RED = "\033[38;5;9m"
    BG_GREEN = "\033[48;5;48m"
    BG_RED = "\033[48;5;9m"
    RESET = "\033[0m"


class Result:
    SUCCESS = f"{Font.BG_GREEN+Font.BOLD+Font.BLACK} SUCCESS {Font.RESET}"
    ERROR = f"{Font.BG_RED+Font.BOLD+Font.BLACK} ERROR {Font.RESET}"


TERMINAL_WIDTH = os.get_terminal_size().columns

progress_bar_cell = "\u2588"
progress_bar_length = 30
max_filename_length = TERMINAL_WIDTH - progress_bar_length - 30


def print_progress(current_index, current_file_name, total_files, bar_length=progress_bar_length):
    percent = float(current_index + 1) / total_files
    progress = progress_bar_cell * int(round(percent * bar_length))
    spaces = progress_bar_cell * (bar_length - len(progress))
    percentage_str = f"%{int(percent * 100):<3d}"
    progress_bar = f"{Font.BLUE}{progress}{Font.RESET}{Font.DARK_BLUE}{spaces}{Font.RESET} {percentage_str}"

    file_name_display = current_file_name[:max_filename_length] if current_index + 1 != total_files else "DONE\n"
    full_message = f"{progress_bar} | {current_index + 1}/{total_files} | {file_name_display}"
    fixed_message = f"{progress_bar} | {current_index + 1}/{total_files} | "

    sys.stdout.write(f"\r    {fixed_message}{" " * (TERMINAL_WIDTH - len(fixed_message) + 20)}")
    sys.stdout.write(f"\r    {full_message}")
    sys.stdout.flush()


def fetch_local_csl_files(directory):
    if not os.path.exists(directory):
        raise FileNotFoundError(
            f"\n{Result.ERROR}\n{Font.RED}The specified directory '{directory}' does not exist. Please check the path and try again.{Font.RESET}"
        )

    all_files = []

    sys.stdout.write("\nFetching CSL files...\n")

    for root, _, files in os.walk(directory):
        csl_files = [file for file in files if file.endswith(".csl")]
        total_files = len(csl_files)

        for index, file in enumerate(csl_files):
            print_progress(index, file, total_files)

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
        print_progress(index, file_info["code"], total_files)
        data.append(file_info)

    return data


def main(directory):
    start_time = time.time()

    sys.stdout.write(f"Starting to fetch CSL files from {directory}...\n")

    all_files = fetch_local_csl_files(directory)
    data = process_csl_files(all_files)

    json_data = json.dumps(data, indent=4)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_file_path = os.path.join(script_dir, '..', 'src', 'assets', 'styles.json')

    try:
        with open(output_file_path, "w", encoding="utf-8") as file:
            file.write(json_data)
        sys.stdout.write(f"\n{Result.SUCCESS}\n{Font.GREEN}Successfully saved citation styles data to {Font.BOLD}'{output_file_path}'{Font.RESET}{Font.GREEN}\nTotal files processed: {Font.BOLD}{len(all_files)}{Font.RESET}{Font.GREEN}\nProcessing time: {Font.BOLD}{int(time.time() - start_time)}s{Font.RESET}")
    except IOError as error:
        sys.stdout.write(f"\n{Result.ERROR}\n{Font.RED}Error writing to file: {str(error)}.{Font.RESET}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1])
    else:
        sys.stdout.write(f"{Result.ERROR}\n{Font.RED}Please provide the path to the local 'styles' repository as an argument.{Font.RESET}")
