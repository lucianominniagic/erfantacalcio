#!/usr/bin/env node
// Ensures the PostgreSQL Docker container is running before starting the dev server.
// If the container exists (standalone or compose-managed), it starts it.
// If it doesn't exist at all, it falls back to docker compose up.

const { execSync, spawnSync } = require("child_process");

const CONTAINER_NAME = "pg-docker";

function run(cmd, opts = {}) {
  return spawnSync(cmd, { shell: true, stdio: "inherit", ...opts });
}

function getContainerStatus() {
  try {
    return execSync(
      `docker inspect -f "{{.State.Running}}" ${CONTAINER_NAME} 2>nul`,
      { shell: true }
    )
      .toString()
      .trim();
  } catch {
    return null;
  }
}

const status = getContainerStatus();

if (status === null) {
  // Container doesn't exist — create it via docker compose
  console.log(`\n🐳 Container "${CONTAINER_NAME}" not found. Starting via docker compose...\n`);
  const result = run("docker compose up -d");
  if (result.status !== 0) {
    console.error("❌ Failed to start database via docker compose.");
    process.exit(1);
  }
} else if (status === "true") {
  console.log(`✅ Database "${CONTAINER_NAME}" is already running.\n`);
} else {
  // Container exists but is stopped
  console.log(`\n🐳 Starting database container "${CONTAINER_NAME}"...\n`);
  const result = run(`docker start ${CONTAINER_NAME}`);
  if (result.status !== 0) {
    console.error(`❌ Failed to start container "${CONTAINER_NAME}".`);
    process.exit(1);
  }
  console.log(`✅ Database "${CONTAINER_NAME}" started.\n`);
}
