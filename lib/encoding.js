var Negotiator = require("negotiator")

module.exports = encoding

function encoding(req, object) {
    var encodes = Object.keys(object),
        encode = new Negotiator(req).preferredEncoding(encodes)

    return object[encode] || object.default
}