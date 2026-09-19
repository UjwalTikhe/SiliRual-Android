const fs = require("fs");
let css = fs.readFileSync("src/styles.css", "utf8");

css = css.replace(
  /\.cmg-ball \{[\s\S]*?\}/,
  `.cmg-ball {
  position: absolute;
  width: 40px;
  height: 40px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 10px);
  z-index: 5;
  opacity: 0;
  transition: opacity 0s 0.4s;
  pointer-events: none;
}`,
);

fs.writeFileSync("src/styles.css", css);
