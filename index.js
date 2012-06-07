var ErrorPage = require("error-page"),
    Templar = require("templar"),
    extend = require("xtend"),
    Static = require("./lib/static"),
    Body = require("./lib/body"),
    MediaTypes = require("./lib/mediaTypes"),
    Redirect = require("./lib/redirect"),
    Methods = require("./lib/methods"),
    encoding = require("./lib/encoding"),
    contentTypes = require("./lib/contentTypes"),
    body = require("./lib/body"),
    send = require("./lib/send"),
    sendJson = send.sendJson,
    sendHtml = send.sendHtml
    
module.exports = Routil()

function Routil(options) {
    var config = extend({
            errorPage: {},
            templar: {}
        }, options || {}),
        body = Body({
            errorPage: errorPage
        }),
        static = Static({ 
            errorPage: errorPage 
        }),
        methods = Methods({
            errorPage: errorPage
        }),
        mediaTypes = MediaTypes({
            errorPage: errorPage
        }),
        redirect = Redirect({
            mediaTypes: mediaTypes
        })

    return {
        config: configure,
        Routil: Routil,
        ErrorPage: ErrorPage,
        errorPage: errorPage,
        redirect: redirect,
        mediaTypes: mediaTypes,
        static: static,
        contentTypes: contentTypes,
        encoding: encoding,
        sendJson: sendJson,
        sendHtml: sendHtml,
        send: send,
        methods: methods,
        template: template,
        Templar: Templar,
        body: body.body,
        formBody: body.formBody,
        jsonBody: body.jsonBody
    }

    function errorPage(req, res, details) {
        if (Array.isArray(details)) {
            var page = ErrorPage(req, res, config.errorPage)
            page.apply(page, details)
        } else {
            ErrorPage(req, res, config.errorPage)(details)
        }
    }

    function configure(object)  {
        extend(config, object)
    }

    function template(req, res, name, data) {
        Templar(req, res, config.templar)(name, data || {})
    }
}