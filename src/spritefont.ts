import { Rect, Vec2 } from './spatial'
import { Texture } from './graphics'
import { Subtexture } from './subtexture'
import { Font, FontJson } from './font2'
import { Codepoint, CharSet, CharRange, Kerning } from './font2'

export type Character = {
  codepoint: Codepoint,
  glyph: number,
  subtexture: Subtexture,
  advance: number,
  offset: Vec2
}


export class SpriteFont {


  static make = (font_json: FontJson, atlas: HTMLImageElement) => {
    let texture = Texture.from_image(atlas)


    let f = Font.make(font_json, texture)

    return SpriteFont.make_from_font(f, font_json.size)
  }

  static make_from_font = (font: Font, size: number) => {


    let charset = [{from: 32, to: 127}, { from: 161, to: 355 }]
    let res = new SpriteFont()

    res.rebuild(font, size, charset)

    return res

  }


  _characters!: Array<Character>
  _kerning!: Array<Kerning>
  _atlas!: Array<Texture>

  name!: string
  size: number = 0
  ascent: number = 0
  descent: number = 0
  line_gap: number = 0


  clear() {
    this._atlas = []
    this._characters = []
    this._kerning = []
    this.name = ''
  }


  get height() { return this.ascent - this.descent }
  get line_height() { return this.ascent -  this.descent + this.line_gap }

  get textures() { return this._atlas }

  width_of(text: string) {
    let width = 0
    let line_width = 0
    let last = 0

    for (let char of text) {
      if (char === '\n') {
        line_width = 0
      } else {
        line_width += this.get_character(char.charCodeAt(0)).advance

        if (last) {
          line_width += this.get_kerning(last, char.charCodeAt(0))
        }
        if (line_width > width) {
          width = line_width
        }
        last = char.charCodeAt(0)
      }
    }
    return width
  }

  width_of_line(text: string, start: number = 0) {
    if (start < 0) { return 0 }
    if (start >= text.length) { return 0 }

    let width = 0
    let last: Codepoint = 0

    for (let char of text) {
      if (char === '\n') {
        break
      }

      width += this.get_character(char.charCodeAt(0)).advance

      if (last) {
        width += this.get_kerning(last, char.charCodeAt(0))
      }
      last = char.charCodeAt(0)
    }
    return width
  }

  height_of(text: string) {
    if (text.length <= 0) {
      return 0
    }

    let height = this.line_height
    for (let char of text) {
      if (char === '\n') {
        height += this.line_height
      }
    }
    return height - this.line_gap
  }

  rebuild(font: Font, size: number, charset: CharSet) {
    this.clear()

    this.name = font.family_name
    this.ascent = font.ascent
    this.descent = font.descent
    this.line_gap = font.line_gap
    this.size = size

    for (let range of charset) {

      let { from, to } = range

      for (let i = from; i <= to; i++) {

        let glyph = font.get_glyph(i)
        if (glyph === undefined) {
          continue
        }


        let ch = font.get_character(glyph)


        let subtexture = font.get_subtexture(ch.glyph)

        let sfch = {
          glyph,
          codepoint: i,
          advance: ch.advance,
          offset: Vec2.make(ch.offset_x, ch.offset_y),
          subtexture
        }

        this._characters.push(sfch)
      }
    }

    for (let a of this._characters) {
      for (let b of this._characters) {
        let kerning_value = font.get_kerning(a.glyph, b.glyph)
        if (kerning_value !== undefined) {
          this.set_kerning(a.codepoint, b.codepoint, kerning_value)
        }
      }
    }
  }

  get_kerning(a: Codepoint, b: Codepoint) {
    let index = find_kerning_index(this._kerning, a, b)
    if (index !== -1) {
      return this._kerning[index].value
    }
    return 0
  }

  set_kerning(a: Codepoint, b: Codepoint, value: number) {

    let index = find_kerning_index(this._kerning, a, b)

    if (index !== -1) {
      this._kerning[index].value = value
    } else {
      this._kerning.push({
        a, b, value
      })
    }
  }

  get_character(codepoint: Codepoint) {
    let index = find_character_index(this._characters, codepoint)
    if (index !== -1) {
      return this._characters[index]
    } 
    return this._characters[0]
  }

}

function find_character_index(items: Array<Character>, codepoint: Codepoint) {

  let lower = 0
  let higher = items.length - 1

  while (lower <= higher) {
    let mid = Math.round((higher + lower) / 2)
    if (items[mid].codepoint === codepoint) {
      return mid
    }
    if (items[mid].codepoint < codepoint) {
      lower = mid + 1
    } else {
      higher = mid - 1
    }
  }
  return -1
}

function find_kerning_index(items: Array<Kerning>, a: Codepoint, b: Codepoint) {
  let lower = 0
  let higher = items.length - 1
  while (lower <= higher) {
    let mid = Math.round((higher + lower) / 2)

    if (items[mid].a === a && items[mid].b === b) {
      return mid
    }

    if (items[mid].a === a) {
      if (items[mid].b < b) {
        lower = mid + 1
      } else {
        higher = mid - 1
      }
    } else if (items[mid].a < a) {
      lower = mid + 1
    } else {
      higher = mid - 1
    }
  }
  return -1
}
