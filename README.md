# Multiplayer Towerwars

## Run locally
Requirements:
1. [Go](https://go.dev/doc/install)
2. [NodeJs](https://nodejs.org/en/download/)

First run the server:
``` bash
cd cmd/server
go run .
```

In a seperate command line run the web frontend:
```
cd web/client
npm install
npm start
```

To play against yourself, you need to open the website twice.

## HTTP Server
Run server with

``` 
cd cmd/server
go run .
``` 

Run server that uses an agent to play against you:

```
cd cmd/server
go run . agent
```

### Endpoints

`/add_player` :: Adds a player. Returns player id and playerKey and gameId if successfull

For example `{"key":"b326447090e3a58d","fieldId":0,"gameId":"0ac475f17632fcc1"}` 

`/social_networks`:: Gets all playable SocialNetworks

`/add_agent?gameId=<gameId>` :: Adds a computer player

`/game?gameId=<gameid>` :: Gets Game State

`/tower_types?gameId=<gameid>` :: Gets all Tower Types from gameconfig

`/mob_types?gameId=<gameid>` :: Gets all Mob Types from gameconfig

`/ws?gameId=<gameid>&playerKey=<playerkey>` :: Websocket endpoint. Connect to the websocket of a game instance for a player


### Server to Client Events

These events are very general and always have following fields

`type` :: Object Type ('field', 'player', 'tower', 'mob', 'bullet', 'barracks', 'path')

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