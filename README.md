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
## Balancing the Game
Refer to [BALANCING.md](BALANCING.md) for tips on running the built-in tools to analyze tower and mob stats.

## Deployment with Azure Container Apps

1. Push images to your Azure Container Registry using the provided GitHub Actions workflow.
2. Create a Container Apps environment and two container apps (server and client) linked to your ACR repository. Example commands:

```bash
az group create --name <resource-group> --location <region>
az containerapp env create --name <environment> --resource-group <resource-group> --location <region>
az containerapp create --name <server-app> --resource-group <resource-group> --environment <environment> --image <acr-server>/socialmediawars:latest --target-port 8080 --ingress external
az containerapp create --name <client-app> --resource-group <resource-group> --environment <environment> --image <acr-server>/socialmediawars-client:latest --target-port 80 --ingress external
```

3. The GitHub Actions workflow updates these container apps on every push to `master`.

