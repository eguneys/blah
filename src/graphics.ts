import { Rect } from './spatial'
import { App } from './app'
import { Log } from './common'

export class Texture {

  get width() {
    return this.image.width
  }

  get height() {
    return this.image.height
  }

  constructor(readonly image: HTMLImageElement) {}
}

export class TextureSampler {
}

export class Target {
}

export class Mesh {
  get index_count() {
    return 0
  }
}


export class Material {

}

export class DrawCall {

  target: Target = App.backbuffer
  mesh: Mesh = new Mesh()
  material: Material = new Material()
  has_viewport: boolean = false
  has_scissor: boolean = false
  viewport: Rect = Rect.make()
  scissor: Rect = Rect.make()
  index_start: number = 0
  index_count: number = 0
  instance_count: number = 0

  perform() {
    let pass = this

    if (!pass.target) {
      pass.target = App.backbuffer
      if (App.is_dev) {
        Log.warn('Trying to draw with an invalid Target; falling back to back buffer')
      }
    }

    let index_count = pass.mesh.index_count

    if (pass.index_start + pass.index_count > index_count) {
      if (App.is_dev) {
        Log.warn(`Trying to draw more indices than exists in the index buffer (${pass.index_start}-${pass.index_start+pass.index_count} / ${index_count}; trimming extra indices`)
      }
    }



  }
}
