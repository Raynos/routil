module.exports = contentTypes

function contentTypes(req, object) {
    var types = Object.keys(object),
        contentType = req.headers["content-type"] || "",
        typeMatch

    for (var i = 0; i < types.length; i++) {
        var type = types[i]

        if (contentType.indexOf(type) !== -1) {
            typeMatch = type
            break;
        }
    }

    return object[typeMatch] || object.default
}