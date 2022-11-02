import sprites_png from '../assets/green.png'
import { Rect, Mat3x2, Vec2 } from './'
import { Color, App, batch, Target, Texture } from './'
import { TextureSampler, TextureFilter } from './'

function load_image(path: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    let res = new Image()
    res.onload = () => resolve(res)
    res.src = path
  })
}

class Game {

  width = 320
  height = 180

  buffer!: Target
  image?: Texture

  init() {

    load_image(sprites_png)
    .then(image => 
          this.image = Texture.from_image(image))

    this.buffer = Target.create(this.width, this.height)
    batch.default_sampler = TextureSampler.make(TextureFilter.Nearest)
  }

  update() {
  }

  render() {


    {

      this.buffer.clear(Color.hex(0x150e22))
      if (this.image) {
        batch.tex(this.image)
      }
      batch.rect(Rect.make(0, 0, 10, 10), Color.hex(0xff0000))

      batch.render(this.buffer)
      batch.clear()
    }

    {
      let scale = Math.min(
        App.backbuffer.width / this.buffer.width,
        App.backbuffer.height / this.buffer.height)

        let screen_center = Vec2.make(App.backbuffer.width, App.backbuffer.height).scale(1/2)
        let buffer_center = Vec2.make(this.buffer.width, this.buffer.height).scale(1/2)

        App.backbuffer.clear(Color.black)
                                                  
        batch.push_matrix(Mat3x2.create_transform(screen_center, // position
                                                  buffer_center, // origin
                                                  Vec2.one.scale(scale), // scale
                                                  0                      // rotation
                                                 ))

        batch.tex(this.buffer.texture(0), Vec2.zero, Color.white)
        batch.pop_matrix()
        batch.render(App.backbuffer)
        batch.clear()
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
