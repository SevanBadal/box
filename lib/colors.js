const black = "\x1b[30m"
const red = "\x1b[31m"
const green = "\x1b[32m"
const yellow = "\x1b[33m"
const blue = "\x1b[34m"
const magenta = "\x1b[35m"
const cyan = "\x1b[36m"
const white = "\x1b[37m"

const makeColor = (colorCode, text) => {
    return `${colorCode} ${text} \x1b[0m`
}
const makeYellow = (string) => {
    return makeColor(yellow, string)
}

const makeGreen = (string) => {
    return makeColor(green, string)
}

const makeRed = (string) => {
    return makeColor(red, string)
}

const makeBlue = (string) => {
    return makeColor(blue, string)
}

const makeMagenta = (string) => {
    return makeColor(magenta, string)
}

const makeCyan = (string) => {
    return makeColor(cyan, string)
}

module.exports = { makeYellow, makeGreen, makeRed, makeBlue, makeMagenta, makeCyan }