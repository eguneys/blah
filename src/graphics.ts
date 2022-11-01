import { ShaderData } from './renderer'
import { Color } from './color'
import { Vec2, Rect } from './spatial'
import { App } from './app'
import { Log } from './common'

export enum TextureFormat {
  None,
  R,
  RGBA,
  DepthStencil,
  Count
}

export enum TextureFilter {
  None,
  Linear,
  Nearest
}

export enum TextureWrap {
  None,
  Clamp,
  Repeat
}

export class TextureSampler {

  constructor(readonly filter: TextureFilter,
              readonly wrap_x: TextureWrap,
              readonly wrap_y: TextureWrap) {}



}

export abstract class Texture {

  static create = (width: number, height: number, format: TextureFormat, data?: ImageData) => {
    let tex = App.renderer.create_texture(width, height, format)

    if (tex && data) {
      tex.set_data(data)
    }
    return tex
  }


  abstract width: number
  abstract height: number
  abstract set_data(data: ImageData | HTMLImageElement): void

  constructor() {}
}

export type Attachments = Array<Texture>

export abstract class Target {

  static create = (width: number, height: number) => {
    return App.renderer.create_target(width, height)
  }

  get width() {
    return this.textures[0].width
  }

  get height() {
    return this.textures[0].height
  }

  abstract textures: Attachments
  abstract clear(color: Color, depth?: number, stencil?: number): void

}

export abstract class Mesh {
  instance_count!: number
  index_count!: number
}

export abstract class Shader {

  static create = (data: ShaderData) => {
    let shader = App.renderer.create_shader(data)

    if (shader) {

    }

    return shader
  }

}

export class Material {

  shader!: Shader
}

export class DrawCall {

  target: Target = App.backbuffer
  mesh!: Mesh
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
      if (__IS_DEV__) {
        Log.warn('Trying to draw with an invalid Target; falling back to back buffer')
      }
    }

    let index_count = pass.mesh.index_count

    if (pass.index_start + pass.index_count > index_count) {
      if (__IS_DEV__) {
        Log.warn(`Trying to draw more indices than exists in the index buffer (${pass.index_start}-${pass.index_start+pass.index_count} / ${index_count}; trimming extra indices`)
      }

      if (pass.index_start > pass.index_count) {
        return
      }

      pass.index_count = pass.index_count - pass.index_start
    }


    let instance_count = pass.mesh.instance_count
    if (pass.instance_count > instance_count) {
      if (__IS_DEV__) {
        Log.warn(`Trying to draw more instances than exists in the index buffer (${pass.instance_count} / ${instance_count}); trimming extra instances`)

        pass.instance_count = instance_count
      }
    }

    let draw_size = Vec2.make(pass.target.width, pass.target.height)

    if (!pass.has_viewport) {
      pass.viewport.x = 0
      pass.viewport.y = 0
      pass.viewport.w = draw_size.x
      pass.viewport.h = draw_size.y
    } else {
      pass.viewport = pass.viewport.overlaps_rect(Rect.make(0, 0, draw_size.x, draw_size.y))
    }


    if (pass.has_scissor) {
      pass.scissor = pass.scissor.overlaps_rect(Rect.make(0, 0, draw_size.x, draw_size.y))
    }


    App.renderer.render(pass)
  }
}
