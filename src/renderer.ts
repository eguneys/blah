import { Vec2 } from './spatial'
import { Color } from './color'
import { Vertex } from './batch'
import { UniformInfo, UniformType, ShaderType } from './graphics'
import { VertexType, VertexFormat } from './graphics'
import { TextureSampler, TextureFilter, TextureWrap, TextureFormat } from './graphics'
import { Mesh, Shader, Texture, DrawCall, Target } from './graphics'
import { BlendOp, BlendFactor } from './graphics'
import { App } from './app'
import { Log } from './common'
import default_vertex_shader from './default.vert'
import default_fragment_shader from './default.frag'

export type ShaderData = [string, string]
const webgl_batch_shader_data: ShaderData = [default_vertex_shader, default_fragment_shader]

export class WebGL_Shader extends Shader {
  m_id!: WebGLProgram
  get gl_id() { return this.m_id } 

  m_uniforms: Array<UniformInfo> = []
  uniform_locations: Array<WebGLUniformLocation> = []

  get uniforms() {
    return this.m_uniforms
  }


  constructor(readonly data: ShaderData) { 
    super() 
  
    let vertex_shader = App.renderer.gl.createShader(App.renderer.gl.VERTEX_SHADER)!
    {
      App.renderer.gl.shaderSource(vertex_shader, data[0])
      App.renderer.gl.compileShader(vertex_shader)
      let log = App.renderer.gl.getShaderInfoLog(vertex_shader)

      if (log) {
        Log.error(log)
        return
      }
    }


    let fragment_shader = App.renderer.gl.createShader(App.renderer.gl.FRAGMENT_SHADER)!
    {
      App.renderer.gl.shaderSource(fragment_shader, data[1])
      App.renderer.gl.compileShader(fragment_shader)
      let log = App.renderer.gl.getShaderInfoLog(fragment_shader)

      if (log && log.length > 0) {
        Log.error(log)
        return
      }
    }

    let id = App.renderer.gl.createProgram()!
    App.renderer.gl.attachShader(id, vertex_shader)
    App.renderer.gl.attachShader(id, fragment_shader)
    App.renderer.gl.linkProgram(id)
    let log = App.renderer.gl.getProgramInfoLog(id)
    App.renderer.gl.deleteShader(vertex_shader)
    App.renderer.gl.deleteShader(fragment_shader)

    if (log && log.length > 0) {
      Log.error(log)
      return
    }


    let valid_uniforms = true
    {

      let active_uniforms = App.renderer.gl.getProgramParameter(id, App.renderer.gl.ACTIVE_UNIFORMS)
      let sampler_uniforms = 0

      for (let i = 0; i < active_uniforms; i++) {
        let {
          name,
          type,
          size
        } = App.renderer.gl.getActiveUniform(id, i)!


        if (type === App.renderer.gl.SAMPLER_2D) {

          let tex_uniform = new UniformInfo(name,
                                            UniformType.Texture2D,
          ShaderType.Fragment,
          sampler_uniforms,
          0,
          size)
          this.uniform_locations.push(App.renderer.gl.getUniformLocation(id, name)!)
          this.m_uniforms.push(tex_uniform)



          let sampler_uniform = new UniformInfo(name + '_sampler',
                                                UniformType.Sampler2D,
          ShaderType.Fragment,
          sampler_uniforms,
          0,
          size)
          this.uniform_locations.push(App.renderer.gl.getUniformLocation(id, name)!)
          this.m_uniforms.push(sampler_uniform)


          sampler_uniforms++;
        } else {
          let uniform_type = UniformType.None

          if (type === App.renderer.gl.FLOAT) {
            uniform_type = UniformType.Float
          } else if (type === App.renderer.gl.FLOAT_VEC2) {
            uniform_type = UniformType.Float2
          } else if (type === App.renderer.gl.FLOAT_VEC3) {
            uniform_type = UniformType.Float3
          } else if (type === App.renderer.gl.FLOAT_VEC4) {
            uniform_type = UniformType.Float4
          } else if (type === App.renderer.gl.FLOAT_MAT3x2) {
            uniform_type = UniformType.Mat3x2
          } else if (type === App.renderer.gl.FLOAT_MAT4) {
            uniform_type = UniformType.Mat4x4
          } else {
            valid_uniforms = false
            Log.error(`Unsupported uniform type`)
            break
          }


          let uniform = new UniformInfo(name,
                                        uniform_type,
          ShaderType.Both,
          0,
          0,
          size)

          this.uniform_locations.push(App.renderer.gl.getUniformLocation(id, name)!)
          this.m_uniforms.push(uniform)
        }
      }
    }

    this.m_id = id
  }



}

