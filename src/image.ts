import { Color } from './color'

export class Image {

  static make = (_: HTMLImageElement) => {

    let canvas = document.createElement('canvas')
    let context = canvas.getContext('2d')!
    canvas.width = _.width
    canvas.height = _.height
    context.drawImage(_, 0, 0)
    return new Image(context.getImageData(0, 0, _.width, _.height))
  }

  pixels: Array<Color>

  constructor(readonly data: ImageData) {
  
    this.pixels = []

    for (let i = 0; i < data.data.length; i += 4) {

      this.pixels.push(new Color(data.data[i],
                                 data.data[i + 1],
                                 data.data[i + 2],
                                 data.data[i + 3]))
    }
  }

}
