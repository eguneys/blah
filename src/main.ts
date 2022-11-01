import { Vec2, Color, App, batch, Target } from './'

class Game {

  width = 320
  height = 180

  buffer!: Target

  init() {
    this.buffer = Target.create(this.width, this.height)
  }

  update() {
  }

  render() {
    {

      batch.clear()
    }


    {
      let scale = Math.min(
        App.backbuffer.width / this.buffer.width,
        App.backbuffer.height / this.buffer.height)

        let screen_center = Vec2.make(App.backbuffer.width, App.backbuffer.height).scale(1/2)
        let buffer_center = Vec2.make(this.buffer.width, this.buffer.height).scale(1/2)

        App.backbuffer.clear(Color.black)

    }
  }
}

const app = (element: HTMLElement) => {

  let game = new Game()

  App.run({
    name: 'My Awesome Game',
    width: 1280,
    height: 720,
    on_startup() {
      game.init()
    },
    on_update() {
      game.update()
    },
    on_render() {
      game.render()
    }
  })

  if (App.canvas) {
    element.appendChild(App.canvas)
  }
}

app(document.getElementById('app')!)

export default {}
