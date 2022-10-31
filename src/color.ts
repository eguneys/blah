export class Color {
  static white = new Color(0, 0, 0, 1)

  constructor(
    readonly r: number, 
    readonly g: number, 
    readonly b: number, 
    readonly a: number) {}
}
