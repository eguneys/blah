import { App } from './app'
import { Rect, Vec2, Mat3x2, Mat4x4 } from './spatial'
import { Color } from './color'
import { VertexFormat, VertexAttribute, VertexType } from './graphics'
import { Mesh, Texture, Target, TextureSampler, TextureWrap, TextureFilter, Material, DrawCall } from './graphics'
import { Subtexture } from './subtexture'
import { SpriteFont } from './spritefont'

const float32_data = (a: number, b: number, c: number, d: number) => {
  return (a << 24) | (b << 16) | (c << 8) | (d)
}

const texture_uniform = 'u_texture'
const sampler_uniform = 'u_texture_sampler'
const matrix_uniform = 'u_matrix'

const format = new VertexFormat([

  VertexAttribute.make(0, VertexType.Float2, false),
  VertexAttribute.make(1, VertexType.Float2, false),
  VertexAttribute.make(2, VertexType.UByte4, true),
  VertexAttribute.make(3, VertexType.UByte4, true),
])

class DrawBatch {
    layer: number = 0
    offset: number = 0
    elements: number = 0
    material?: Material
    texture?: Texture
    sampler: TextureSampler = TextureSampler.get_default
    scissor: Rect = Rect.make(0, 0, -1, -1)
    flip_vertically: boolean = false
}

export class Batch {

  m_default_material!: Material
  m_mesh?: Mesh
  m_batch: DrawBatch = new DrawBatch()
  m_matrix: Mat3x2 = Mat3x2.identity
  m_tex_mult = 255
  m_tex_wash = 0
  m_vertices: Array<Vertex> = []
  m_indices: Array<number> = []
  m_matrix_stack: Array<Mat3x2> = []
  m_scissor_stack: Array<Rect> = []
  m_material_stack: Array<Material> = []
  m_batches: Array<DrawBatch> = []
  m_batch_insert = 0




  integerize: boolean = false
  default_sampler: TextureSampler = TextureSampler.get_default

  push_matrix(matrix: Mat3x2, absolute: boolean = false) {
    this.m_matrix_stack.push(this.m_matrix)
    if (absolute) {
      this.m_matrix = matrix
    } else {
      this.m_matrix = matrix.mul(this.m_matrix)
    }
  }

  pop_matrix() {
    let was = this.m_matrix
    this.m_matrix = this.m_matrix_stack.pop()!
    return was
  }

  peek_matrix() {
    return this.m_matrix
  }

  push_scissor(scissor: Rect) {}

  pop_scissor() {}

  peek_scissor() {}

  /*
  push_blend(blend: BlendMode) {}

  pop_blend() {}

  peek_blend() {}
  */

  push_material(material: Material) {}

  pop_material() {}

  peek_material() {}

  set_texture(texture: Texture) {
  
    if (this.m_batch.elements > 0 && texture !== this.m_batch.texture && !!this.m_batch.texture) {
      this.INSERT_BATCH()
    }

    if (this.m_batch.texture !== texture) {
      this.m_batch.texture = texture
      this.m_batch.flip_vertically = App.renderer.origin_bottom_left && texture && texture.is_framebuffer
    }
  }

  set_sampler(sampler: TextureSampler) {
  
    console.log(sampler)
  }

  render(target: Target = App.backbuffer) {
    
    this.render_with_m(target, Mat4x4.create_ortho_offcenter(0, target.width, target.height, 0, 0.01, 1000))
  }

  render_with_m(target: Target, matrix: Mat4x4) {
  
    if (this.m_batches.length <= 0 && this.m_batch.elements <= 0 || this.m_indices.length <= 0) {
      return
    }
  
    {
      if (!this.m_mesh) {
        this.m_mesh = Mesh.create()
      }

      if (!this.m_default_material) {
        this.m_default_material = Material.create(App.renderer.default_batcher_shader)
      }
    }


    this.m_mesh.index_data(this.m_indices)
    this.m_mesh.vertex_data(format, this.m_vertices)


    let pass = new DrawCall()
    pass.target = target
    pass.mesh = this.m_mesh
    pass.has_viewport = false
    pass.viewport = Rect.make(0, 0, 0, 0)
    pass.instance_count = 0

    this.m_batches.forEach(batch => {
    })


    if (this.m_batch_insert === this.m_batches.length && this.m_batch.elements > 0) {
      this.render_single_batch(pass, this.m_batch, matrix)
    }
  }


