
const log = [];


function write(text) {
    log.push({msg: text});
    console.log(text);
}


module.exports = write;