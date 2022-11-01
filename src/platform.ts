import { Config } from './app'

export class Platform {
  static try_make_platform = (config: Config) => {
    return new Platform(config)
  }

  get get_draw_size() {
    if (this.canvas) {
      return [this.canvas.width, this.canvas.height]
    } else {
      return [this.config.width, this.config.height]
    }
  }

  canvas?: HTMLCanvasElement

  constructor(readonly config: Config) {}

  present() {}

  update() {
  }

  gl_context_create() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.config.width
    this.canvas.height = this.config.height

    return this.canvas.getContext('webgl2')

  }


  init() {}
  ready() {}
}
