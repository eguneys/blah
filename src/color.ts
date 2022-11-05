export class Color {

  static hex = (rgb: number) => new Color((rgb & 0xff0000) >> 16,
                                          (rgb & 0x00ff00) >> 8,
                                          (rgb & 0x0000ff),
                                          255)

  static white = new Color(255, 255, 255, 255)
  static black = new Color(0, 0, 0, 255)
  static red = new Color(255, 0, 0, 255)


  get rgb() {
    return (this.r << 16) | (this.g << 8) | this.b
  }

  constructor(
    readonly r: number, 
    readonly g: number, 
    readonly b: number, 
    readonly a: number) {}
}
