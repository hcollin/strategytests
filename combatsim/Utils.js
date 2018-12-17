

const COLORS = {
    "Black" : "\x1b[30m%s\x1b[0m",
    "Red" : "\x1b[31m%s\x1b[0m",
    "Green" : "\x1b[32m%s\x1b[0m",
    "Yellow" : "\x1b[33m%s\x1b[0m",
    "Blue" : "\x1b[34m%s\x1b[0m",
    "Magenta" : "\x1b[35m%s\x1b[0m",
    "Cyan" : "\x1b[36m%s\x1b[0m",
    "White" : "\x1b[37m%s\x1b[0m"
};

function write(text, level=0, color="White", topLines=0, bottomLines=0) {
    if(topLines >0) {
        console.log("\n".repeat(topLines -1));
    }
    console.log(COLORS[color], `${ "   ".repeat(level)}${text}`);
    if(bottomLines >0) {
        console.log("\n".repeat(bottomLines-1));
    }

}


module.exports = write;