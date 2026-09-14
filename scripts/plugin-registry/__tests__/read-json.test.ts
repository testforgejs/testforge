import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { readJson } from "../read-json.mjs";

describe("readJson", () => {
  let tempDir: string | undefined;

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, {
        recursive: true,
        force: true,
      });

      tempDir = undefined;
    }
  });

  it("should read and parse valid JSON", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "testforge-read-json-"));

    const filePath = path.join(tempDir, "package.json");

    await writeFile(
      filePath,
      JSON.stringify({
        name: "@testforgejs/vue-test-plugin-pinia",
        testforge: {
          plugin: {
            schemaVersion: 1,
          },
        },
      }),
    );

    await expect(readJson(filePath)).resolves.toEqual({
      name: "@testforgejs/vue-test-plugin-pinia",
      testforge: {
        plugin: {
          schemaVersion: 1,
        },
      },
    });
  });

  it("should propagate file system errors", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "testforge-read-json-"));

    const filePath = path.join(tempDir, "missing.json");

    await expect(readJson(filePath)).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  it("should throw an invalid JSON error with the original error as cause", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "testforge-read-json-"));

    const filePath = path.join(tempDir, "invalid.json");

    await writeFile(filePath, "{ invalid json }");

    const promise = readJson(filePath);

    await expect(promise).rejects.toMatchObject({
      message: `Invalid JSON: ${filePath}`,
      cause: expect.any(SyntaxError),
    });
  });
});