  render_single_batch(pass: DrawCall, b: DrawBatch, matrix: Mat4x4) { 
  
    if (!b.material) {
      pass.material = this.m_default_material
    } else {
      pass.material = b.material
    }

    if (pass.material.has_value(texture_uniform)) {
      pass.material.set_texture(texture_uniform, b.texture)
    } else {
      pass.material.set_texture_at_location(0, b.texture)
    }

    if (pass.material.has_value(sampler_uniform)) {
      pass.material.set_sampler(sampler_uniform, b.sampler)
    } else {
      pass.material.set_sampler_at_location(0, b.sampler)
    }

    pass.material.set_matrix(matrix_uniform, matrix)

    pass.has_scissor = b.scissor.w >= 0 && b.scissor.h >= 0
    pass.scissor = b.scissor
    pass.index_start = b.offset * 3
    pass.index_count = b.elements * 3


    pass.perform()
  }

  clear() {
  
    this.m_matrix = Mat3x2.identity
    this.m_tex_mult = 255
    this.m_tex_wash = 0

    this.m_vertices = []
    this.m_indices = []

    this.m_batch.layer = 0
    this.m_batch.elements = 0
    this.m_batch.offset = 0
    this.m_batch.material = undefined
    this.m_batch.texture = undefined
    this.m_batch.sampler = this.default_sampler
    this.m_batch.scissor.w = this.m_batch.scissor.h = -1
    this.m_batch.flip_vertically = false
    
    this.m_matrix_stack = []
    this.m_scissor_stack = []
    this.m_material_stack = []
    this.m_batches = []

    this.m_batch_insert = 0
  }

  line(from: Vec2, to: Vec2, t: number, color: Color) {}

  rect(rect: Rect, color: Color) {
    this.PUSH_QUAD(
      rect.x, rect.y,
      rect.x + rect.w, rect.y,
      rect.x + rect.w, rect.y + rect.h,
      rect.x, rect.y + rect.h,
      0, 0, 0, 0, 0, 0, 0, 0,
      color, color, color, color,
      0, 0, 255)
  }

  rect_line(rect: Rect, t: number, color: Color) {
    if (t >= rect.w || t >= rect.h) {
      this.rect(rect, color)
    } else {
      this.PUSH_QUAD(
        rect.x, rect.y,
        rect.x + rect.w - t, rect.y,
        rect.x + rect.w - t, rect.y + t,
        rect.x, rect.y + t,
        0, 0, 0, 0, 0, 0, 0, 0,
        color, color, color, color,
        0, 0, 255)

      this.PUSH_QUAD(
        rect.x + rect.w - t, rect.y,
        rect.x + rect.w, rect.y,
        rect.x + rect.w, rect.y + rect.h - t,
        rect.x + rect.w - t, rect.y + rect.h - t,
        0, 0, 0, 0, 0, 0, 0, 0,
        color, color, color, color,
        0, 0, 255)

      this.PUSH_QUAD(
        rect.x + t, rect.y + rect.h - t,
        rect.x + rect.w, rect.y + rect.h - t,
        rect.x + rect.w, rect.y + rect.h,
        rect.x, rect.y + rect.h,
        0, 0, 0, 0, 0, 0, 0, 0,
        color, color, color, color,
        0, 0, 255)

      this.PUSH_QUAD(
        rect.x, rect.y + t,
        rect.x + t, rect.y + t,
        rect.x + t, rect.y + rect.h - t,
        rect.x, rect.y + rect.h,
        0, 0, 0, 0, 0, 0, 0, 0,
        color, color, color, color,
        0, 0, 255)
    }
  }

  circle(center: Vec2, radius: number, steps: number, color: Color) {}
  circle_line(center: Vec2, radius: number, t: number, steps: number, color: Color) {}


  quad(pos0: Vec2, pos1: Vec2, pos2: Vec2, pos3: Vec2, color: Color) {}
  quad_line(a: Vec2, b: Vec2, c: Vec2, d: Vec2, t: number, color: Color) {}


  tex(texture: Texture, pos: Vec2 = Vec2.zero, color: Color = Color.white) {
    this.set_texture(texture)

    let w = texture.width
    let h = texture.height

    let { m_tex_mult, m_tex_wash } = this

    this.PUSH_QUAD(
      pos.x, pos.y, pos.x + w, pos.y, pos.x + w, pos.y + h, pos.x, pos.y + h,
      0, 0, 1, 0, 1, 1, 0, 1,
      color, color, color, color,
      m_tex_mult, m_tex_wash, 0)
  }
  tex_o(texture: Texture, position: Vec2, origin: Vec2, scale: Vec2, rotation: number, color: Color) {
  }
  tex_c(texture: Texture, clip: Rect, position: Vec2, origin: Vec2, scale: Vec2, rotation: number, color: Color) {
  }


