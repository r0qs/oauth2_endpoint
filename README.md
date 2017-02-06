# Token introspection endpoint

Simple Oauth2 token introspection endpoint server.

Tests with valid-token
```
$ curl -X POST http://localhost:8000/token/introspect -H 'content-type: application/x-www-form-urlencoded' -H 'authorization: Basic YWRtaW46YWRtaW4=' -d 'token=dmFsaWQtdG9rZW4='
{"active":true,"scope":"read-small","client_id":"0002","secret":"You should not know","someId":2}

$ curl -X POST http://localhost:8000/token/introspect -H 'content-type: application/x-www-form-urlencoded' -H 'authorization: Basic YWRtaW46YWRtaW4=' -d 'token=dmFsaWQtZ3JhbnQtdG9rZW4='
{"active":true,"scope":"read-all read-small","client_id":"0001","secret":"You should not know","someId":1}
```

With invalid-token
```
$ curl -X POST http://localhost:8000/token/introspect -H 'content-type: application/x-www-form-urlencoded' -H 'authorization: Basic YWRtaW46YWRtaW4=' -d 'token=aW52YWxpZC10b2tlbg=='
{"active":false}
```

Invalid credentials
```
$ curl -X POST http://localhost:8000/token/introspect -H 'content-type: application/x-www-form-urlencoded' -H 'authorization: Basic YWRtaW46YWRtsd=' -d 'token=dmFsaWQtZ3JhbnQtdG9rsd4='
{"statusCode":401,"error":"Unauthorized","message":"Bad username or password"}

```

Missing token
```
$ curl -X POST http://localhost:8000/token/introspect -H 'content-type: application/x-www-form-urlencoded' -H 'authorization: Basic YWRtaW46YWRtaW4=' 
{"statusCode":401,"error":"Unauthorized","message":"Credentials must be provided"}

```
