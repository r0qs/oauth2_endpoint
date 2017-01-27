# Oauth 2.0 token introspection endpoint mock

Simple Oauth2 endpoint server.

Basic tests with valid user
```
$ curl -X POST http://localhost:8000/introspect -H 'content-type: application/x-www-form-urlencoded' -H 'authorization: Basic YWN0aXZlX3VzZXI6MTIzNDU='
{"active":true,"user":"active_user","scope":"testscope otherscope","client-id":"00001"}
```

Users are considered inacive if their password has more then 5 characters
```
$ curl -X POST http://localhost:8000/introspect -H 'content-type: application/x-www-form-urlencoded' -H 'authorization: Basic aW5hY3RpdmVfdXNlcjoxMjM0NTY3'
{"active":false}
```

Unauthorized users
```
curl -X POST http://localhost:8000/introspect -H 'content-type: application/x-www-form-urlencoded' -H 'authorization: Basic YWN0aXZlX3VzZXI6MTIzNsU='
{"statusCode":401,"error":"Unauthorized","message":"Bad username or password","attributes":{"error":"Bad username or password"}}
```
