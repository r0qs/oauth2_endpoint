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
    id: '00001'
  },
  // Auth:  inactive_user:1234567 == Basic aW5hY3RpdmVfdXNlcjoxMjM0NTY3
  inactive_user: {
    username: 'inactive_user',
    password: 'MTIzNDU2Nw==',   // '1234567'
    name: 'An inactive user',
    id: '00002'
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
    // inactive password larger than 5 characters
    if (password.length > 5) {
      return callback(null, password === base64.decode(user.password), { "active": false })
    }

    return callback(null, password === base64.decode(user.password), {
      active: true,
      user: user.username,
      scope: "testscope otherscope",
      "client-id": user.id
    })
  }
  return callback(null, false)
}

const server = new Hapi.Server()
server.connection({
  host: 'localhost',
  port: 8000
})

server.register(Basic, (err) => {
  server.auth.strategy('default', 'basic', { validateFunc: validate })
  server.route({
    method: 'POST',
    path:'/introspect',
    config: {
      auth: 'default',
      handler: function (request, reply) {
        reply(JSON.stringify(request.auth.credentials))
      }
    }
  })
})

server.start((err) => {
  if (err) {
      throw err
  }
  console.log('Server running at: ', server.info.uri)
})
