var StringDecoder = require("string_decoder")

module.exports = body

function body(req, callback) {
    if (req.__routil_body__) {
        callback(req.__routil_body__)
    }

    var requestBody = "",
        stringDecoder = new StringDecoder

    req.on("data", addToBody)

    req.on("end", returnBody)

    function addToBody(buffer) {
        requestBody += stringDecoder.write(buffer)
    }

    function returnBody() {
        req.__routil_body__ = requestBody
        callback(requestBody)        
    }
}