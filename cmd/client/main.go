package main

// pixelpl towerwars client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"image/color"
	"io/ioutil"
	"net/http"
	"time"
	"towerwars/pkg/game"

	"github.com/faiface/pixel"
	"github.com/faiface/pixel/imdraw"
	"github.com/faiface/pixel/pixelgl"
	"golang.org/x/image/colornames"
)

type Client struct {
	game       *game.Game
	url        string
	httpClient *http.Client
	window     *pixelgl.Window
	fieldId    int
	playerId   string
}

func (c *Client) joinGame() {
	// make http request to join game
	req, err := c.httpClient.Get(c.url + "/add_player")
	if err != nil {
		panic(err)
	}
	defer req.Body.Close()
	// Get PlayerID from response body
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		fmt.Println(err)
		return
	}
	err = json.Unmarshal(body, &c.fieldId)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func (c *Client) sendEvent(Event game.FieldEvent) {
	// make http request to send event
	// json encode event
	jsonEvent, err := json.Marshal(Event)
	if err != nil {
		fmt.Println(err)
		return
	}
	req, err := c.httpClient.Post(c.url+"/register_event", "application/json", bytes.NewBuffer([]byte(jsonEvent)))
	if err != nil {
		panic(err)
	}
	defer req.Body.Close()
}

// get gamestate from server
func (c *Client) getGameState() {
	// make http request to get gamestate
	req, err := c.httpClient.Get(c.url + "/game")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer req.Body.Close()
	// Get gamestate from response body
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		fmt.Println(err)
		return
	}
	err = json.Unmarshal(body, &c.game)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func (c *Client) drawMob(mob *game.Mob) {
	//draw mob
	imd := imdraw.New(nil)
	imd.Color = colornames.White
	imd.Push(pixel.V(mob.X, mob.Y))
	imd.Circle(10, 0)
	imd.Draw(c.window)
}

func (c *Client) drawBullet(bullet *game.Bullet) {
	//draw bullet
	imd := imdraw.New(nil)
	imd.Color = colornames.Red
	imd.Push(pixel.V(bullet.X, bullet.Y))
	imd.Circle(4, 0)
	imd.Draw(c.window)
}

func (c *Client) drawTower(tower *game.Tower) {
	//draw tower
	imd := imdraw.New(nil)
	imd.Color = colornames.Aqua
	imd.Push(pixel.V(tower.X, tower.Y))
	imd.Circle(13, 0)
	imd.Draw(c.window)
}

func (c *Client) drawTile(tile *game.Tile) {
	//draw tile
	imd := imdraw.New(nil)
	// Color is dependent on x and y position and if tile is occupied or not
	var alpha uint8 = 255
	if tile.IsOccupied() {
		alpha = 50
	}
	//Checssboard pattern
	if (tile.X+tile.Y)%2 == 0 {
		imd.Color = color.RGBA{R: 150, G: 100, B: 0, A: alpha}
	} else {
		imd.Color = color.RGBA{R: 100, G: 160, B: 0, A: alpha}
	}
	imd.Push(pixel.V(float64(tile.X)*game.TileSize, float64(tile.Y)*game.TileSize))
	imd.Push(pixel.V(float64(tile.X)*game.TileSize+game.TileSize, float64(tile.Y)*game.TileSize+game.TileSize))
	imd.Rectangle(0)
	imd.Draw(c.window)
}

func (c *Client) drawField(field *game.Field) {
	//draw field
	//draw tiles
	for _, tileRow := range field.TWMap.Tiles {
		for _, tile := range tileRow {
			c.drawTile(tile)
		}
	}

	//draw mobs
	for _, mob := range field.Mobs {
		c.drawMob(mob)
	}

	//draw towers
	for _, tower := range field.Towers {
		c.drawTower(tower)
	}

	//draw bullets
	for _, bullet := range field.Bullets {
		c.drawBullet(bullet)
	}

}

func (c *Client) draw() {
	c.window.Clear(colornames.Black)
	count := 0
	c.window.Canvas().SetMatrix(pixel.IM.Moved(pixel.V(float64(count)*500, 0)))
	// draw on field centered
	c.drawField(c.game.Fields[c.fieldId])

	//Draw all other fields with an offset of the current field
	for i, field := range c.game.Fields {
		if i != c.fieldId {
			count += 1
			// Offset windows canvas
			c.window.Canvas().SetMatrix(pixel.IM.Moved(pixel.V(float64(count)*500, 0)))
			// then draw field
			c.drawField(field)
		}
	}

	c.window.Update()
}

func run() {
	//create pixelgl window
	cfg := pixelgl.WindowConfig{
		Title:  "TowerWars",
		Bounds: pixel.R(0, 0, 800, 600),
		VSync:  true,
	}
	win, err := pixelgl.NewWindow(cfg)
	if err != nil {
		panic(err)
	}

	//create client
	client := &Client{
		game:       game.NewGame(),
		window:     win,
		url:        "http://localhost:8080",
		httpClient: &http.Client{},
	}

	client.joinGame()

	for !win.Closed() {
		client.getGameState()
		if client.game.State == game.WaitingState {
			// wait for game to start
			time.Sleep(time.Second * 1)
			fmt.Println("Waiting for game to start")
			continue
		}
		events := []game.FieldEvent{}
		//Check for MouseClick
		if win.JustPressed(pixelgl.MouseButtonLeft) {
			x := int(win.MousePosition().X / game.TileSize)
			y := int(win.MousePosition().Y / game.TileSize)
			events = append(events, game.FieldEvent{
				FieldId: client.fieldId,
				Type:    "build",
				Payload: fmt.Sprintf(`{"x": %d, "y": %d, "tower_type": "Arrow"}`, x, y),
			})
		} else if win.JustPressed(pixelgl.KeyR) {
			// when R is pressed fire a BuyMob event
			events = append(events, game.FieldEvent{
				FieldId: client.fieldId,
				Type:    "buy_mob",
				Payload: fmt.Sprintf(`{"target_field_id": %d, "mob_type": "Circle"}`, 1-client.fieldId),
			})
		}
		for _, event := range events {
			client.sendEvent(event)
		}
		client.draw()

		//sleep for 30ms to avoid 100% cpu usage
		time.Sleep(time.Millisecond * 30)
		//if esc is pressed, close window
		if win.Pressed(pixelgl.KeyEscape) {
			break
		}
	}
}

func main() {
	pixelgl.Run(run)
}