export class WebGL_Mesh extends Mesh {

  m_id: WebGLVertexArrayObject
  m_index_format!: number

  m_vertex_buffer!: WebGLBuffer
  m_instance_buffer!: WebGLBuffer
  m_index_buffer!: WebGLBuffer

  m_index_count!: number
  m_vertex_count!: number
  m_instance_count!: number
  m_vertex_size!: number
  m_instance_size!: number
  m_index_size!: number

  get gl_id() { return this.m_id }

  get gl_index_format() { return this.m_index_format }
  get gl_index_size() { return this.m_index_size } 


  get index_count() {
    return this.m_index_count
  }

  get instance_count() {
    return this.m_instance_count
  }

  get vertex_count() {
    return this.m_vertex_count
  }

  constructor() {
    super()
    this.m_id = App.renderer.gl.createVertexArray()!
  }

  vertex_data(format: VertexFormat, data: ArrayBuffer) {

    this.m_vertex_count = data.byteLength

    App.renderer.gl.bindVertexArray(this.m_id)

    {
      if (!this.m_vertex_buffer) {
        this.m_vertex_buffer = App.renderer.gl.createBuffer()!
      }

      this.m_vertex_size = this.gl_mesh_assign_attributes(this.m_vertex_buffer, App.renderer.gl.ARRAY_BUFFER, format, 0)


      App.renderer.gl.bindBuffer(App.renderer.gl.ARRAY_BUFFER, this.m_vertex_buffer)
      App.renderer.gl.bufferData(App.renderer.gl.ARRAY_BUFFER, data, App.renderer.gl.DYNAMIC_DRAW)
    }

    App.renderer.gl.bindVertexArray(null)

  }

  index_data(indices: Array<number>) {

    let _indices = new Uint32Array(indices)

    this.m_index_count = _indices.length

    App.renderer.gl.bindVertexArray(this.m_id)

    {
      if (!this.m_index_buffer) {
        this.m_index_buffer = App.renderer.gl.createBuffer()!
      }

      this.m_index_format = App.renderer.gl.UNSIGNED_INT
      this.m_index_size = 4

      App.renderer.gl.bindBuffer(App.renderer.gl.ELEMENT_ARRAY_BUFFER, this.m_index_buffer)
      App.renderer.gl.bufferData(App.renderer.gl.ELEMENT_ARRAY_BUFFER, _indices, App.renderer.gl.DYNAMIC_DRAW)
    }
  }


  gl_mesh_assign_attributes(buffer: WebGLBuffer, buffer_type: GLenum, format: VertexFormat, divisor: GLint) {
    App.renderer.gl.bindBuffer(buffer_type, buffer)

    let ptr = 0
    format.attributes.forEach(attribute => {

      let type = App.renderer.gl.UNSIGNED_BYTE
      let component_size = 0
      let components = 1

      if (attribute.type === VertexType.Float) {
        type = App.renderer.gl.FLOAT
        component_size = 4
        components = 1
      }

      if (attribute.type === VertexType.Float2) {
        type = App.renderer.gl.FLOAT
        component_size = 4
        components = 2
      }

      if (attribute.type === VertexType.Float3) {
        type = App.renderer.gl.FLOAT
        component_size = 4
        components = 3
      }


      if (attribute.type === VertexType.Float4) {
        type = App.renderer.gl.FLOAT
        component_size = 4
        components = 4
      }


      if (attribute.type === VertexType.UByte4) {
        type = App.renderer.gl.UNSIGNED_BYTE
        component_size = 1
        components = 4
      }

      let location = attribute.index
      App.renderer.gl.enableVertexAttribArray(location)
      App.renderer.gl.vertexAttribPointer(location, components, type, attribute.normalized, format.stride, ptr)
      App.renderer.gl.vertexAttribDivisor(location, divisor)

      ptr += components * component_size
    })
    return format.stride
  }

}

export class WebGL_Target extends Target {

  m_id!: WebGLFramebuffer
  m_attachments!: Array<Texture>

  m_width: number
  m_height: number

  get gl_id() { return this.m_id }

  get textures() { return this.m_attachments }

  clear(color: Color, depth: number = 1, stencil: number = 0) {
    App.renderer.clear_backbuffer(color, depth, stencil, this.m_id)
  }

