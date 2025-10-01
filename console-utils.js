/**
 * Console styling utilities for deployment scripts
 */

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

// Spinner frames for animation
const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
let spinnerInterval;
let spinnerMessage = "";

// Progress bar configuration
const progressBarWidth = 40;

/**
 * Clears the current line in the console
 */
function clearLine() {
  process.stdout.write("\r\x1b[K");
}

/**
 * Creates a styled header with a title
 * @param {string} title - The header title
 */
function header(title) {
  const width = process.stdout.columns || 80;
  const padding = Math.floor((width - title.length - 4) / 2);
  const line = "=".repeat(width);

  console.log("\n" + colors.cyan + line + colors.reset);
  console.log(
    colors.cyan +
      "=".repeat(padding) +
      colors.bright +
      colors.white +
      " " +
      title +
      " " +
      colors.reset +
      colors.cyan +
      "=".repeat(padding) +
      (padding * 2 + title.length + 2 < width ? "=" : "") +
      colors.reset
  );
  console.log(colors.cyan + line + colors.reset + "\n");
}

/**
 * Logs an info message
 * @param {string} message - The message to log
 */
function info(message) {
  console.log(colors.blue + "→ " + colors.reset + message);
}

/**
 * Logs a success message
 * @param {string} message - The message to log
 */
function success(message) {
  console.log(colors.green + "✓ " + colors.reset + colors.bright + message + colors.reset);
}

/**
 * Logs a warning message
 * @param {string} message - The message to log
 */
function warning(message) {
  console.log(colors.yellow + "⚠ " + colors.reset + message);
}

/**
 * Logs an error message
 * @param {string} message - The message to log
 */
function error(message) {
  console.log(colors.red + "✗ " + colors.reset + colors.bright + message + colors.reset);
}

/**
 * Starts a spinner animation with a message
 * @param {string} message - The message to display with the spinner
 */
function startSpinner(message) {
  let i = 0;
  spinnerMessage = message;

  // Clear any existing spinner
  if (spinnerInterval) {
    clearInterval(spinnerInterval);
  }

  spinnerInterval = setInterval(() => {
    const frame = spinnerFrames[(i = ++i % spinnerFrames.length)];
    clearLine();
    process.stdout.write(colors.cyan + frame + " " + colors.reset + spinnerMessage);
  }, 80);

  return spinnerInterval;
}

/**
 * Updates the spinner message
 * @param {string} message - The new message to display
 */
function updateSpinner(message) {
  spinnerMessage = message;
}

/**
 * Stops the spinner animation and optionally displays a final message
 * @param {string} [finalMessage] - Optional final message to display
 * @param {string} [type='info'] - Type of the final message (info, success, warning, error)
 */
function stopSpinner(finalMessage, type = "info") {
  if (spinnerInterval) {
    clearInterval(spinnerInterval);
    spinnerInterval = null;
    clearLine();

    if (finalMessage) {
      switch (type) {
        case "success":
          success(finalMessage);
          break;
        case "warning":
          warning(finalMessage);
          break;
        case "error":
          error(finalMessage);
          break;
        default:
          info(finalMessage);
      }
    }
  }
}

/**
 * Displays a progress bar
 * @param {number} progress - Progress value (0-100)
 * @param {string} [message] - Optional message to display with the progress bar
 */
function progressBar(progress, message = "") {
  const completed = Math.floor((progressBarWidth * Math.min(100, progress)) / 100);
  const remaining = progressBarWidth - completed;

  clearLine();
  process.stdout.write(
    colors.blue +
      "[" +
      colors.green +
      "=".repeat(completed) +
      colors.dim +
      "-".repeat(remaining) +
      colors.reset +
      colors.blue +
      "] " +
      colors.reset +
      (progress.toFixed(1) + "%").padStart(6) +
      " " +
      message
  );
}

/**
 * Creates a section header
 * @param {string} title - The section title
 */
function section(title) {
  console.log("\n" + colors.cyan + colors.bright + "▶ " + title + colors.reset);
  console.log(colors.dim + "  " + "─".repeat(title.length + 2) + colors.reset);
}

/**
 * Logs a step in a process
 * @param {number} stepNumber - The step number
 * @param {string} message - The step message
 */
function step(stepNumber, message) {
  console.log(colors.yellow + colors.bright + `  ${stepNumber}. ` + colors.reset + message);
}

/**
 * Creates a styled box with a message
 * @param {string} message - The message to display in the box
 * @param {string} [type='info'] - Type of the box (info, success, warning, error)
 */
function box(message, type = "info") {
  const lines = message.split("\n");
  const width = Math.max(...lines.map((line) => line.length)) + 4;
  const horizontal = "─".repeat(width);

  let boxColor;
  let icon;

  switch (type) {
    case "success":
      boxColor = colors.green;
      icon = "✓";
      break;
    case "warning":
      boxColor = colors.yellow;
      icon = "⚠";
      break;
    case "error":
      boxColor = colors.red;
      icon = "✗";
      break;
    default:
      boxColor = colors.blue;
      icon = "ℹ";
  }

  console.log("\n" + boxColor + "┌" + horizontal + "┐" + colors.reset);

  lines.forEach((line, i) => {
    const padding = width - line.length - 4;
    console.log(
      boxColor +
        "│ " +
        colors.reset +
        (i === 0 ? icon + " " : "  ") +
        line +
        " ".repeat(padding) +
        boxColor +
        " │" +
        colors.reset
    );
  });

  console.log(boxColor + "└" + horizontal + "┘" + colors.reset + "\n");
}

/**
 * Displays a countdown timer
 * @param {number} seconds - Number of seconds to count down
 * @param {string} message - Message to display with the countdown
 * @returns {Promise} - Resolves when the countdown completes
 */
function countdown(seconds, message) {
  return new Promise((resolve) => {
    let remaining = seconds;

    const interval = setInterval(() => {
      clearLine();
      process.stdout.write(
        colors.yellow + "⏱ " + colors.reset + message + " " + colors.bright + remaining + "s" + colors.reset
      );

      if (--remaining < 0) {
        clearInterval(interval);
        clearLine();
        resolve();
      }
    }, 1000);
  });
}

/**
 * Displays a table of data
 * @param {Array<Object>} data - Array of objects to display in the table
 * @param {Array<string>} columns - Array of column names to display
 */
function table(data, columns) {
  if (!data || data.length === 0) {
    return;
  }

  // Calculate column widths
  const widths = {};
  columns.forEach((col) => {
    widths[col] = Math.max(col.length, ...data.map((row) => String(row[col] || "").length));
  });

  // Create header
  let header = "  ";
  let separator = "  ";

  columns.forEach((col) => {
    header += colors.bright + col.padEnd(widths[col] + 2) + colors.reset;
    separator += colors.dim + "─".repeat(widths[col]) + "  " + colors.reset;
  });

  console.log("\n" + header);
  console.log(separator);

  // Create rows
  data.forEach((row) => {
    let line = "  ";
    columns.forEach((col) => {
      line += String(row[col] || "").padEnd(widths[col] + 2);
    });
    console.log(line);
  });

  console.log("");
}

// At the very end of console-utils.js, instead of `export default { … };`
module.exports = {
  colors,
  clearLine,
  header,
  info,
  success,
  warning,
  error,
  startSpinner,
  updateSpinner,
  stopSpinner,
  progressBar,
  section,
  step,
  box,
  countdown,
  table,
};
