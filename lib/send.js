module.exports = send

send.sendJson = sendJson
send.sendHtml = sendHtml

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

    headers = headers || {}
    headers["content-length"] = data.length
    
    res.writeHead(statusCode || res.statusCode || 200, headers)

    res.end(data)
}