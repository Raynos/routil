var Negotiator = require("negotiator"),
    routilErrorPage = require("../index").errorPage

module.exports = MediaTypes

function MediaTypes(options) {
    var errorPage = routilErrorPage || options.errorPage

    return mediaTypes

    function mediaTypes(req, res, object)  {
        var types = Object.keys(object),
            mediaType = new Negotiator(req).preferredMediaType(types)

        return object[mediaType] || object.default || 
            createNotSupportedHandler(req, res)
    }

    function createNotSupportedHandler(req, res) {
        return notSupportedHandler

        function notSupportedHandler() {
            errorPage(req, res, 
                [new Error("mediaType not supported"), 415])
        }
    }
}