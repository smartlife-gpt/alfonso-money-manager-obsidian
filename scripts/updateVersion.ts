// import readline from "readline";
import fsPromise from "fs/promises";
import { exec } from "child_process";
import inquirer from "inquirer";
import pkg from "../package.json";
import manifest from "../manifest.json";

async function syncManifest() {
  const info = {
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
  };

  const newManifest = {
    ...manifest,
    ...info,
  };

  await fsPromise.writeFile(
    "./manifest.json",
    JSON.stringify(newManifest, null, 2) + "\n"
  );
}

async function main() {
  const data = await fsPromise.readFile("./package.json", "utf8");
  const pkg = JSON.parse(data);
  console.log(`Version plugin: ${pkg.version}`);

  const { answer } = await inquirer.prompt([
    {
      type: "list",
      name: "answer",
      message: "Please select the version number you want to increase",
      choices: ["1", "0.1", "0.0.1"],
    },
  ]);

  let [major, minor, patch] = pkg.version.split(".");

  switch (answer) {
    case "1":
      major = parseInt(major) + 1;
      break;
    case "0.1":
      minor = parseInt(minor) + 1;
      break;
    case "0.0.1":
      patch = parseInt(patch) + 1;
      break;
    default:
      console.log("The version number entered is incorrect");
      process.exit(1);
  }

  pkg.version = `${major}.${minor}.${patch}`;
  await fsPromise.writeFile(
    "./package.json",
    JSON.stringify(pkg, null, 2),
    "utf8"
  );
  console.log(`The version number has been updated to: ${pkg.version}`);
  const { isSync } = await inquirer.prompt([
    {
      type: "confirm",
      name: "isSync",
      message:
        "Please tell me if you want to update simultaneously manifest.json version number",
    },
  ]);
  if (isSync) {
    await syncManifest();
    console.log("manifest.json updated");
  }

  const { isTag } = await inquirer.prompt([
    {
      type: "confirm",
      name: "isTag",
      message: "Do you need to publish a new one? git tag",
    },
  ]);
  if (isTag) {
    exec(`git tag ${pkg.version}`, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
      console.log(stdout);
      console.log(stderr);
    });
    console.log(`git tag v${pkg.version}`);
  }
}

main();
