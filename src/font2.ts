import { Rect } from './spatial'
import { Texture } from './graphics'
import { Subtexture } from './subtexture'

export type Character = {
  glyph: number,
  width: number,
  height: number,
  advance: number,
  offset_x: number,
  offset_y: number,
  scale: number,
  has_glyph: boolean
}


export type Codepoint = number

export type CharSet = Array<CharRange>

export type CharRange = {
  from: Codepoint,
  to: Codepoint
}


export type Kerning = {
  a: Codepoint,
  b: Codepoint,
  value: number
}


export type XYWH = { x: number, y: number, w: number, h: number }

export type FontJsonKerning = {
  glyph1: number,
  glyph2: number,
  kerning: number
}

export type FontJsonMeta = {
  ascent: number,
  descent: number,
  line_gap: number,
  name: string,
  scale: number
}

export type FontJsonChar = {
  glyph: number,
  width: number,
  height: number,
  advance: number,
  has_glyph: number,
  offset_x: number,
  offset_y: number,
  scale: number
}

export type FontJsonGlyph = {
  glyph: number,
  codepoint: number
}

export type FontJsonColor = {
  glyph: number,
  frame: XYWH,
  packed: XYWH
}

export type FontJson = {
  kernings: Array<FontJsonKerning>,
  meta: FontJsonMeta,
  chars: Array<FontJsonChar>,
  glyphs: Array<FontJsonGlyph>,
  colors: Array<FontJsonColor>
}


export class Font {

  static make = (json: FontJson, texture: Texture) => {


    let res = new Font()

    res.scale = json.meta.scale

    let characters = new Map<number, Character>(json.chars.map(_ => [
      _.glyph,
      {
        ..._,
        has_glyph: _.has_glyph !== 0,
      }
    ]))

    let glyphs = new Map<number, number>(json.glyphs.map(_ => [_.codepoint, _.glyph]))

    let kernings = new Map<number, Map<number, number>>()


    json.kernings.forEach(_ => {
      if (!kernings.get(_.glyph1)) {
        kernings.set(_.glyph1, new Map())
      }
      let __ = kernings.get(_.glyph1)!

      __.set(_.glyph2, _.kerning)
    })

    let packs = new Map<number, { packed: XYWH, frame: XYWH}>(json.colors.map(_ => [

      _.glyph,
      {
        frame: _.frame,
        packed: _.packed
      }
    ]))


    res._descent = json.meta.descent
    res._ascent = json.meta.ascent
    res._line_gap = json.meta.line_gap

    res.family_name = json.meta.name

    res.texture = texture

    res.packs = packs
    res.kernings = kernings
    res.glyphs = glyphs
    res.characters = characters

    res.scale = json.meta.scale

    return res

  }

  scale!: number
  characters!: Map<number, Character>
  glyphs!: Map<number, number>
  kernings!: Map<number, Map<number, number>>
  packs!: Map<number, {packed: XYWH, frame: XYWH}>

  _descent!: number
  _ascent!: number
  _line_gap!: number

  family_name!: string

  texture!: Texture

  get ascent() {
    return this._ascent * this.scale
  }

  get descent() {
    return this._descent * this.scale
  }

  get line_gap() {
    return this._line_gap * this.scale
  }

  get_character(glyph: number) {
    return this.characters.get(glyph)!
  }

  get_kerning(glyph1: number, glyph2: number) {
    return this.kernings.get(glyph1)?.get(glyph2)
  }

  get_glyph(codepoint: Codepoint) {
    return this.glyphs.get(codepoint)
  }

  get_subtexture(glyph: number) {
    let _ = this.packs.get(glyph)
    if (!_) {
      return new Subtexture(this.texture, Rect.make(0, 0, 0, 0), Rect.make(0, 0, 0, 0))
    }
    let { packed, frame } = _
    return new Subtexture(this.texture, 
                          Rect.make(packed.x, packed.y, packed.w, packed.h),
                          Rect.make(frame.x, frame.y, frame.w, frame.h))
  }

}
