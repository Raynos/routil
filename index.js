// Third party
var ErrorPage = require("error-page"),
    Negotiator = require("negotiator"),
    Templar = require("templar"),
    extend = require("xtend"),
    // node
    querystring = require("querystring"),
    // internal
    static = require("./lib/static"),
    encoding = require("./lib/encoding"),
    contentTypes = require("./lib/contentTypes"),
    body = require("./lib/body"),
    send = require("./lib/send"),
    sendJson = send.sendJson,
    sendHtml = send.sendHtml,
    // variables
    isJSON = /\/(x-)?json$/,
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
        contentTypes: contentTypes,
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
        statusCode = statusCode || 302
        res.statusCode = statusCode
        res.setHeader('location', target)

        mediaTypes(req, res, {
            "application/json": jsonRedirectHandler,
            "default": defaultRedirectHandler
        })(res, target, statusCode)
    }

    function jsonRedirectHandler() {
        sendJson(res, {
            redirect: target,
            statusCode: statusCode
        })
    }

    function defaultRedirectHandler(res, target, statusCode) {
        var html =  '<html><body><h1>Moved'
        if (statusCode === 302) {
            html += ' Permanently'
        }
        html += '</h1><a href="' + target + '">' + target + '</a>'

        sendHtml(res, html)
    }

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

    function methods(routes, handleHttpForms) {
        if (handleHttpForms)  {
            return createHttpFormsRequestHandler(routes)
        }
        return requestHandler

        function requestHandler(req, res) {
            var method = req.method,
                f = routes[method]

            if (f) {
                return f.apply(this, arguments)
            }
            errorPage(req, res, 405)
        }
    }

    function createHttpFormsRequestHandler(routes) {
        return httpFormsRequestHandler

        function httpFormsRequestHandler(req, res) {
            if (req.method !== "POST") {
                return requestHandler.apply(this, arguments)
            }

            var args = arguments,
                self = this

            contentTypes(req, {
                "application/json": jsonBody,
                "default": formBody
            })(req, res, extractMethod)

            function extractMethod(body) {
                var method = body._method,
                    f = routes[method]

                if (f) {
                    return f.apply(self, args)
                }
                errorPage(req, res, 405)
            }
        }
    }

    function configure(object)  {
        extend(config, object)
    }

    function template(req, res, name, data) {
        Templar(req, res, config.templar)(name, data || {})
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