  constructor(width: number, height: number, attachments: Array<TextureFormat>) {
    super()

    this.m_attachments = []
    this.m_id = App.renderer.gl.createFramebuffer()!

    this.m_width = width
    this.m_height = height

    App.renderer.gl.bindFramebuffer(App.renderer.gl.FRAMEBUFFER, this.m_id)

    attachments.forEach((attachment, i) => {
      let tex = Texture.create(width, height, attachment)
      tex.framebuffer_parent = true
      
      this.m_attachments.push(tex)

      if (attachment !== TextureFormat.DepthStencil) {
        App.renderer.gl.framebufferTexture2D(App.renderer.gl.FRAMEBUFFER, 
                                             App.renderer.gl.COLOR_ATTACHMENT0 + i, 
                                             App.renderer.gl.TEXTURE_2D, 
                                             tex.gl_id, 0)
      } else {
        App.renderer.gl.framebufferTexture2D(App.renderer.gl.FRAMEBUFFER, 
                                             App.renderer.gl.DEPTH_STENCIL_ATTACHMENT, 
                                             App.renderer.gl.TEXTURE_2D, 
                                             tex.gl_id, 0)
      }
    })

  }
}

export class WebGL_Texture extends Texture {

  m_id: WebGLTexture

  m_width: number
  m_height: number
  m_sampler: TextureSampler
  m_format: TextureFormat
  m_gl_internal_format: GLenum
  m_gl_format: GLenum
  m_gl_type: GLenum

  framebuffer_parent: boolean

  get is_framebuffer() {
    return this.framebuffer_parent
  }

  get width() {
    return this.m_width
  }

  get height() {
    return this.m_height
  }

  set_data(data: ImageData | HTMLImageElement) {
    App.renderer.gl.activeTexture(App.renderer.gl.TEXTURE0)
    App.renderer.gl.bindTexture(App.renderer.gl.TEXTURE_2D, this.m_id)
    App.renderer.gl.texImage2D(App.renderer.gl.TEXTURE_2D, 0, this.m_gl_internal_format,
                               this.m_width, this.m_height, 0, this.m_gl_format, this.m_gl_type, data)
  }


  update_sampler(sampler: TextureSampler) {
    if (this.m_sampler !== sampler) {
      this.m_sampler = sampler

      App.renderer.gl.bindTexture(App.renderer.gl.TEXTURE_2D, this.m_id)
      App.renderer.gl.texParameteri(App.renderer.gl.TEXTURE_2D, 
                                    App.renderer.gl.TEXTURE_MIN_FILTER, 
                                    this.m_sampler.filter === TextureFilter.Nearest ? 
                                      App.renderer.gl.NEAREST : App.renderer.gl.LINEAR)
      App.renderer.gl.texParameteri(App.renderer.gl.TEXTURE_2D, 
                                    App.renderer.gl.TEXTURE_MAG_FILTER, 
                                    this.m_sampler.filter === TextureFilter.Nearest ? 
                                      App.renderer.gl.NEAREST : App.renderer.gl.LINEAR)
      App.renderer.gl.texParameteri(App.renderer.gl.TEXTURE_2D, 
                                    App.renderer.gl.TEXTURE_WRAP_S, 
                                    this.m_sampler.wrap_x === TextureWrap.Clamp ? 
                                      App.renderer.gl.CLAMP_TO_EDGE : App.renderer.gl.REPEAT)
      App.renderer.gl.texParameteri(App.renderer.gl.TEXTURE_2D, 
                                    App.renderer.gl.TEXTURE_WRAP_T, 
                                    this.m_sampler.wrap_y === TextureWrap.Clamp ? 
                                      App.renderer.gl.CLAMP_TO_EDGE : App.renderer.gl.REPEAT)

    }
  }
  

  constructor(width: number, height: number, format: TextureFormat) {
    super()

    this.m_id = 0
    this.m_width = width
    this.m_height = height
    this.m_sampler = new TextureSampler(TextureFilter.None, TextureWrap.None, TextureWrap.None)
    this.m_format = format
    this.framebuffer_parent = false

    this.m_gl_internal_format = App.renderer.gl.RED
    this.m_gl_format = App.renderer.gl.RED
    this.m_gl_type = App.renderer.gl.UNSIGNED_BYTE

    if (format === TextureFormat.RGBA) {
      this.m_gl_internal_format = App.renderer.gl.RGBA
      this.m_gl_format = App.renderer.gl.RGBA
      this.m_gl_type = App.renderer.gl.UNSIGNED_BYTE
    } else {
      Log.error(`Unsupported Texture format ${format}`)
    }


    this.m_id = App.renderer.gl.createTexture()!
    App.renderer.gl.activeTexture(App.renderer.gl.TEXTURE0)
    App.renderer.gl.bindTexture(App.renderer.gl.TEXTURE_2D, this.m_id)
    App.renderer.gl.texImage2D(App.renderer.gl.TEXTURE_2D, 0, this.m_gl_internal_format, width, height, 0, this.m_gl_format, this.m_gl_type, null)
  }

