var routilMediaTypes = require("../index").mediaTypes,
    sendJson = require("./send").sendJson,
    sendHtml = require("./send").sendHtml

module.exports = Redirect

function Redirect(options) {
    var mediaTypes = routilMediaTypes || options.mediaTypes

    return redirect

    function redirect(req, res, target, statusCode) {
        statusCode = statusCode || 302
        res.statusCode = statusCode
        res.setHeader('location', target)

        mediaTypes(req, res, {
            "application/json": jsonRedirectHandler,
            "default": defaultRedirectHandler
        })(res, target, statusCode)
    }
}

function jsonRedirectHandler(res, target, statusCode) {
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