export class HTTPRequest {
    protocolVersion // Version of the http protocol specified in the first line
    method // Method of the request (GET, POST, etc)
    url // URL including path, query and fragment
    body // Any data in body
    headers // Map of headers

    path // Path part of the url
    query // Map of query parameters
    fragment // String of text after # mark
    parsed // Parsed body

    constructor(data, autoParseBody = true) {
        if (!data) {
            throw new Error('Http data cannot be null')
        }

        // Parse data
        const lines = data.split(/\r?\n/)

        // First line
        const firstLine = lines.shift()
        const [method, url, protocolVersion] = firstLine.split(' ')
        this.method = method
        this.url = url
        this.protocolVersion = protocolVersion.split('/')[1]

        // Headers
        this.headers = {}
        while (true) {
            const currentLine = lines.shift()
            if (currentLine == '') {
                break
            }
            const [key, value] = currentLine.split(': ')
            this.headers[key] = value
        }

        // Body
        if (lines.length > 0) {
            this.body = lines.join('\n')
        }
        else {
            this.body = null
        }
        this.parsed = null
        if (autoParseBody && this.body) {
            this._parseBody()
        }

        // Parse url parts
        this._parseURL(this.url)
    }

    _parseURL(url) {
        // Path
        let [path, remaining] = url.split('?')
        this.path = path
        if (!remaining) {
            return
        }

        // Fragment
        let [query, fragment] = remaining.split('#')
        this.fragment = fragment
        
        // Query
        this.query = {}
        query = query.split('&')
        for (const param of query) {
            const [key, value] = param.split('=')
            this.query[key] = value
        }
    }

    _parseBody() {
        // JSON
        if (this.headers['Content-Type'] == 'application/json') {
            this.parsed = JSON.parse(this.body)
            return
        }

        // Form
        if (this.headers['Content-Type'] == 'application/x-www-form-urlencoded') {
            this.parsed = {}
            const params = this.body.split('&')
            for (const param of params) {
                const [key, value] = param.split('=')
                this.parsed[key] = value
            }
            return
        }

        // other parsing options...
    }

    toString() {
        let result = `${this.method} ${this.url} HTTP/${this.protocolVersion}\r\n`
        for (const key in this.headers) {
            result += `${key}: ${this.headers[key]}\r\n`
        }
        result += '\r\n'
        if (this.body) {
            result += this.body
        }
        return result
    }
}

export class HTTPResponse {
    protocolVersion // Version of the http protocol specified in the first line
    reason
    statusCode
    body
    headers

    constructor(dataString) {
        if (!dataString) {
            throw new Error('Http data cannot be null')
        }

        // Parse data
        const lines = dataString.split('\r\n')

        // First line
        const statusLine = lines.shift()
        const [protocolVersion, statusCode, ...reason] = statusLine.split(' ')
        this.protocolVersion = protocolVersion.split('/')[1]
        this.statusCode = parseInt(statusCode)
        this.reason = reason.join(' ')

        // Headers
        this.headers = {}
        while (true) {
            const currentLine = lines.shift()
            if (currentLine == '') {
                break
            }
            const [key, value] = currentLine.split(': ')
            this.headers[key] = value
        }

        // Body
        if (lines.length > 0) {
            this.body = lines.join('\r\n')
        }
        else {
            this.body = null
        }
    }

    toString() {
        let result = `HTTP/${this.protocolVersion} ${this.statusCode} ${this.reason}\r\n`
        for (const key in this.headers) {
            result += `${key}: ${this.headers[key]}\r\n`
        }
        result += '\r\n'
        if (this.body) {
            result += this.body
        }
        return result
    }
}

export default {
    HTTPRequest,
    HTTPResponse
}