  get gl_id() { return this.m_id }

}

export class Renderer {

  static try_make_renderer = () => {
    return new Renderer()
  }

  origin_bottom_left = true

  get get_draw_size() { return undefined }

  gl!: WebGL2RenderingContext

  default_batcher_shader!: Shader

  create_shader(data: ShaderData) {
    return new WebGL_Shader(data)
  }

  create_target(width: number, height: number) {
    return new WebGL_Target(width, height, [TextureFormat.RGBA])
  }

  create_texture(width: number, height: number, format: TextureFormat) {
    return new WebGL_Texture(width, height, format)
  }

  create_mesh() {
    return new WebGL_Mesh()
  }

  update() {
  }

  init() {

    let context = App.platform.gl_context_create()

    if (context === null) {
      Log.error("Failed to create WebGL Context")
      return false
    }

    this.gl = context

    Log.info(`WebGL2`)


    this.gl.pixelStorei(this.gl.PACK_ALIGNMENT, 1)
    this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1)

    this.default_batcher_shader = Shader.create(webgl_batch_shader_data)

    return true
  }

  render(pass: DrawCall) {

    if (pass.target === App.backbuffer) {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
    } else if (pass.target) {
      let framebuffer = pass.target as WebGL_Target

      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer.gl_id)
    }


    let size = Vec2.make(pass.target.width, pass.target.height)
    let shader = pass.material.shader as WebGL_Shader
    let mesh = pass.mesh as WebGL_Mesh

    this.gl.useProgram(shader.gl_id)

    let texture_slot = 0
    let texture_ids: Array<number> = []
    let uniforms = shader.uniforms
    let data = pass.material.data
    let i_data = 0

    uniforms.forEach((uniform, i) => {
      let location = shader.uniform_locations[i]

      if (uniform.type === UniformType.Sampler2D) {
        return
      }

      if (uniform.type === UniformType.Texture2D) {
        for (let n = 0; n < uniform.array_length; n++) {
          let tex = pass.material.get_texture_at(texture_slot) as WebGL_Texture
          let sampler = pass.material.get_sampler_at(texture_slot)

          App.renderer.gl.activeTexture(App.renderer.gl.TEXTURE0 + texture_slot)

          if (!tex) {
            App.renderer.gl.bindTexture(App.renderer.gl.TEXTURE_2D, null)
          } else {
            tex.update_sampler(sampler)
            App.renderer.gl.bindTexture(App.renderer.gl.TEXTURE_2D, tex.gl_id)
          }

          texture_ids[n] = texture_slot
          texture_slot++
        }

          App.renderer.gl.uniform1iv(location, texture_ids)
      }

      if (uniform.type === UniformType.Float) {
        App.renderer.gl.uniform1fv(location, data.slice(i_data, i_data + 1 * uniform.array_length))
        i_data += 1 * uniform.array_length
      } else if (uniform.type === UniformType.Float2) {
        App.renderer.gl.uniform2fv(location, data.slice(i_data, i_data + 2 * uniform.array_length))
        i_data += 2 * uniform.array_length
      } else if (uniform.type === UniformType.Float3) {
        App.renderer.gl.uniform3fv(location, data.slice(i_data, i_data + 3 * uniform.array_length))
        i_data += 3 * uniform.array_length
      } else if (uniform.type === UniformType.Float4) {
        App.renderer.gl.uniform4fv(location, data.slice(i_data, i_data + 4 * uniform.array_length))
        i_data += 4 * uniform.array_length
      } else if (uniform.type === UniformType.Mat3x2) {
        App.renderer.gl.uniformMatrix3fv(location, false, data.slice(i_data, i_data + 9 * uniform.array_length))
        i_data += 9 * uniform.array_length
      } else if (uniform.type === UniformType.Mat4x4) {
        App.renderer.gl.uniformMatrix4fv(location, false, data.slice(i_data, i_data + 16 * uniform.array_length))
        i_data += 16 * uniform.array_length
      }

    })



    // blend
    {

      let color_op = gl_get_blend_func(pass.blend.color_op)
      let alpha_op = gl_get_blend_func(pass.blend.alpha_op)
      let color_src = gl_get_blend_factor(pass.blend.color_src)
      let color_dst = gl_get_blend_factor(pass.blend.color_dst)
      let alpha_src = gl_get_blend_factor(pass.blend.alpha_src)
      let alpha_dst = gl_get_blend_factor(pass.blend.alpha_dst)

      this.gl.enable(this.gl.BLEND)
      this.gl.blendEquationSeparate(color_op, alpha_op)
      this.gl.blendFuncSeparate(color_src, color_dst, alpha_src, alpha_dst)
    }

    // depth
    {
      this.gl.disable(this.gl.DEPTH_TEST)
    }


    // cull
    {
      this.gl.disable(this.gl.CULL_FACE)
    }


    // viewport
    {
      let viewport = pass.viewport
      viewport.y = size.y - viewport.y - viewport.h
      this.gl.viewport(viewport.x, viewport.y, viewport.w, viewport.h)
    }

    // scissor
    {
      if (!pass.has_scissor) {
        this.gl.disable(this.gl.SCISSOR_TEST)
      } else {
        let scissor = pass.scissor
        scissor.y = size.y - scissor.y - scissor.h

        if (scissor.w < 0) {
          scissor.w = 0
        }
        if (scissor.h < 0) {
          scissor.h = 0
        }

        this.gl.enable(this.gl.SCISSOR_TEST)
        this.gl.scissor(scissor.x, scissor.y, scissor.w, scissor.h)
      }
    }


    // draw
    {
      this.gl.bindVertexArray(mesh.gl_id)

      let index_format = mesh.gl_index_format
      let index_size = mesh.gl_index_size

      if (pass.instance_count > 0) {
        this.gl.drawElementsInstanced(this.gl.TRIANGLES,
                                      pass.index_count,
                                      index_format,
                                      index_size * pass.index_start,
                                      pass.instance_count)
      } else {
        this.gl.drawElements(
          this.gl.TRIANGLES,
          pass.index_count,
          index_format,
          index_size * pass.index_start)
      }
    }


    this.gl.bindVertexArray(null)
  }

  clear_backbuffer(color: Color, depth: number, stencil: number, framebuffer_id: WebGLFramebuffer| null = null) {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer_id)
    this.gl.disable(this.gl.SCISSOR_TEST)

    let clear = 0

    clear |= this.gl.COLOR_BUFFER_BIT
    this.gl.colorMask(true, true, true, true)
    this.gl.clearColor(color.r / 255, color.g / 255, color.b / 255, color.a / 255)

    this.gl.clear(clear)

  }


  before_render() {}
  after_render() {}

}


