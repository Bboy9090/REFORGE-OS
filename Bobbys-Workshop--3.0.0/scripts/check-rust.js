const { execSync } = require("child_process");

function main() {
  try {
    const version = execSync("rustc --version", {
      encoding: "utf-8"
    }).trim();

    console.log(
      JSON.stringify({
        installed: true,
        version
      })
    );
  } catch (err) {
    console.log(
      JSON.stringify({
        installed: false
      })
    );
    process.exit(1);
  }
}

main();
