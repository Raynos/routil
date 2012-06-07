var routil = require("../../index"),
    assert = require("assert"),
    sinon = require("sinon"),
    hogan = require("hogan.js"),
    path = require("path")

describe("Routil", function () {
    describe("API", function () {
        it("should have the correct functions", function () {
            ["config", "Routil", "ErrorPage", "errorPage", "redirect", 
                "mediaTypes", "static", "contentTypes", "encoding",
                "sendJson", "sendHtml", "send", "methods", "template",
                "Templar", "body", "jsonBody", "formBody"
            ].forEach(function (name) {
                assert(routil[name], "routil does not have method " + name)
            })
        })
    })

    describe("configure", function () {
        var r = routil.Routil()

        it("should configure options", function () {
            var spy = sinon.spy(),
                req = makeRequest(),
                res = makeResponse(),
                options = {
                    "*": spy
                }

            r.config({
                errorPage: options
            })

            r.errorPage(req, res)

            assert(spy.calledOnce, "errorPage handler was not called")
            assert(spy.calledWith(req, res, {
                message: 'Internal Server Error',
                code: 500,
                statusCode: 500,
                error: undefined,
                options: options,
                request: 'GET /',
                headers: {},
                url: "/"
            }), "Arguments to errorPage callback are incorrect")
        })
    })

    describe("errorPage", function () {
        it("should invoke ErrorPage", function () {
            var req = makeRequest(),
                res = makeResponse()

            routil.errorPage(req, res, 404)

            assert(res.setHeader.calledOnce, "setHeader was not called")
            assert(res.setHeader.calledWith("content-type", "text/plain"),
                "setHeader was not called correctly")

            assert(res.end.calledOnce, "end was not called")
            assert(res.end.calledWith("404 Not Found /\n"),
                "end was not called correctly")
        })

        it("should pass errors to ErrorPage", function () {
            var req = makeRequest(),
                res = makeResponse()

            routil.errorPage(req, res, new Error("mes"))

            assert(res.end.calledOnce, "end was not called")
            assert(res.end.calledWith("500 mes /\n"), 
                "end was not called with the correct error message")
        })

        it("should accept an array", function () {
            var req = makeRequest(),
                res = makeResponse()

            routil.errorPage(req, res, [403, new Error("foo")])

            assert(res.end.calledOnce, "end was not called")
            assert(res.end.calledWith("403 foo /\n"),
                "end was not called with the correct statusCode and message")
        })
    })

    describe("template", function () {
        setUpHogan()

        it("should invoke template", function () {
            var req = makeRequest(),
                res = makeResponse()

            routil.template(req, res, "foo.mustache", {
                bar: "text"
            })

            assert(res.end.calledOnce, "end was not called")
            assert(res.end.calledWith("text"), "end was not called correctly")

            assert(res.setHeader.calledTwice, "header was not called twice")
            assert(res.setHeader.calledWith("content-type", "text/html"),
                "content type was not set properly")
            assert(res.setHeader.calledWith("etag", sinon.match.string),
                "etag header was not set properly")
        })
    })
})

function setUpHogan() {
    var engine = {
        compile: function (contents, options) {
            var compiled = hogan.compile(contents, options)

            return renderer

            function renderer(data) {
                return compiled.render(data)
            }
        }
    }
    var templatePath = path.join(__dirname, "..", "templates")

    routil.config({
        templar: {
            engine: engine,
            folder: templatePath
        }
    })

    routil.Templar.loadFolder(templatePath)
}

function makeRequest(options) {
    if (!options) {
        options = {}
    }

    var setEncoding = sinon.spy(),
        pause = sinon.spy(),
        resume = sinon.spy(),
        req = {
            url: options.uri || options.url || "/",
            method: options.method || "GET",
            headers: options.headers || {},
            setEncoding: setEncoding,
            pause: pause,
            trailers: {},
            resume: resume
        }

    return req
}

function makeResponse() {
    var end = sinon.spy(),
        setHeader = sinon.spy(),
        getHeader = sinon.spy(),
        writeContinue = sinon.spy(),
        writeHead = sinon.spy(),
        head = sinon.spy(),
        removeHeader = sinon.spy(),
        write = sinon.spy(),
        addTrailers = sinon.spy(),
        res = {
            head: head,
            setHeader: setHeader,
            getHeader: getHeader,
            end: end,
            writeContinue: writeContinue,
            writeHead: writeHead,
            removeHeader: removeHeader,
            write: write,
            addTrailers: addTrailers
        }

    return res
}