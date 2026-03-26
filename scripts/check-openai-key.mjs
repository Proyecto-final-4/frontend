import { execSync } from "node:child_process";

const OPENAI_KEY_PATTERN = /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/;
const OPENAI_KEY_ASSIGNMENT_REGEX = /OPENAI_API_KEY\s*[:=]\s*(.+)/i;
const SAFE_ASSIGNMENT_VALUE_PATTERNS = [
  /^\$\{\{\s*secrets\.OPENAI_API_KEY\s*\}\}$/i,
  /^\$\{\{\s*secrets\.OPENAI_API_KEY\s*\|\|\s*['"][^'"]*['"]\s*\}\}$/i,
  /^\$\{\{\s*vars\.[A-Z0-9_]+\s*\}\}$/i,
  /^\$[A-Z_][A-Z0-9_]*$/,
  /^\$\{[A-Z_][A-Z0-9_]*\}$/,
  /^process\.env\.OPENAI_API_KEY$/i,
  /^import\.meta\.env\.[A-Z0-9_]*OPENAI[A-Z0-9_]*$/i,
  /^os\.getenv\(["']OPENAI_API_KEY["']\)$/i,
  /^<replace/i,
  /^<your/i,
  /^changeme$/i,
  /^xxx+$/i,
];

function isSafeAssignmentValue(value) {
  return SAFE_ASSIGNMENT_VALUE_PATTERNS.some((pattern) => pattern.test(value));
}

function normalizeAssignedValue(rawValue) {
  return rawValue
    .trim()
    .replace(/[,;]\s*$/, "")
    .replace(/^['"`]\s*/, "")
    .replace(/\s*['"`]$/, "")
    .trim();
}

function hasHardcodedOpenAiEnvValue(line) {
  const assignmentMatch = line.match(OPENAI_KEY_ASSIGNMENT_REGEX);
  if (!assignmentMatch) {
    return false;
  }

  const value = normalizeAssignedValue(assignmentMatch[1] ?? "");
  if (!value) {
    return false;
  }

  if (isSafeAssignmentValue(value)) {
    return false;
  }

  return true;
}

function getAddedLinesFromDiff() {
  const diffOutput = execSync("git diff --cached --unified=0 --no-color", {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });

  return diffOutput
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++") && !line.startsWith("+@@"))
    .map((line) => line.slice(1));
}

try {
  const addedDiffLines = getAddedLinesFromDiff();

  const riskyLines = addedDiffLines.filter(
    (line) => OPENAI_KEY_PATTERN.test(line) || hasHardcodedOpenAiEnvValue(line),
  );

  if (riskyLines.length > 0) {
    console.error("Potential OpenAI secret found in staged changes.");
    console.error("Commit blocked to protect your OpenAI API key.");
    process.exit(1);
  }

  console.log("Secret scan passed.");
} catch (error) {
  console.error("Unable to run secret scanner.", error);
  process.exit(1);
}
