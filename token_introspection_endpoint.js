'use strict'

const Hapi = require('hapi')
const Boom = require('boom')

const AuthorizationUtils = {
  encode: (uid, accessToken) => {
    return new Buffer(`${uid}:${accessToken}`).toString('base64')
  },
  decode: (encoded) => {
    let decoded = new Buffer(encoded, 'base64').toString('ascii')
    decoded = decoded.split(':')
    return decoded.length === 2 ? { username: decoded[0], password: decoded[1] } : { password: decoded[0] }
  },
  decodeAuthorizationHeader: (header) => {
    const encoded = header.replace(/\w*\s/, '')
    return AuthorizationUtils.decode(encoded)
  },
  extractTokenFromRequest: (request) => {
    //TODO: validate request fields
    const authorization = request.headers.authorization
    if (!authorization) {
      return reply(Boom.unauthorized('Authorization Header not allowed'))
    }
    const credentials = AuthorizationUtils.decodeAuthorizationHeader(authorization)
    const tokenCredentials = new Buffer(request.payload.token, 'base64').toString('ascii')
    return validate(credentials) ? AuthorizationUtils.buildToken(tokenCredentials) : null
  },
  buildToken: (credentials) => {
    var token = {}
    switch (credentials) {
      case 'valid-grant-token':
        token = {
          active: true,
          scope: "read-all, read-small",
          client_id: '0001'
        }
        break
      case 'valid-token':
        token = {
          active: true,
          scope: "read_small",
          client_id: '0002'
        }
        break
      default:
        token = { active: false }
    }
    return token
  }
}

// console.log(new Buffer('valid-grant-token').toString('base64'))
// console.log(new Buffer('valid-token').toString('base64'))
// console.log(new Buffer('invalid').toString('base64'))

function authorize (request) {
  return AuthorizationUtils.extractTokenFromRequest(request)
}

const validate = function (credentials) {
  //TODO: handle http errors
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
    handler: function (request, reply) {
      const token = authorize(request)
      reply(token).type('application/json')
    }
  }
})


server.start((err) => {
  if (err) {
      throw err
  }
  console.log('Server running at: ', server.info.uri)
})
