import fs from "node:fs/promises";

/**
 * Reads and parses a JSON file.
 *
 * File system errors are propagated unchanged. JSON parsing errors are wrapped
 * with the file path for additional context while preserving the original
 * error as `cause`.
 *
 * @param {string} filePath
 * @returns {Promise<unknown>}
 */
export async function readJson(filePath) {
  const source = await fs.readFile(filePath, "utf8");

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`Invalid JSON: ${filePath}`, {
      cause: error,
    });
  }
}
