export class Color {
  static white = new Color(255, 255, 255, 255)
  static black = new Color(0, 0, 0, 255)

  constructor(
    readonly r: number, 
    readonly g: number, 
    readonly b: number, 
    readonly a: number) {}
}
