export class Color {

  static hex = (rgb: number) => new Color((rgb & 0xff0000) >> 16,
                                          (rgb & 0x00ff00) >> 8,
                                          (rgb & 0x0000ff),
                                          255)

  static white = new Color(255, 255, 255, 255)
  static black = new Color(0, 0, 0, 255)

  constructor(
    readonly r: number, 
    readonly g: number, 
    readonly b: number, 
    readonly a: number) {}
}
