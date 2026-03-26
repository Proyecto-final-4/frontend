import { execSync } from "node:child_process";

const blockedPatterns = [
  /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/,
  /OPENAI_API_KEY\s*[:=]\s*["']?[^\s"']+/i,
];

function hasBlockedSecret(content) {
  return blockedPatterns.some((pattern) => pattern.test(content));
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

function isSafeOpenAiEnvAssignment(line) {
  if (!/OPENAI_API_KEY\s*[:=]/i.test(line)) {
    return false;
  }

  return (
    /OPENAI_API_KEY\s*[:=]\s*["']?<replace/i.test(line) ||
    /OPENAI_API_KEY\s*[:=]\s*["']?<your/i.test(line) ||
    /OPENAI_API_KEY\s*[:=]\s*["']?changeme/i.test(line) ||
    /OPENAI_API_KEY\s*[:=]\s*["']?xxx+/i.test(line)
  );
}

try {
  const addedDiffLines = getAddedLinesFromDiff();

  const riskyLines = addedDiffLines.filter(
    (line) => hasBlockedSecret(line) && !isSafeOpenAiEnvAssignment(line),
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
