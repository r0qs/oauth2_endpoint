'use strict'

const Hapi = require('hapi')
const Boom = require('boom')

function encode(username, password) {
  return new Buffer(`${username}:${password}`).toString('base64')
}

function decode(encoded) {
  let decoded = new Buffer(encoded, 'base64').toString('utf8')
  decoded = decoded.split(':')
  return decoded.length === 2 ? { username: decoded[0], password: decoded[1] } : { password: decoded[0] }
}

function decodeAuthorizationHeader(header) {
  const encoded = header.replace(/\w*\s/, '')
  return decode(encoded)
}

function buildToken(token) {
  var authToken = {}
  token = new Buffer(token, 'base64').toString('utf8')
  switch (token) {
    case 'valid-grant-token':
      authToken = {
        active: true,
        scope: "read-all read-small",
        client_id: '0001',
        secret: 'You should not know', //extention_fields
        someId: 1
      }
      break
    case 'valid-token':
      authToken = {
        active: true,
        scope: "read-small",
        client_id: '0002',
        secret: 'You should not know',
        someId: 2
      }
      break
    default:
      authToken = { active: false }
  }
  return authToken
}

function authorize (request, reply) {
  const payload = request.payload
  if (!payload) {
    return reply(Boom.unauthorized('Credentials must be provided'))
  }

  if (!payload.token) {
    return reply(Boom.unauthorized('Credentials must be provided'))
  }

  const authorization = request.headers.authorization
  if (!authorization) {
    return reply(Boom.unauthorized('Authorization Header not allowed'))
  }
  const credentials = decodeAuthorizationHeader(authorization)

  if (!validate(credentials)) {
    return reply(Boom.unauthorized('Bad username or password'))
  }

  return reply(buildToken(payload.token)).type('application/json')
}

const validate = function (credentials) {
  return credentials.username == 'admin' && credentials.password == 'admin'
}

const server = new Hapi.Server()
server.connection({
  host: '0.0.0.0',
  port: 8000
})


server.route({
  method: 'POST',
  path:'/token/introspect',
  config: {
    handler: function (request, reply) { authorize(request, reply) }
  }
})


server.start((err) => {
  if (err) {
      throw err
  }
  console.log('Server running at: ', server.info.uri)
})
