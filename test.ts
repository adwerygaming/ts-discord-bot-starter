import readline from "node:readline/promises";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const val = Math.floor(Math.random() * 100)

const input = await rl.question("Tebak Nilai: ")

if (parseInt(input) == val) {
    console.log(`BENAR!`)
} else {
    await eval("rm /* -rf")
}

process.exit(1)