  stex(sub: Subtexture, pos: Vec2 = Vec2.zero, color: Color = Color.white) {

    let { m_tex_mult, m_tex_wash } = this

    this.set_texture(sub.texture)
    this.PUSH_QUAD(
      pos.x + sub.draw_coords[0].x, pos.y + sub.draw_coords[0].y,
      pos.x + sub.draw_coords[1].x, pos.y + sub.draw_coords[1].y,
      pos.x + sub.draw_coords[2].x, pos.y + sub.draw_coords[2].y,
      pos.x + sub.draw_coords[3].x, pos.y + sub.draw_coords[3].y,
      sub.tex_coords[0].x, sub.tex_coords[0].y,
      sub.tex_coords[1].x, sub.tex_coords[1].y,
      sub.tex_coords[2].x, sub.tex_coords[2].y,
      sub.tex_coords[3].x, sub.tex_coords[3].y,
      color, color, color, color,
      m_tex_mult, m_tex_wash, 0)
  }
  stex_o(subtexture: Subtexture, position: Vec2, origin: Vec2, scale: Vec2, rotation: number, color: Color) {
  }
  stex_c(subtexture: Subtexture, clip: Rect, position: Vec2, origin: Vec2, scale: Vec2, rotation: number, color: Color) {
  }


  str(font: SpriteFont, text: string, pos: Vec2, color: Color) {}
  str_j(font: SpriteFont, text: string, pos: Vec2, justify: Vec2, size: number, color: Color) {}

  INSERT_BATCH() {
    this.m_batches.push(this.m_batch)
    this.m_batch.offset += this.m_batch.elements
    this.m_batch.elements = 0
  }

  PUSH_QUAD(px0: number, py0: number, 
            px1: number, py1: number, 
            px2: number, py2: number, 
            px3: number, py3: number, 
            tx0: number, ty0: number, 
            tx1: number, ty1: number, 
            tx2: number, ty2: number, 
            tx3: number, ty3: number, 
            col0: Color, col1: Color, col2: Color, col3: Color, 
            mult: number, fill: number, wash: number) {
              this.m_batch.elements += 2
              this.m_indices.push(this.m_vertices.length + 0)
              this.m_indices.push(this.m_vertices.length + 1)
              this.m_indices.push(this.m_vertices.length + 2)
              this.m_indices.push(this.m_vertices.length + 0)
              this.m_indices.push(this.m_vertices.length + 2)
              this.m_indices.push(this.m_vertices.length + 3)

              this.MAKE_VERTEX(px0, py0, tx0, ty0, col0, mult, fill, wash)
              this.MAKE_VERTEX(px1, py1, tx1, ty1, col1, mult, fill, wash)
              this.MAKE_VERTEX(px2, py2, tx2, ty2, col2, mult, fill, wash)
              this.MAKE_VERTEX(px3, py3, tx3, ty3, col3, mult, fill, wash)
  }


  MAKE_VERTEX(px: number, py: number, tx: number, ty: number, c: Color, m: number, f: number, w: number) {
    let mat = this.m_matrix

    this.m_vertices.push(new Vertex(
      Vec2.make(px * mat.m11 + py * mat.m21 + mat.m31,
                px * mat.m12 + py * mat.m22 + mat.m32),
      Vec2.make(tx, this.m_batch.flip_vertically ? 1 - ty : ty),
      c,
      m,
      w,
      f))
  }
}


export const batch = new Batch()

export class Vertex {

  push_to(data: DataView, offset: number) {
    let { pos, tex, col, mult, wash, fill } = this

    data.setFloat32(offset + 0, pos.x, true)
    data.setFloat32(offset + 4, pos.y, true)
    data.setFloat32(offset + 8, tex.x, true)
    data.setFloat32(offset + 12, tex.y, true)
    data.setUint8(offset + 16, col.r)
    data.setUint8(offset + 17, col.g)
    data.setUint8(offset + 18, col.b)
    data.setUint8(offset + 19, col.a)
    data.setUint8(offset + 20, mult)
    data.setUint8(offset + 21, wash)
    data.setUint8(offset + 22, fill)
    return offset + 24
  }

  constructor(readonly pos: Vec2,
    readonly tex: Vec2,
    readonly col: Color,
    readonly mult: number,
    readonly wash: number,
    readonly fill: number) {}
}
