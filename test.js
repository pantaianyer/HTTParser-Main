import fs from 'fs'
import { describe, test } from '@jest/globals'

import { HTTPRequest, HTTPResponse } from './httparser.js'


describe("HTTP Request", () => {
    test("Parse correct HTTP request", () => {
        const data = fs.readFileSync('examples/get.request.http', 'utf8')
        expect(new HTTPRequest(data))
    })

    test("Parse correct values", () => {
        const data = fs.readFileSync('examples/get.request.http', 'utf8')
        const request = new HTTPRequest(data)

        expect(request.method).toBe('GET')
        expect(request.url).toBe('/index.html?a=5&b=asd#footer')
        expect(request.protocolVersion).toBe('1.1')
        expect(request.headers['Host']).toBe('www.example.com')
        expect(request.headers['Connection']).toBe('Keep-Alive')
        expect(request.body).toBe('')
    })

    test("Calculates correct values", () => {
        const data = fs.readFileSync('examples/get.request.http', 'utf8')
        const request = new HTTPRequest(data)

        /// index.html?a=5&b=asd#footer
        expect(request.path).toBe('/index.html')
        expect(request.query['a']).toBe('5')
        expect(request.query['b']).toBe('asd')
        expect(request.fragment).toBe('footer')
    })

    test("Correct body parsing: JSON", () => {
        const data = fs.readFileSync('examples/json.request.http', 'utf8')
        const request = new HTTPRequest(data)

        expect(request.headers['Content-Type']).toBe('application/json')
        expect(request.parsed['name']).toBe('John')
        expect(request.parsed['age']).toBe(30)
        expect(request.parsed['car']).toBeNull()
    })

    test("Correct body parsing: Form", () => {
        const data = fs.readFileSync('examples/form.request.http', 'utf8')
        const request = new HTTPRequest(data)

        expect(request.headers['Content-Type']).toBe('application/x-www-form-urlencoded')
        expect(request.parsed['licenseID']).toBe('1266')
        expect(request.parsed['age']).toBe('27')
        expect(request.parsed['state']).toBe('NYC')
    })
})
 