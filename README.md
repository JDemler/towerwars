# Multiplayer Towerwars


## HTTP Server
Run server with

``` 
cmd cmd/server
go run server.go
``` 

### Endpoints

`/game` :: Gets Game State

`/add_player` :: Adds a player. Returns player id and key if successfull

`/register_event` :: Register an Event (BuyMob, BuildTower) to the server. 200 OK if successfull

`/tower_types` :: Gets all Tower Types from gameconfig

`/mob_types` :: Gets all Mob Types from gameconfig

`/ws` :: Websocket endpoint


### Server to Client Events

These events are very general and always have following fields

`type` :: Object Type ('player', 'tower', 'mob', 'bullet')

`kind` :: Kind of Event ('create', 'update', 'delete')

`fieldId` :: Field Id of the Event

`payload` :: The Object itself. In case of `delete` it is the id of the object


*Currently there is one exception to this*:

`stateChangedEvent` :: type: `stateChangedEvent`, payload: the new state 


### Client to Server Events

Currently there are four events the client can send to the server:

`buyMob`:

`{'type': 'buyMob', 'fieldId': 0, 'payload': {'targetFieldId': 1, 'mobType': 'facebookMom'}}`

`buildTower`: x and y are tile indices

`{'type': 'buildTower', 'fieldId': 0, 'payload': {'x': 1, 'y': 1, 'towerType': 'profilePicture'}}`

`upgradeTower`:

`{'type': 'upgradeTower', 'fieldId': 0, 'payload': {'towerId': 1}}`

 `sellTower`:

`{'type': 'sellTower', 'fieldId': 0, 'payload': {'towerId': 1}}`