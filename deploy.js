const { execSync } = require("child_process");
const os = require("os");
const path = require("path");

const fs = require("fs-extra");
const { NodeSSH } = require("node-ssh");
const tar = require("tar");

const consoleUtils = require("./console-utils");

const ssh = new NodeSSH();
const args = process.argv.slice(2);
const ENV_ARG = args.find(
  (arg) => arg.includes("--env=staging") || arg === "--env=staging"
);
const ENV = ENV_ARG ? "staging" : "live";

const NODE_PATH = "/home/gplprpt/.nvm/versions/node/v24.6.0/bin/node";
const CONFIG = {
  live: {
    REMOTE_DIR: "/home/gplprpt/guestpostlinks-pr-report",
    TAR_NAME: "deploy.tar.gz",
    PM2_CONFIG: "ecosystem.config.js",
    ENV_FILE: ".env.production",
    BUILD_CMD: "npm run build",
  },
  staging: {
    REMOTE_DIR: "/home/gplprpt/records-tool-staging",
    TAR_NAME: "deploy-staging.tar.gz",
    PM2_CONFIG: "ecosystem.staging.config.js",
    ENV_FILE: ".env.staging",
    BUILD_CMD: "npm run build:staging",
  },
}[ENV];

const HOST = "pr.guestpostlinks.net";
const USER = "gplprpt";
const PORT = 243;
const KEY_PATH = "C:/Users/AMRYTT2.0/.ssh/id_ed25519";

// 👇 Force remote toolchain (node/npm/pm2) to this exact Node version
const REMOTE_NODE_BIN = "/home/gplprpt/.nvm/versions/node/v24.6.0/bin";
const REMOTE_NODE = `${REMOTE_NODE_BIN}/node`;
const REMOTE_NPM = `${REMOTE_NODE_BIN}/npm`;
const REMOTE_PM2 = `${REMOTE_NODE_BIN}/pm2`;

async function deploy() {
  const startTime = Date.now();
  consoleUtils.header(`${ENV.toUpperCase()} DEPLOYMENT STARTED`);

  const localEnvPath = path.resolve(__dirname, CONFIG.ENV_FILE);
  const remoteEnvPath = `${CONFIG.REMOTE_DIR}/${CONFIG.ENV_FILE}`;
  const TEMP_DIR = path.join(os.tmpdir(), `deploy-temp-${Date.now()}`);
  const TAR_NAME = CONFIG.TAR_NAME;
  const TAR_PATH = path.join(__dirname, TAR_NAME);

  // Cleanup
  [TAR_PATH, TEMP_DIR].forEach((p) => fs.existsSync(p) && fs.removeSync(p));
  fs.mkdirSync(TEMP_DIR);

  // Build (local)
  consoleUtils.section("Building Project Locally");
  try {
    execSync(CONFIG.BUILD_CMD, { stdio: "inherit" });
    consoleUtils.success("Build completed locally.");
  } catch (err) {
    consoleUtils.error("Build failed.");
    consoleUtils.box(`${err.message}\n\n${err.stack}`, "error");
    process.exit(1);
  }

  // Copy minimal files
  consoleUtils.section("Copying Minimal Files");
  try {
    fs.copySync(".next/standalone", TEMP_DIR);
    fs.copySync(".next/static", path.join(TEMP_DIR, ".next/static"));
    fs.copySync("public", path.join(TEMP_DIR, "public"));
    fs.copyFileSync("package.json", path.join(TEMP_DIR, "package.json"));
    fs.copyFileSync(
      "package-lock.json",
      path.join(TEMP_DIR, "package-lock.json")
    );
    fs.copyFileSync(CONFIG.ENV_FILE, path.join(TEMP_DIR, CONFIG.ENV_FILE));
    fs.copyFileSync("server.js", path.join(TEMP_DIR, "server.js"));
    fs.copyFileSync(CONFIG.PM2_CONFIG, path.join(TEMP_DIR, CONFIG.PM2_CONFIG));
    consoleUtils.success("Minimal project copied.");
  } catch (err) {
    consoleUtils.error("Failed to copy minimal project files.");
    consoleUtils.box(`${err.message}\n\n${err.stack}`, "error");
    process.exit(1);
  }

  // Create tarball
  consoleUtils.section("Creating Tarball");
  try {
    await tar.c({ gzip: true, file: TAR_PATH, cwd: TEMP_DIR }, ["."]);
    fs.removeSync(TEMP_DIR);
    consoleUtils.success("Tarball created.");
  } catch (err) {
    consoleUtils.error("Failed to create tarball.");
    consoleUtils.box(`${err.message}\n\n${err.stack}`, "error");
    process.exit(1);
  }

  // SSH Connect
  consoleUtils.section("Connecting to SSH");
  try {
    await ssh.connect({
      host: HOST,
      port: PORT,
      username: USER,
      privateKey: fs.readFileSync(KEY_PATH, "utf8"),
    });
    consoleUtils.success("SSH connection established.");
  } catch (err) {
    consoleUtils.error("SSH connection failed.");
    consoleUtils.box(`${err.message}\n\n${err.stack}`, "error");
    process.exit(1);
  }

  // Upload
  consoleUtils.section("Uploading Files");
  try {
    await ssh.putFile(TAR_PATH, `${CONFIG.REMOTE_DIR}/${TAR_NAME}`);
    await ssh.putFile(localEnvPath, remoteEnvPath);
    consoleUtils.success("Files uploaded.");
  } catch (err) {
    consoleUtils.error("File upload failed.");
    consoleUtils.box(`${err.message}\n\n${err.stack}`, "error");
    process.exit(1);
  }

  // Remote Commands Helper (prefix PATH so npm/pm2/node resolve from REMOTE_NODE_BIN)
  async function runRemote(cmd) {
    const prefix = `export PATH="${REMOTE_NODE_BIN}:$PATH";`;
    const { stdout, stderr } = await ssh.execCommand(
      `cd ${CONFIG.REMOTE_DIR} && ${prefix} ${cmd}`
    );
    if (stderr) throw new Error(stderr);
    return stdout;
  }

  // Deploy
  consoleUtils.section("Deploying on Server");
  try {
    await runRemote(
      `rm -rf .next public node_modules && tar -xzf ${TAR_NAME} && rm ${TAR_NAME}`
    );
    await runRemote(`${REMOTE_NPM} install --omit=dev`);
    await runRemote(`${REMOTE_PM2} reload ${CONFIG.PM2_CONFIG}`);
    consoleUtils.success("Remote deployment completed.");
  } catch (err) {
    consoleUtils.error("Remote deployment step failed.");
    consoleUtils.box(`${err.message}\n\n${err.stack}`, "error");
    process.exit(1);
  }

  // Cleanup
  ssh.dispose();
  if (fs.existsSync(TAR_PATH)) fs.unlinkSync(TAR_PATH);

  consoleUtils.header(`${ENV.toUpperCase()} DEPLOYMENT COMPLETE`);
  consoleUtils.success(
    `⏱ Finished in ${((Date.now() - startTime) / 1000).toFixed(2)} seconds.`
  );
}

deploy();
