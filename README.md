# Multiplayer Towerwars


## Reference Client
Run client with
``` 
cd cmd/client
go run main.go
``` 

Client expects server to run on `localhost:8080`

Click on Tile to build a Tower
Press R to send a Mob

## HTTP Server
Run server with

``` 
cmd cmd/server
go run server.go
``` 

### Endpoints

`/game` :: Gets Game State
`/add_player` :: Adds a player. Returns player id if successfull
`/register_event` :: Register an Event (BuyMob, BuildTower) to the server. 200 OK if successfull
`/tower_types` :: Gets all Tower Types from gameconfig
`/mob_types` :: Gets all Mob Types from gameconfig