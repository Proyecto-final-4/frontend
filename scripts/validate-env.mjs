const requiredEnvVars = ["BACKEND_JAVA_ENDPOINT", "OPENAI_API_KEY"];

const missingEnvVars = requiredEnvVars.filter((envVar) => {
  const value = process.env[envVar];
  return !value || value.trim().length === 0;
});

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

console.log("Environment variables validation passed.");
