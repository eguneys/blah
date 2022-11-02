import { ShaderData } from './renderer'
import { Color } from './color'
import { Mat4x4, Vec2, Rect } from './spatial'
import { App } from './app'
import { Log } from './common'
import { Vertex } from './batch'

const mat_float32_data = (mat: Mat4x4) => {
  return [
    mat.m11, mat.m12, mat.m13, mat.m14,
    mat.m21, mat.m22, mat.m23, mat.m24,
    mat.m31, mat.m32, mat.m33, mat.m34,
    mat.m41, mat.m42, mat.m43, mat.m44]
}

const blah_calc_uniform_size = (uniform: UniformInfo) => {
  let components = 0
  switch(uniform.type) {
    case UniformType.Float: 
      components = 1
      break
    case UniformType.Float2:
      components = 2
      break
    case UniformType.Float3:
      components = 3
      break
    case UniformType.Float4:
      components = 4
      break
    case UniformType.Mat3x2:
      components = 9
      break
    case UniformType.Mat4x4:
      components = 16
      break
    default:
      break
  }

  return components * uniform.array_length

}


export type TextureRef = Texture | undefined

export enum UniformType {
  None,
  Float,
  Float2,
  Float3,
  Float4,
  Mat3x2,
  Mat4x4,
  Texture2D,
  Sampler2D
}

export enum ShaderType {
  None,
  Vertex,
  Fragment,
  Both
}

export class UniformInfo {
  constructor(
    readonly name: string,
    readonly type: UniformType,
    readonly shader: ShaderType,
    readonly register_index: number = 0,
    readonly buffer_index: number = 0,
    readonly array_length: number = 0) {}
}

export class VertexFormat {
  stride: number = 0

  constructor(readonly attributes: Array<VertexAttribute>) {

    attributes.forEach(attribute => {
      switch (attribute.type) {
        case VertexType.Float: this.stride += 4
          break
        case VertexType.Float2: this.stride += 8 
          break
        case VertexType.Float3: this.stride += 12 
          break
        case VertexType.Float4: this.stride += 16 
          break
        case VertexType.UByte4: this.stride += 4 
          break
      }
    })

  }
}

export class VertexAttribute {
  static make = (index: number, type: VertexType, normalized: boolean) => {
    let res = new VertexAttribute()
    res.index = index
    res.type = type
    res.normalized = normalized
    return res
  }

  index: number = 0
  type: VertexType = VertexType.None

  normalized: boolean = false
}

export enum VertexType {
  None,
  Float,
  Float2,
  Float3,
  Float4,
  UByte4
}

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

  static make = (filter: TextureFilter = TextureFilter.Linear, wrap_x: TextureWrap = TextureWrap.Repeat, wrap_y: TextureWrap = TextureWrap.Repeat) => {
    return new TextureSampler(filter, wrap_x, wrap_y)
  }

  static get get_default() { return new TextureSampler(TextureFilter.Linear, TextureWrap.Repeat, TextureWrap.Repeat) }

  constructor(readonly filter: TextureFilter,
              readonly wrap_x: TextureWrap,
              readonly wrap_y: TextureWrap) {}



}

export abstract class Texture {

  static from_image = (image: HTMLImageElement) => {
    return Texture.create(image.width, image.height, TextureFormat.RGBA, image)
  }

  static create = (width: number, height: number, format: TextureFormat, data?: HTMLImageElement | ImageData) => {
    let tex = App.renderer.create_texture(width, height, format)

    if (tex && data) {
      tex.set_data(data)
    }
    return tex
  }


  abstract width: number
  abstract height: number
  abstract set_data(data: ImageData | HTMLImageElement): void
  abstract is_framebuffer: boolean

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

  texture(index: number) {
    return this.textures[index]
  }

  abstract textures: Attachments
  abstract clear(color: Color, depth?: number, stencil?: number): void

}

export abstract class Mesh {

  static create = () => App.renderer.create_mesh()

  abstract index_count: number
  abstract vertex_count: number
  abstract instance_count: number

  abstract index_data(indices: Array<number>): void
  abstract vertex_data(format: VertexFormat, vertices: Array<Vertex>): void
}

export abstract class Shader {

  static create = (data: ShaderData) => {
    let shader = App.renderer.create_shader(data)

    if (shader) {

    }

    return shader
  }

  abstract uniforms: Array<UniformInfo>
}

export class Material {

  static create = (shader: Shader) => new Material(shader)

  m_shader: Shader

  m_textures: Array<TextureRef> = []
  m_samplers: Array<TextureSampler> = []

  get shader() {
    return this.m_shader
  }

  m_data: Float32Array

  get data() {
    return this.m_data
  }

  constructor(shader: Shader) {
    this.m_shader = shader


    let uniforms = shader.uniforms

    let float_size = 0

    uniforms.forEach(uniform => {
      if (uniform.type === UniformType.None) {
        return 
      }

      if (uniform.type === UniformType.Texture2D) {
      }

      if (uniform.type === UniformType.Sampler2D) {
      }

      float_size += blah_calc_uniform_size(uniform)
    })

    this.m_data = new Float32Array(float_size)
  }


  get_sampler(name: string, array_index: number = 0) {}
  get_sampler_at(register_index: number) {
    return this.m_samplers[register_index]
  }

  get_texture(name: string, array_index: number = 0) {}
  get_texture_at(register_index: number) {
    return this.m_textures[register_index]
  }

  set_sampler_at_location(location: number, sampler: TextureSampler) {
    this.m_samplers[location] = sampler
  }

  set_texture_at_location(location: number, texture: TextureRef) {
    this.m_textures[location] = texture
  }

  set_texture(name: string, texture: TextureRef, index: number = 0) {
    let _ = this.m_shader.uniforms.find(uniform => {
      if (uniform.type === UniformType.Texture2D && uniform.name === name) {
        return true
        /*
        if (uniform.register_index + index < this.m_textures.length) {
          return true
        }
       */
      }
      return false
    })
    if (_) {
      this.m_textures[_.register_index + index] = texture
    }
  }

  set_sampler(name: string, sampler: TextureSampler, index: number = 0) {
    let _ = this.m_shader.uniforms.find(uniform => {
      if (uniform.type === UniformType.Sampler2D && uniform.name === name) {
        return true
      }
      return false
    })
    if (_) {
      this.m_samplers[_.register_index + index] = sampler
    }
  }

  set_matrix(name: string, mat: Mat4x4) {
    let offset = 0
    let _ = this.m_shader.uniforms.find(uniform => {
      if (uniform.type === UniformType.Texture2D ||
          uniform.type === UniformType.Sampler2D ||
            uniform.type === UniformType.None) {
        return false
      }

      if (uniform.name === name) {
        this.m_data.set(mat_float32_data(mat), offset)
        return true
      }
      offset += blah_calc_uniform_size(uniform)
      return false
    })

    if (!_) {
      Log.warn(`No uniform ${name} exists`)
    }
  }

  has_value(name: string) {
    return !!this.m_shader.uniforms.find(_ => _.name === name)
  }
}

export class DrawCall {

  target: Target = App.backbuffer
  mesh!: Mesh
  material!: Material
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
