var routil = require("../../index"),
    assert = require("assert"),
    sinon = require("sinon")

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
        it("should invoke template", function () {
            
        })
    })
})

function makeRequest(options) {
    var req = {
        url: "/",
        method: "GET",
        headers: {}
    }

    return req
}

function makeResponse() {
    var end = sinon.spy(),
        setHeader = sinon.spy(),
        head = sinon.spy(),
        res = {
            head: head,
            setHeader: setHeader,
            end: end
        }

    return res
}