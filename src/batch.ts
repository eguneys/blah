import { Rect, Vec2, Mat3x2, Mat4x4 } from './spatial'
import { Color } from './color'
import { Mesh, Texture, Target, TextureSampler, Material, DrawCall } from './graphics'
import { Subtexture } from './subtexture'
import { SpriteFont } from './spritefont'

const texture_uniform = 'u_texture'
const sampler_uniform = 'u_texture_sampler'
const matrix_uniform = 'u_matrix'


class _Batch {

  m_default_material!: Material
  m_mesh!: Mesh
  m_matrix: Mat3x2 = Mat3x2.identity
  m_tex_mult = 255
  m_text_wash = 0
  m_batch!: DrawBatch
  m_vertices!: Array<Vertex>
  m_indices!: Array<number>
  m_matrix_stack!: Array<Mat3x2>
  m_scissor_stack!: Array<Rect>
  m_material_stack!: Array<Material>
  m_batches!: Array<DrawBatch>
  m_batch_insert = 0


  render_single_batch(pass: DrawCall, b: DrawBatch, matrix: Mat4x4) {}


  integerize: boolean = false
  default_sampler!: TextureSampler

  push_matrix(matrix: Mat3x2, absolute: boolean = false) {
  }

  pop_matrix() {}

  peek_matrix() {}

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

  set_texture(texture: Texture) {}

  set_sampler(sampler: TextureSampler) {}

  render(target: Target, matrix: Mat4x4) {}


  clear() {}

  line(from: Vec2, to: Vec2, t: number, color: Color) {}

  rect(rect: Rect, color: Color) {}
  rect_line(rect: Rect, t: number, color: Color) {}

  circle(center: Vec2, radius: number, steps: number, color: Color) {}
  circle_line(center: Vec2, radius: number, t: number, steps: number, color: Color) {}


  quad(pos0: Vec2, pos1: Vec2, pos2: Vec2, pos3: Vec2, color: Color) {}
  quad_line(a: Vec2, b: Vec2, c: Vec2, d: Vec2, t: number, color: Color) {}


  tex(texture: Texture, position: Vec2 = Vec2.zero, color: Color = Color.white) {
  }
  tex_o(texture: Texture, position: Vec2, origin: Vec2, scale: Vec2, rotation: number, color: Color) {
  }
  tex_c(texture: Texture, clip: Rect, position: Vec2, origin: Vec2, scale: Vec2, rotation: number, color: Color) {
  }


  stex(subtexture: Subtexture, position: Vec2 = Vec2.zero, color: Color = Color.white) {
  }
  stex_o(subtexture: Subtexture, position: Vec2, origin: Vec2, scale: Vec2, rotation: number, color: Color) {
  }
  stex_c(subtexture: Subtexture, clip: Rect, position: Vec2, origin: Vec2, scale: Vec2, rotation: number, color: Color) {
  }


  str(font: SpriteFont, text: string, pos: Vec2, color: Color) {}
  str_j(font: SpriteFont, text: string, pos: Vec2, justify: Vec2, size: number, color: Color) {}

}


export const batch = new _Batch()

class Vertex {
  constructor(readonly pos: Vec2,
    readonly tex: Vec2,
    readonly col: Color,
    readonly mult: number,
    readonly wash: number,
    readonly fill: number,
    readonly pad: number) {}
}


class DrawBatch {


  constructor(
    readonly layer: number,
    readonly offset: number,
    readonly elements: number,
    readonly material: Material,
    readonly texture: Texture,
    readonly sampler: TextureSampler,
    readonly scissor: Rect = Rect.make(0, 0, -1, -1)) {}
}