const gl_get_blend_func = (operation: BlendOp) => {
  switch (operation) {
    case BlendOp.Add:
      return App.renderer.gl.FUNC_ADD
    case BlendOp.Subtract:
      return App.renderer.gl.FUNC_SUBTRACT
    case BlendOp.Min:
      return App.renderer.gl.MIN
    case BlendOp.Max:
      return App.renderer.gl.MAX
    default:
      return App.renderer.gl.FUNC_ADD
  }
}


const gl_get_blend_factor = (factor: BlendFactor) => {
  switch (factor) {
    case BlendFactor.Zero:
      return App.renderer.gl.ZERO
    case BlendFactor.One:
      return App.renderer.gl.ONE
    case BlendFactor.SrcColor:
      return App.renderer.gl.SRC_COLOR
    case BlendFactor.OneMinusSrcColor:
      return App.renderer.gl.ONE_MINUS_SRC_COLOR
    case BlendFactor.DstColor:
      return App.renderer.gl.DST_COLOR
    case BlendFactor.OneMinusDstColor:
      return App.renderer.gl.ONE_MINUS_DST_COLOR
    case BlendFactor.SrcAlpha:
      return App.renderer.gl.SRC_ALPHA
    case BlendFactor.OneMinusSrcAlpha:
      return App.renderer.gl.ONE_MINUS_SRC_ALPHA
    case BlendFactor.DstAlpha:
      return App.renderer.gl.DST_ALPHA
    case BlendFactor.OneMinusDstAlpha:
      return App.renderer.gl.ONE_MINUS_DST_ALPHA
    case BlendFactor.ConstantColor:
      return App.renderer.gl.CONSTANT_COLOR
    case BlendFactor.ConstantAlpha:
      return App.renderer.gl.CONSTANT_ALPHA
    case BlendFactor.OneMinusConstantColor:
      return App.renderer.gl.ONE_MINUS_CONSTANT_COLOR
    case BlendFactor.OneMinusConstantAlpha:
      return App.renderer.gl.ONE_MINUS_CONSTANT_ALPHA
    default:
      return App.renderer.gl.ZERO
  }
}



