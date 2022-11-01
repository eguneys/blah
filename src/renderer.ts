import { Vec2 } from './spatial'
import { Color } from './color'
import { TextureSampler, TextureFilter, TextureWrap, TextureFormat, Mesh, Shader, Texture, DrawCall, Target } from './graphics'
import { App } from './app'
import { Log } from './common'
import default_vertex_shader from './default.vert'
import default_fragment_shader from './default.frag'

export type ShaderData = [string, string]
const webgl_batch_shader_data: ShaderData = [default_vertex_shader, default_fragment_shader]

export class WebGL_Shader extends Shader {
  m_id!: number

  get gl_id() { return this.m_id } 

  constructor(readonly data: ShaderData) { super() }
}

export class WebGL_Mesh extends Mesh {
  m_id!: number
  m_index_format!: number
  m_index_size!: number

  get gl_id() { return this.m_id }

  get gl_index_format() { return this.m_index_format }
  get gl_index_size() { return this.m_index_size } 
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
      if (__IS_DEV__) {
        Log.error(`Unsupported Texture format ${format}`)
      }
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

  update() {
  }

  init() {

    let context = App.platform.gl_context_create()

    if (context === null) {
      if (__IS_DEV__) {
        Log.error("Failed to create WebGL Context")
      }
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

    /*
    let texture_slot = 0
    let texture_ids = []
    let uniforms = shader.uniforms
    let data = pass.material.data

    uniforms.forEach(uniform => {

    })
   */



    // blend
    {
      this.gl.enable(this.gl.BLEND)
    
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


    this.gl.bindVertexArray(0)
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
