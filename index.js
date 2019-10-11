'use strict'
const url = require('url')
const pkg = require('./package.json')
const {send} = require('micro')
const allowHeaders = [
  'accept-encoding',
  'accept-language',
  'accept',
  'access-control-allow-origin',
  'authorization',
  'cache-control',
  'connection',
  'content-length',
  'content-type',
  'dnt',
  'pragma',
  'range',
  'referer',
  'user-agent',
  'x-http-method-override',
  'x-requested-with',
]
const exposeHeaders = [
  'accept-ranges',
  'age',
  'cache-control',
  'content-length',
  'content-language',
  'content-type',
  'date',
  'etag',
  'expires',
  'last-modified',
  'pragma',
  'server',
  'transfer-encoding',
  'vary',
  'x-github-request-id',
]
const cors = require('./micro-cors.js')({allowHeaders, exposeHeaders})
const fetch = require('node-fetch')

async function service (req, res) {
  let p = url.parse(req.url, true).path
  if(!p.includes('http')) {
    res.setHeader('content-type', 'text/html')
    let html = `<!DOCTYPE html>
    <html>
      <title>cors-buster</title>
      <h1>CORS Buster!</h1>
      <h2>This is based on https://github.com/wmhilton/cors-buster</h2>
      <h2>Modified by Colin Diesh for returning status codes properly</h2>
    </html>
    `
    return send(res, 400, html)
  }

  let headers = {}
  for (let h of allowHeaders) {
    if (req.headers[h]) {
      headers[h] = req.headers[h]
    }
  }

  console.log(p)
  let f = await fetch(p,
    {
      method: req.method,
      headers,
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? req : undefined
    }
  )
  for (let h of exposeHeaders) {
    if (h === 'content-length') continue
    if (f.headers.has(h)) {
      res.setHeader(h, f.headers.get(h))
    }
  }
  send(res, f.status, f.body)
}

module.exports = cors(service)
