# Multiplayer Towerwars


## Reference Client
Run client with
``` 
cd cmd/client
go run main.go
``` 

Click on Tile in Field 0 to build a Tower

Press T to send a Mob to Field 0

Press R to send a Mob to Field 1

## HTTP Server
Run server with

``` 
cmd cmd/server
go run server.go
``` 

### Endpoints

`/game` :: Gets Game State