const fs = require("fs");
const path = require("path");

function generateTree(dir, prefix = "") {
  const items = fs.readdirSync(dir).filter(item => item !== "node_modules" && item !== ".git");

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const pointer = isLast ? "└── " : "├── ";
    console.log(prefix + pointer + item);

    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      generateTree(fullPath, prefix + (isLast ? "    " : "│   "));
    }
  });
}

generateTree(process.cwd());