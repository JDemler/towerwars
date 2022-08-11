package main

// pixelpl towerwars client

import (
	"fmt"
	"image/color"
	"time"
	"towerwars/pkg/game"

	"github.com/faiface/pixel"
	"github.com/faiface/pixel/imdraw"
	"github.com/faiface/pixel/pixelgl"
	"golang.org/x/image/colornames"
)

type Client struct {
	game   *game.Game
	window *pixelgl.Window
}

func (c *Client) update(delta float64, events []game.FieldEvent) {
	c.game.Update(delta, events)
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
		alpha = 200
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

func (c *Client) drawField(field *game.Field, offsetX, offsetY int) {
	//draw field
	//draw tiles
	for _, tileRow := range field.TWMap.Tiles {
		for _, tile := range tileRow {
			c.drawTile(&tile)
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

	//Draw all fields with an offset of the current field
	for i, field := range c.game.Fields {
		// Offset windows canvas
		c.window.Canvas().SetMatrix(pixel.IM.Moved(pixel.V(float64(i)*500, 0)))
		// then draw field
		c.drawField(field, i*500, 0)
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
		game:   game.NewGame(),
		window: win,
	}

	lastTime := time.Now()
	for !win.Closed() {
		// calculate delta
		delta := float64(time.Now().Sub(lastTime).Milliseconds()) / 1000.0
		lastTime = time.Now()

		events := []game.FieldEvent{}
		//Check for MouseClick
		if win.JustPressed(pixelgl.MouseButtonLeft) {
			x := int(win.MousePosition().X / game.TileSize)
			y := int(win.MousePosition().Y / game.TileSize)
			events = append(events, game.FieldEvent{
				FieldId: 0,
				Type:    "build",
				Payload: fmt.Sprintf(`{"x": %d, "y": %d, "tower_type": "Arrow"}`, x, y),
			})
		} else if win.JustPressed(pixelgl.KeyR) {
			// when R is pressed fire a BuyMob event for field 0
			events = append(events, game.FieldEvent{
				FieldId: 0,
				Type:    "buy_mob",
				Payload: `{"target_field_id": 1, "mob_type": "Circle"}`,
			})
		} else if win.JustPressed(pixelgl.KeyT) {
			//when T is pressed fire a BuyMob event for field 1
			events = append(events, game.FieldEvent{
				FieldId: 1,
				Type:    "buy_mob",
				Payload: `{"target_field_id": 0, "mob_type": "Circle"}`,
			})
		}

		client.update(delta, events)
		client.draw()

		//if esc is pressed, close window
		if win.Pressed(pixelgl.KeyEscape) {
			break
		}
	}
}

func main() {
	pixelgl.Run(run)
}
