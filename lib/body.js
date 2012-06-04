var StringDecoder = require("string_decoder"),
    querystring = require("querystring"),
    routilErrorPage = require("../index").errorPage

module.exports = Body

function Body(options) {
    var errorPage = routilErrorPage || options.errorPage

    return {
        body: body,
        formBody: formBody,
        jsonBody: jsonBody
    }

    function formBody(req, res, callback)  {
        if (!req.headers['content-type'].match(isForm)) {
            // XXX Add support for formidable uploading, as well
            return errorPage(req, res, 415)
        } 
        body(req, parseBody)

        function parseBody(body) {
            callback(querystring.parse(body))
        }
    }

    function jsonBody(req, res, callback) {
        if (!req.headers["content-type"].match(isJSON)) {
            return errorPage(req, res, 415)
        }
        body(req, extractJSON)

        function extractJSON(body) {
            try {
                var json = JSON.parse(body)
            } catch (error) {
                return errorPage(req, res, [400, error])
            }
            callback(json)
        }
    }
}

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