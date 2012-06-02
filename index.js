var ErrorPage = require("error-page"),
    StringDecoder = require("string_decoder").StringDecoder,
    Negotiator = require("negotiator"),
    Templar = require("templar"),
    querystring = require("querystring"),
    extend = require("xtend")

var static = require("./lib/static")

var isJSON = /\/(x-)?json$/,
    isForm = /application\/x\-www\-form\-urlencoded/
    
module.exports = Routil()

function Routil(options) {
    var config = extend({
        errorPage: {},
        templar: {}
    }, options || {})

    return {
        config: configure,
        Routil: Routil,
        ErrorPage: ErrorPage,
        errorPage: errorPage,
        redirect: redirect,
        mediaTypes: mediaTypes,
        static: static,
        Static: static.Static,
        encoding: encoding,
        sendJson: sendJson,
        sendHtml: sendHtml,
        send: send,
        methods: methods,
        template: template,
        Templar: Templar,
        body: body,
        formBody: formBody,
        jsonBody: jsonBody
    }

    function errorPage(req, res, details) {
        if (Array.isArray(details)) {
            var page = ErrorPage(req, res, config.errorPage)
            page.apply(page, details)
        } else {
            ErrorPage(req, res, config.errorPage)(details)
        }
    }

    function redirect(req, res, target, statusCode) {
        res.statusCode = statusCode || 302
        res.setHeader('location', target)

        mediaTypes(req, res, {
            "application/json": function () {
                sendJson(res, {
                    redirect: target,
                    statusCode: statusCode
                })
            },
            "default": function  () {
                var html =  '<html><body><h1>Moved'
                if (statusCode === 302) {
                    html += ' Permanently'
                }
                html += '</h1><a href="' + target + '">' + target + '</a>'

                sendHtml(res, html)
            }
        })()
    }

    function mediaTypes(req, res, object)  {
        var types = Object.keys(object),
            mediaType = new Negotiator(req).preferredMediaType(types)

        return object[mediaType] || object.default || notSupportedHandler

        function notSupportedHandler() {
            errorPage(req, res, 
                [new Error("mediaType not supported"), 415])
        }
    }

    function encoding(req, object) {
        var encodes = Object.keys(object),
            encode = new Negotiator(req).preferredEncoding(encodes)

        return object[mediaType] || object.default
    }

    function sendJson(res, object, statusCode) {
        send(res, JSON.stringify(object), statusCode, {
            "content-type": "application/json"
        })
    }

    function sendHtml(res, data, statusCode) {
        send(res, data, statusCode, {
            "content-type": "text/html"
        })
    }

    function send(res, data, statusCode, headers) {
        if (!Buffer.isBuffer(data)) {
            data = new Buffer(data)
        }
        
        res.writeHead(statusCode || res.statusCode || 200, 
            extend((headers || {}), {
                "content-length": data.length
            }))

        res.end(data)
    }

    function methods(routes) {
        return requestHandler

        function requestHandler(req, res, params) {
            var method = req.method

            if (routes[method]) {
                return routes[method](req, res, params)
            }
            errorPage(req, res, 405)
        }
    }

    function configure(object)  {
        extend(config, object)
    }

    function template(req, res, name, data) {
        Templar(req, res, config.templar)(name, data)
    }

    function body(req, callback) {
        if (req.body) {
            callback(req.body)
        }

        var requestBody = "",
            stringDecoder = new StringDecoder

        req.on("data", addToBody)

        req.on("end", returnBody)

        function addToBody(buffer) {
            requestBody += stringDecoder.write(buffer)
        }

        function returnBody() {
            req.body = requestBody
            callback(requestBody)        
        }
    }

    function formBody(req, res, callback)  {
        if (!req.headers['content-type'].match(isForm)) {
            // XXX Add support for formidable uploading, as well
            errorPage(req, res, 415)
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