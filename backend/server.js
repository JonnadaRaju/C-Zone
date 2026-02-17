const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/run", (req, res) => {
    const code = req.body.code;

    if (!code) {
        return res.status(400).json({ error: "No code provided" });
    }

    const filename = "program.c";
    const outputBinary = "program.out";

    fs.writeFileSync(filename, code);

    exec(`clang ${filename} -o ${outputBinary}`, (compileErr, stdout, stderr) => {
        if (compileErr) {
            return res.json({ error: stderr });
        }

        exec(`./${outputBinary}`, { timeout: 5000 }, (runErr, runStdout, runStderr) => {
            if (runErr) {
                return res.json({ error: runStderr || "Runtime error" });
            }

            res.json({ output: runStdout });
        });
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
