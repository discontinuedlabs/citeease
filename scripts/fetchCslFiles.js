/**
 * Fetches and Processes CSL Styles for citationEngine.js
 *
 * This script automates the creation and update of a local JSON file ("styles.json") containing
 * information about citation styles. It automatically clones the official Citation Style Language (CSL)
 * styles repository (https://github.com/citation-style-language) if it does not already exist locally.
 *
 * Function:
 *
 * 1. Clones the CSL styles repository if not already present.
 * 2. Parses Citation Style Files (CSL) within the specified directory.
 * 3. Extracts relevant information for citation rendering:
 *    - Title
 *    - Code (essential for citationEngine.js)
 *    - License
 *
 * Benefits:
 *
 * - Efficiency: Leverages local processing to overcome limitations of the GitHub REST API, which
 *   restricts file retrieval to 1,000 per request.
 *
 * - Performance: Local processing significantly improves speed compared to using the API.
 *
 * Prerequisites:
 *
 * - Git: https://git-scm.com/downloads
 * - Node.js: https://nodejs.org/
 *
 * Usage:
 *
 * 1. Run the Node.js script to fetch and process CSL files:
 *    `node fetch_csl_files.js`
 *
 *    Alternatively, specify a directory to check if the repository is already present, and if not,
 *    it will clone the repository there first and then process the files:
 *    `node fetch_csl_files.js "C:/Users/USERNAME/styles"`
 *
 * Scheduled Execution:
 *
 * This script can be integrated into a scheduled task to ensure "styles.json" remains current with the
 * latest CSL styles.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { exec } = require("child_process");

const FONT = {
    BOLD: "\x1b[1m",
    DIM: "\x1b[2m",
    BLACK: "\x1b[38;5;0m",
    GREEN: "\x1b[38;5;48m",
    DARK_GREEN: "\x1b[38;5;29m",
    BLUE: "\x1b[38;5;33m",
    DARK_BLUE: "\x1b[38;5;17m",
    RED: "\x1b[38;5;9m",
    BG_GREEN: "\x1b[48;5;48m",
    BG_RED: "\x1b[48;5;9m",
    RESET: "\x1b[0m",
};

const RESULT = {
    SUCCESS: `${FONT.BG_GREEN}${FONT.BOLD}${FONT.BLACK} SUCCESS ${FONT.RESET}`,
    ERROR: `${FONT.BG_RED}${FONT.BOLD}${FONT.BLACK} ERROR ${FONT.RESET}`,
};

const TERMINAL_WIDTH = process.stdout.columns;
const progressBarCell = "\u2588";
const progressBarLength = 30;
const maxFilenameLength = TERMINAL_WIDTH - progressBarLength - 50;

function printProgress(currentIndex, currentFileName, totalFiles, barLength = progressBarLength) {
    const percent = (currentIndex + 1) / totalFiles;
    const progress = progressBarCell.repeat(Math.round(percent * barLength));
    const spaces = progressBarCell.repeat(barLength - progress.length);
    const percentageStr = `%${Math.floor(percent * 100)
        .toString()
        .padEnd(3, " ")}`;
    const progressBar = `${FONT.BLUE}${progress}${FONT.RESET}${FONT.DARK_BLUE}${spaces}${FONT.RESET} ${percentageStr}`;

    const fileNameDisplay = currentIndex + 1 !== totalFiles ? currentFileName.slice(0, maxFilenameLength) : "DONE\n";
    const fullMessage = `${progressBar} | ${currentIndex + 1}/${totalFiles} | ${fileNameDisplay}`;
    const fixedMessage = `${progressBar} | ${currentIndex + 1}/${totalFiles} | `;

    process.stdout.write(`\r    ${fixedMessage}${" ".repeat(TERMINAL_WIDTH - fixedMessage.length)}`);
    process.stdout.write(`\r    ${fullMessage}`);
}

function colorFilePath(filePath, lightColor = FONT.WHITE, darkColor = FONT.BLACK) {
    const splitPath = filePath.split("\\");
    const lastIndex = splitPath.length - 1;

    splitPath[0] = darkColor + splitPath[0];
    splitPath[lastIndex] = lightColor + splitPath[lastIndex];

    return splitPath.join("\\");
}

function generateShortTitle(title) {
    const parenPattern = /\([^)]*\)/;
    const match = title.match(parenPattern);
    const parenInfo = match ? match[0] : "";
    const mainTitle = title.split("(")[0];
    let acronym = "";

    mainTitle.split("").forEach((char) => {
        if (char === char.toUpperCase() || !Number.isNaN(char)) {
            acronym += char;
        }
    });

    if (acronym.length <= 2) {
        acronym = mainTitle;
    }

    const shortTitle = `${acronym} ${parenInfo}`;
    return shortTitle.replace(/\s+/g, " ");
}

function extractTagContent(content, tag) {
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`);
    const match = content.match(regex);
    return match ? match[1].trim() : null;
}

function extractLicenseInfo(content) {
    const regex = /<rights license="(.*?)">(.*?)<\/rights>/s;
    const match = content.match(regex);
    if (match) {
        const licenseUrl = match[1];
        const licenseText = match[2] ? match[2].trim() : null;
        return { text: licenseText, url: licenseUrl };
    }
    return { text: null, url: null };
}

function extractFileInfo(filePath, content) {
    const code = path.basename(filePath).replace(".csl", "");
    const longTitle = extractTagContent(content, "title");
    const shortTitle = extractTagContent(content, "title-short");
    const licenseInfo = extractLicenseInfo(content);

    return {
        name: {
            long: longTitle,
            short: shortTitle !== null ? shortTitle : generateShortTitle(longTitle),
        },
        code,
        license: licenseInfo,
    };
}

function fetchLocalCslFiles(directory) {
    if (!fs.existsSync(directory)) {
        process.stderr.write(
            `\n${RESULT.ERROR}\n${FONT.RED}The specified directory '${directory}' does not exist. Please check the path and try again.${FONT.RESET}`
        );
    }

    const allFiles = [];
    process.stdout.write("\nFetching CSL files...\n");

    const cslFiles = fs.readdirSync(directory).filter((file) => file.endsWith(".csl"));
    const totalFiles = cslFiles.length;

    cslFiles.forEach((file, index) => {
        printProgress(index, file, totalFiles);

        const filePath = path.join(directory, file);
        const content = fs.readFileSync(filePath, "utf-8");

        const fileInfo = extractFileInfo(filePath, content);
        allFiles.push(fileInfo);
    });

    return allFiles;
}

function processCslFiles(allFiles) {
    const data = [];

    process.stdout.write("\nProcessing CSL files...\n");

    const totalFiles = allFiles.length;
    allFiles.forEach((fileInfo, index) => {
        printProgress(index, fileInfo.code, totalFiles);
        data.push(fileInfo);
    });

    return data;
}

function cloneRepository(url, directory = ".") {
    process.stdout.write(
        `${FONT.BLACK}[GIT]${FONT.RESET} Cloning repository 'https://github.com/citation-style-language/styles.git'...\n`
    );

    return new Promise((resolve, reject) => {
        exec(`git clone "${url}" "${directory}"`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                process.stderr.write(`${FONT.BLACK}[GIT]${FONT.RESET} Failed to clone repository: ${stderr}\n`);
                return;
            }
            process.stdout.write(`${FONT.BLACK}[GIT]${FONT.RESET} Cloned repository successfully to '${directory}'\n`);
            resolve(stdout);
        });
    });
}

async function main(directory) {
    if (!fs.existsSync(directory)) {
        await cloneRepository("https://github.com/citation-style-language/styles.git", directory);
    }

    const startTime = Date.now();

    process.stdout.write(`Starting to fetch CSL files from ${directory}...\n`);

    const allFiles = fetchLocalCslFiles(directory);
    const data = processCslFiles(allFiles);

    const jsonData = JSON.stringify(data, null, 4);
    const scriptDir = path.dirname(__filename);
    const outputFilePath = path.join(scriptDir, "..", "src", "assets", "styles.json");

    try {
        fs.writeFileSync(outputFilePath, jsonData, "utf-8");
        process.stdout.write(
            `\n${RESULT.SUCCESS}\n${FONT.BOLD + FONT.GREEN}Output: ${FONT.RESET}${colorFilePath(outputFilePath, FONT.GREEN, FONT.DARK_GREEN)}\n${FONT.BOLD + FONT.GREEN}Files:  ${FONT.RESET + FONT.GREEN}${allFiles.length} files\n${FONT.BOLD + FONT.GREEN}Time:   ${FONT.RESET + FONT.GREEN}${(Math.floor(Date.now() - startTime) / 1000).toFixed(3)} s${FONT.RESET}`
        );
    } catch (error) {
        process.stderr.write(`\n${RESULT.ERROR}\n${FONT.RED}Error writing to file: ${error.message}.${FONT.RESET}`);
    }
}

if (require.main === module) {
    const userProfileDirectory = os.homedir();
    const defaultStylesDirectory = path.join(userProfileDirectory, "styles");
    if (process.argv.length > 2) {
        main(process.argv[2]);
    } else {
        main(defaultStylesDirectory);
    }
}
