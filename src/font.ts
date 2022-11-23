import { Rect } from './spatial'
import { Texture } from './graphics'
import { Subtexture } from './subtexture'
import { Codepoint } from './spritefont'

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


export class Font {


  static create = (json: FontJsonExport) => {
    let res = new Font(json)

    res._family_name = FontJsonExport.get_font_name(json, 1);
    res._style_name = FontJsonExport.get_font_name(json, 2);
    [res._ascent, res._descent, res._line_gap] = FontJsonExport.getFontVMetrics(json)

    return res

  }


  get family_name() {
    return this._family_name
  }

  get style_name() {
    return this._style_name
  }

  get ascent() {
    return this._ascent
  }

  get descent() {
    return this._descent
  }

  get line_gap() {
    return this._line_gap
  }

  get height() {
    return this._ascent - this._descent
  }

  get line_height() {
    return this._ascent - this._descent + this._line_gap
  }

  get_glyph(codepoint: Codepoint) {
  
    return FontJsonExport.findGlyphIndex(this.json, codepoint)
  }

  get_scale(size: number) {
    return FontJsonExport.scaleformappingemtopixels(this.json, size)
  }

  get_kerning(glyph1: number, glyph2: number, scale: number) {
    return FontJsonExport.getglyphkernadvance(this.json, glyph1, glyph2) * scale
  }


  get_character(glyph: number, scale: number) {
    let font = this.json
  
    let ch: Character

    let advance, offsetX, x0, y0, x1, y1;

    [advance, offsetX] = FontJsonExport.getglyphHMetrics(font, glyph);

    [x0, y0, x1, y1] = FontJsonExport.getGlyphBitmapBox(font, glyph, scale);


    let w = (x1 - x0),
      h = (y1 - y0)

    ch = {
      glyph,
      width: w,
      height: h,
      advance: advance * scale,
      offset_x: offsetX * scale,
      offset_y: y0,
      scale,
      has_glyph: (w > 0 && h > 0 && FontJsonExport.isGlyphEmpty(font, glyph) === 0)
    }


    return ch

  }


  get_subtexture(codepoint: Codepoint) {
    let { packed, frame } = FontJsonExport.get_subtexture(this.json, codepoint)
    return Subtexture.make(this.json.atlas, 
                           Rect.make(packed.x, packed.y, packed.w, packed.h), 
                           Rect.make(frame.x, frame.y, frame.w, frame.h))
  }

  _family_name!: string
  _style_name!: string
  _ascent!: number
  _descent!: number
  _line_gap!: number

  constructor(readonly json: FontJsonExport) {}

}


export class FontJsonExport {

  static get_font_name = (json: FontJsonExport, n: number) => {
    return ''
  }

  static getFontVMetrics = (json: FontJsonExport) => {
    return [0, 0, 0, 0]
  }

  static findGlyphIndex = (json: FontJsonExport, codepoint: Codepoint) => {
    return 0
  }

  static scaleformappingemtopixels = (json: FontJsonExport, size: number) => {
    return json.scaleformappingemtopixels
  }

  static getglyphkernadvance = (json: FontJsonExport, glyph1: number, glyph2: number) => {
    return 0
  }

  static getglyphHMetrics = (json: FontJsonExport, glyph: number) => {
    return [0, 0]
  }

  static getGlyphBitmapBox = (json: FontJsonExport, glyph: number, scale: number) => {
    return [0, 0, 0, 0]
  }

  static isGlyphEmpty = (json: FontJsonExport, glyph: number) => {
    return 0
  }

  static get_subtexture = (json: FontJsonExport, codepoint: Codepoint) => {
    return json.subtextures[codepoint]
  }

  scaleformappingemtopixels!: number
  subtextures!: Array<{ frame: XYWH, packed: XYWH }>
  atlas!: Texture

}

type XYWH = { x: number, y: number, w: number, h: number }
