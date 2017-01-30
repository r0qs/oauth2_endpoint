'use strict'

const Hapi = require('hapi')
const Basic = require('hapi-auth-basic')

const base64 = {
  encode: (object) => {
    return new Buffer(object, 'utf8').toString('base64')
  },
  decode: (object) => {
    return new Buffer(object, 'base64').toString('utf8')
  }
}

// Mocked database
const db = {
  // Auth:  active_user:12345 == Basic YWN0aXZlX3VzZXI6MTIzNDU=
  active_user: {
    username: 'active_user',
    password: 'MTIzNDU=',   // '12345'
    name: 'An active user',
    id: '00001',
    type: 'admin'
  },
  // Auth:  inactive_user:1234567 == Basic aW5hY3RpdmVfdXNlcjoxMjM0NTY3
  inactive_user: {
    username: 'inactive_user',
    password: 'MTIzNDU2Nw==',   // '1234567'
    name: 'An inactive user',
    id: '00002',
    type: 'inactive'
  },
  // Auth:  alibaba:abretesesamo == Basic YWxpYmFiYTphYnJldGVzZXNhbW8=
  alibaba: {
    username: 'alibaba',
    password: 'YWJyZXRlc2VzYW1v', // abretesesamo
    name: 'A gateway user',
    id: '00003',
    type: 'user'
  }
}

const internals = {}

internals.header = function (username, password) {
  return 'Basic ' + base64.encode(username + ':' + password)
}

internals.show_user_data = function (username, password) {
  console.log('Auth: ', internals.header(username, password))
  console.log('User: ', username)
  console.log('Password: ', base64.encode(password))
}

// internals.how_user_data('active_user', '12345')
// internals.show_user_data('inactive_user', '1234567')

const validate = function (request, username, password, callback) {
  const user = db[username]
  if (!user) {
    return callback(null, false)
  }

  if (username === user.username) {
    var token = {}
    switch (user.type) {
      case 'admin':
        token = {
          active: true,
          user: user.username,
          scope: ['create-post', 'take-picture', 'view-picture'],
          client_id: user.id
        }
        break
      case 'user':
        token = {
          active: true,
          user: user.username,
          scope: ['view-picture'],
          client_id: user.id
        }
        break
      default:
        token = { active: false }
    }
    return callback(null, password === base64.decode(user.password), token)
  }

  return callback(null, false)
}

const server = new Hapi.Server()
server.connection({
  host: '0.0.0.0',
  port: 8000
})

function response_handler(request, reply) {
  const credentials = JSON.stringify(request.auth.credentials)
  reply(credentials).type('application/json')
}

server.register(Basic, (err) => {
  server.auth.strategy('simple', 'basic', { validateFunc: validate })
  server.route([{
    method: 'POST',
    path:'/introspect/admin',
    config: {
      auth: {
        strategy: 'simple',
        scope: ['create-post', 'take-picture'],
      },
      handler: function (request, reply) { response_handler(request, reply) }
    }
  }, {
    method: 'POST',
    path:'/introspect/user',
    config: {
      auth: {
        strategy: 'simple',
        scope: ['view-picture'],
      },
      handler: function (request, reply) { response_handler(request, reply) }
    }
  }, {
    method: 'POST',
    path:'/introspect/inactive',
    config: {
      auth: {
        strategy: 'simple'
      },
      handler: function (request, reply) { response_handler(request, reply) }
    }
  }])
})

server.start((err) => {
  if (err) {
      throw err
  }
  console.log('Server running at: ', server.info.uri)
})
