#!/usr/bin/env node
import process from "node:process";
import { Cli } from "clipanion";
import { run as runContentlayer } from "@contentlayer/cli";

// Patch Clipanion's runExit so that it always sets a numeric exitCode.
// Node 22 is stricter about process.exitCode assignments, and older
// Clipanion versions may attempt to assign an object instead.
Cli.prototype.runExit = async function patchedRunExit(args, context) {
  const result = await this.run(args, context);

  if (typeof result === "number") {
    process.exitCode = result;
    return;
  }

  if (
    result &&
    typeof result === "object" &&
    "code" in result &&
    typeof result.code === "number"
  ) {
    process.exitCode = result.code;
    return;
  }

  if (result === undefined) {
    // Default success
    return;
  }

  // Fallback: log unexpected values and exit with code 1.
  // This preserves failure semantics without crashing Node.
  console.error("Unexpected exit value from Contentlayer CLI:", result);
  process.exitCode = 1;
};

runContentlayer().catch((err) => {
  console.error(err);
  process.exit(1);
});
