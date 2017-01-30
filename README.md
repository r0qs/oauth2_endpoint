# Token introspection endpoint

Simple Oauth2 token introspection endpoint server.

Basic tests with valid user
```
$ curl -X POST http://localhost:8000/introspect/admin -H 'content-type: application/x-www-form-urlencoded' -H 'authorization: Basic YWN0aXZlX3VzZXI6MTIzNDU='
{"active":true,"user":"active_user","scope":["create-post","take-picture","view-picture"],"client_id":"00001"}
```

```
$ curl -X POST http://localhost:8000/introspect/user -H 'content-type: application/x-www-form-urlencoded' -H 'authorization: Basic YWxpYmFiYTphYnJldGVzZXNhbW8='
{"active":true,"user":"alibaba","scope":["view-picture"],"client_id":"00003"}
```

Users are considered inacive if their password has more then 5 characters
```
$ curl -X POST http://localhost:8000/introspect/inactive -H 'content-type: application/x-www-form-urlencoded' -H 'authorization: Basic aW5hY3RpdmVfdXNlcjoxMjM0NTY3'
{"active":false}
```

Unauthorized users
```
$ curl -X POST http://localhost:8000/introspect/user -H 'content-type: application/x-www-form-urlencoded' -H 'authorization: Basic YWN0aXZlX3VzZXI6MTIzNsU='
{"statusCode":401,"error":"Unauthorized","message":"Bad username or password","attributes":{"error":"Bad username or password"}}
```

Insufficient scope
```
$ curl -X POST http://localhost:8000/introspect/user -H 'content-type: application/x-www-form-urlencoded' -H 'authorization: Basic aW5hY3RpdmVfdXNlcjoxMjM0NTY3'
{"statusCode":403,"error":"Forbidden","message":"Insufficient scope"}
```
