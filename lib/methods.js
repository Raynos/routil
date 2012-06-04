var contentTypes = require("./contentTypes"),
    routilErrorPage = require("../index").errorPage

module.exports = Methods

function Methods(options) {
    var errorPage = routilErrorPage || options.errorPage

    return methods

    function methods(routes, handleHttpForms) {
        if (handleHttpForms)  {
            return httpFormsRequestHandler
        }
        return requestHandler

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

        function requestHandler(req, res) {
            var method = req.method,
                f = routes[method]

            if (f) {
                return f.apply(this, arguments)
            }
            errorPage(req, res, 405)
       }
    }
}