export const epsilon = 0.000001
export const b0001 = 1
export const b0010 = 4
export const b0100 = 8
export const b1000 = 16


export class Vec2 {

  static copy = (v: Vec2) => new Vec2(v.x, v.y)
  static make = (x: number, y: number) => new Vec2(x, y)

  static dot = (a: Vec2, b: Vec2) => a.x * b.x + a.y * b.y
  static transform = (v: Vec2, m: Mat3x2) => 
  new Vec2((v.x * m.m11) + (v.y * m.m21) + m.m31,
           (v.x * m.m12) + (v.y * m.m22) + m.m32)
  static transform_normal = (v: Vec2, m: Mat3x2) =>
  new Vec2((v.x * m.m11) + (v.y * m.m21),
           (v.x * m.m12) + (v.y * m.m22))
  static from_angle = (radians: number, length = 1) =>
  new Vec2(Math.cos(radians) * length,
           Math.sin(radians) * length)
  static approach = (value: Vec2, target: Vec2, delta: number) =>
  ((value.sub(target)).length_squared <= delta * delta) ? target : 
    value.add(target.sub(value).normal).scale(delta)

  static lerp = (a: Vec2, b: Vec2, t: number) => {
    if (t === 0) {
      return a
    } else if (t === 1) {
      return b
    } else {
      return a.add(b.sub(a).scale(t))
    }
  }

  static lerp_bezier = (a: Vec2, b: Vec2, end: Vec2, t: number) => {
    let { lerp } = Vec2
    return lerp(lerp(a, b, t), lerp(b, end, t), t)
  }

  static reflect = (v: Vec2, normal: Vec2) => {
    let dot = v.x * normal.x + v.y * normal.y
    return new Vec2(v.x - 2 * dot * normal.x,
                    v.y - 2 * dot * normal.y)
  }
  static min = (a: Vec2, b: Vec2) => new Vec2(Math.min(a.x, b.x), Math.min(a.y, b.y))
  static max = (a: Vec2, b: Vec2) => new Vec2(Math.max(a.x, b.x), Math.max(a.y, b.y))


  static get unit_x() { return Vec2.make(1, 0) }
  static get unit_y() { return Vec2.make(0, 1) }
  static get right() { return Vec2.make(1, 0) }
  static get up() { return Vec2.make(0, -1) }
  static get down() { return Vec2.make(0, 1) }
  static get left() { return Vec2.make(-1, 0) }
  static get zero() { return Vec2.make(0, 0) }
  static get one() { return Vec2.make(1, 1) }


  add(v: Vec2) {
    return new Vec2(this.x + v.x, this.y + v.y)
  }

  sub(v: Vec2) {
    return new Vec2(this.x - v.x, this.y - v.y)
  }

  mul(v: Vec2) {
    return new Vec2(this.x * v.x, this.y * v.y)
  }

  scale(n: number) {
    return new Vec2(this.x * n, this.y * n)
  }

  add_in(v: Vec2) {
    this.x += v.x
    this.y += v.y
    return this
  }

  sub_in(v: Vec2) {
    this.x -= v.x
    this.y -= v.y
    return this
  }

  mul_in(v: Vec2) {
    this.x *= v.x
    this.y *= v.y
    return this
  }

  scale_in(n: number) {
    this.x *= n
    this.y *= n
    return this
  }

  set_in(v: Vec2) {
    this.x = v.x
    this.y = v.y
  }

  equals(v: Vec2) {
    return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon
  }

  get negate() {
    return new Vec2(-this.x, -this.y)
  }

  get abs() {
    return new Vec2(Math.abs(this.x), Math.abs(this.y))
  }

  get normal() {
    let len = Math.sqrt(this.x * this.x + this.y * this.y)
    if (len <= 0) {
      return new Vec2(0, 0)
    }
    return new Vec2(this.x / len, this.y / len)
  }

  get turn_right() {
    return new Vec2(-this.y, this.x)
  }

  get turn_left() {
    return new Vec2(this.y, -this.x)
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  get length_squared() {
    return this.x * this.x + this.y * this.y
  }

  get angle() {
    return Math.atan2(this.y, this.x)
  }

  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

}


export class Vec3 {


  static make = (x: number, y: number, z: number) => new Vec3(x, y, z)

  static dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z
  static cross = (a: Vec3, b: Vec3) => new Vec3(a.y * b.z - a.z * b.y,
                                                a.z * b.x - a.x * b.z,
                                                a.x * b.y - a.y * b.x)
                    
  add(v: Vec3) {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + this.z)
  }

  sub(v: Vec3) {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - this.z)
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  }

  get normal() {
    let { length } = this
    return new Vec3(this.x / length, this.y / length, this.z / length)
  }

  x: number
  y: number
  z: number

  constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }
}

export class Vec4 {

  static make = (x: number, y: number, z: number, w: number) => new Vec4(x, y, z, w)

  x: number
  y: number
  z: number
  w: number

  constructor(x: number, y: number, z: number, w: number) {
    this.x = x
    this.y = y
    this.z = z
    this.w = w
  }
}

export class Rect {

  static make = (x: number = 0, y: number = 0, w: number = 0, h: number = 0) => new Rect(x, y, w, h)


  add(v: Vec2) {
    return new Rect(this.x + v.x, this.y + v.y, this.w, this.h)
  }
  sub(v: Vec2) {
    return new Rect(this.x - v.x, this.y - v.y, this.w, this.h)
  }

  add_in(v: Vec2) {
    this.x += v.x
    this.y += v.y
    return this
  }
  sub_in(v: Vec2) {
    this.x -= v.x
    this.y -= v.y
    return this
  }

  equals(rhs: Rect) {
    return Math.abs(this.x - rhs.x) < epsilon && Math.abs(this.y - rhs.y) < epsilon && Math.abs(this.w - rhs.w) < epsilon && Math.abs(this.h - rhs.h) < epsilon
  }

  get left() { return this.x }
  get right() { return this.x + this.w }
  get top() { return this.y }
  get bottom() { return this.y + this.h }
  get center() { return new Vec2(this.center_x, this.center_y) }
  get center_x() { return this.x + this.w / 2 }
  get center_y() { return this.y + this.h / 2 }
  get top_left() { return new Vec2(this.x, this.y) }
  get top_right() { return new Vec2(this.x + this.w, this.y) }
  get bottom_right() { return new Vec2(this.w + this.w, this.y + this.h) }
  get bottom_left() { return new Vec2(this.x, this.y + this.h) }
  get center_left() { return new Vec2(this.x, this.center_y) }
  get center_right() { return new Vec2(this.x + this.w, this.center_y) }
  get middle_top() { return new Vec2(this.center_x, this.y) }
  get middle_bottom() { return new Vec2(this.center_x, this.y + this.h) }
  get left_line() { return Line.make_x(this.left, this.top, this.left, this.bottom) }
  get right_line() { return Line.make_x(this.right, this.top, this.right, this.bottom) }
  get top_line() { return Line.make_x(this.left, this.top, this.right, this.top) }
  get bottom_line() { return Line.make_x(this.left, this.bottom, this.right, this.bottom) }


  contains_point(pt: Vec2) {
    return pt.x >= this.x && pt.x < this.x + this.w && pt.y >= this.y && pt.y < this.y + this.h
  }

  contains_rect(r: Rect) {
    return r.x >= this.x && r.x + r.w < this.x + this.w && r.y >= this.y && r.y + r.h < this.y + this.h
  }

  overlaps(r: Rect) {
    return this.x + this.w >= r.x && this.y + this.h >= r.y && this.x < r.x + r.w && this.y < r.y + r.h
  }
  overlaps_rect(against: Rect) {

    let result = new Rect(0, 0, 0, 0)

    if (this.x + this.w >= against.x && this.x < against.x + against.w) {
      result.x = Math.max(this.x, against.x)
      result.w = Math.min(this.x + this.w, against.x + against.w) - result.x
    }

    if (this.y + this.h >= against.y && this.y < against.y + against.h) {
      result.y = Math.max(this.y, against.y)
      result.h = Math.min(this.y + this.h, against.y + against.h) - result.y
    }
    return result
  }

  intersects(l: Line) {
    return l.intersects_rect(this)
  }
  intersects_at(l: Line, out_intersection_point: Vec2) {
    return l.intersects_rect(this, out_intersection_point)
  }
  intersects_from_to(line_from: Vec2, line_to: Vec2) {
    return this.intersects(new Line(line_from, line_to))
  }
  intersects_from_to_at(line_from: Vec2, line_to: Vec2, out_intersection_point: Vec2) {
    return this.intersects_at(new Line(line_from, line_to), out_intersection_point)
  }
  intersection_point(line: Line) {
    let ret = new Vec2(0, 0)
    if (line.intersects_rect(this, ret)) {
      return ret
    }
    return Vec2.zero
  }

  intersection_point_from_to(line_from: Vec2, line_to: Vec2) {
    let ret = new Vec2(0, 0)
    if (new Line(line_from, line_to).intersects_rect(this, ret)) {
      return ret
    }
    return Vec2.zero 
  }



  scale(s: number) {
    return new Rect(this.x * s, this.y * s, this.w * s, this.h * s)
  }
  scale_xy(sx: number, sy: number) {
    return new Rect(this.x * sx, this.y * sy, this.w * sx, this.h * sy)
  }
  inflate(amount: number) {
    return new Rect(this.x - amount, this.y - amount, this.w + amount * 2, this.h + amount * 2)
  }
  inflate_xy(amount_x: number, amount_y: number) {
    return new Rect(this.x - amount_x, this.y - amount_y, this.w + amount_x * 2, this.h + amount_y * 2)
  }


  // Rect Sectors:
  //		0101  0100  0110
  //		0001  0000  0010
  //		1001  1000  1010
  //	0000 = inside rectangle, all others refer to sectors relative to the rectangle
  get_sector(pt: Vec2) {

    let result = 0
    if (pt.x < this.left) {
      result |= b0001
    } else if (pt.x >= this.right) {
      result |= b0010
    }
    if (pt.y < this.top) {
      result |= b0100
    } else if (pt.y >= this.bottom) {
      result |= b1000
    }
    return result
  }


  static transform = (rect: Rect, matrix: Mat3x2) => {
    return new Rect(
      (rect.x * matrix.m11) + (rect.y * matrix.m21) + matrix.m31,
      (rect.x * matrix.m12) + (rect.y * matrix.m22) + matrix.m32,
      (rect.w * matrix.m11) + (rect.h * matrix.m21),
      (rect.w * matrix.m12) + (rect.h * matrix.m22))
  }

  static from_points = (from: Vec2, to: Vec2) => {
    let min = Vec2.min(from, to),
      max = Vec2.max(from, to)
    return new Rect(min.x, min.y, max.x - min.x , max.y - min.y)
  }


  x: number
  y: number
  w: number
  h: number

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }
}


export class Circle {

  static make_x = (x: number, y: number, radius: number) => new Circle(Vec2.make(x, y), radius)
  static make = (center: Vec2, radius: number) => new Circle(center, radius)

  project(axis: Vec2) {
  
    let min = Vec2.dot(this.center.sub(axis.scale(this.radius)), axis)
    let max = Vec2.dot(this.center.add(axis.scale(this.radius)), axis)

    return [min, max]
  }

  constructor(readonly center: Vec2, readonly radius: number) {}
}

export class Quad {

  project(axis: Vec2) {
    let dot = Vec2.dot(this.a, axis)
    let min = dot,
      max = dot

    dot = Vec2.dot(this.b, axis)
    min = dot < min ? dot : min
    max = dot > max ? dot : max
    dot = Vec2.dot(this.c, axis)
    min = dot < min ? dot : min
    max = dot > max ? dot : max
    dot = Vec2.dot(this.d, axis)
    min = dot < min ? dot : min
    max = dot > max ? dot : max

    return [min, max]
  }

  constructor(readonly a: Vec2,
              readonly b: Vec2,
              readonly c: Vec2,
              readonly d: Vec2) {}

}

export class Line {

  static make_x = (x0: number, y0: number, x1: number, y1: number) => 
  new Line(Vec2.make(x0, y0), Vec2.make(x1, y1))

  static make = (a: Vec2, b: Vec2) => new Line(a, b)

  get bounds() { return Rect.from_points(this.a, this.b) }

  closest_point(p: Vec2) {
    let v = this.b.sub(this.a)
    let w = p.sub(this.a)
    let t = Vec2.dot(w, v) / (v.x * v.x + v.y * v.y)
    if (t < 0) { t = 0 }
    else if (t > 1) { t = 1 }
    return v.scale(t).add(this.a)
  }

  intersects_rect(rect: Rect, out_intersection_point?: Vec2) {
  
    let ca = rect.get_sector(this.a),
      cb = rect.get_sector(this.b)

    if (ca == cb || (ca & cb) !== 0) {
      return false
    }

    let both = ca | cb

    if ((both & b0100) !== 0 && this.intersects_line(rect.top_line, out_intersection_point)) {
      return true
    }
    if ((both & b1000) !== 0 && this.intersects_line(rect.bottom_line, out_intersection_point)) {
      return true
    }
    if ((both & b0001) !== 0 && this.intersects_line(rect.left_line, out_intersection_point)) {
      return true
    }
    if ((both & b0010) !== 0 && this.intersects_line(rect.right_line, out_intersection_point)) {
      return true
    }

    return false
  }
  intersects_line(line: Line, out_intersection_point?: Vec2) {
  
    let e = this.b.sub(this.a)
    let d = line.b.sub(line.a)
    let e_dot_d_perp = e.x * d.y - e.y * d.x

    if (e_dot_d_perp > -epsilon && e_dot_d_perp < epsilon) {
      return false
    }

    let c = line.a.sub(this.a)
    let t = (c.x * d.y - c.y * d.x) / e_dot_d_perp
    if (t < 0 || t > 1) {
      return false
    }

    let u = (c.x * e.y - c.y * e.x) / e_dot_d_perp
    if (u < 0 || u > 1) {
      return false
    }
    if (out_intersection_point) {
      out_intersection_point.set_in(e.scale(t).add(this.a))
    }
    return true
  }


  project(axis: Vec2) {

    let dot = this.a.x * axis.x + this.a.y * axis.y
    let min = dot, max = dot
    dot = this.b.x * axis.x + this.b.y * axis.y
    min = dot < min ? dot : min
    max = dot > max ? dot : max

    return [min, max]
  }

  add(v: Vec2) {
    return new Line(this.a.add(v), this.b.add(v))
  }
  sub(v: Vec2) {
    return new Line(this.a.sub(v), this.b.sub(v))
  }

  a: Vec2
  b: Vec2

  constructor(a: Vec2, b: Vec2) {
    this.a = a
    this.b = b
  }
}

export class Mat3x2 {

  static make = (m11: number, m12: number, m21: number, m22: number, m31: number, m32: number) =>
  new Mat3x2(m11, m12, m21, m22, m31, m32)
  static copy = (m: Mat3x2) => new Mat3x2(m.m11, m.m12, m.m21, m.m22, m.m31, m.m32)


  static get identity() { return new Mat3x2(1, 0, 0, 1, 0, 0) }

  static create_translation = (position: Vec2) => {
    return new Mat3x2(1, 0, 0, 1, position.x, position.y)
  }
  static create_translation_x = (x: number, y: number) => {
    return new Mat3x2(1, 0, 0, 1, x, y)
  }
  static create_scale = (scale: number, center_point?: Vec2) => {
    if (center_point) {
      let tx = center_point.x * (1 - scale)
      let ty = center_point.y * (1 - scale)
      return new Mat3x2(scale, 0, 0, scale, tx, ty)
    }
    return new Mat3x2(scale, 0, 0, scale, 0, 0)
  }

  static create_scale_xy = (x: number, y: number, center_point?: Vec2) => {
    if (center_point) {
      let tx = center_point.x * (1 - x)
      let ty = center_point.y * (1 - y)
      return new Mat3x2(x, 0, 0, y, tx, ty)
    }
    return new Mat3x2(x, 0, 0, y, 0, 0)
  }
  static create_scale_v = (v: Vec2, center_point?: Vec2) => {
    if (center_point) {
      let tx = center_point.x * (1 - v.x)
      let ty = center_point.y * (1 - v.y)
      return new Mat3x2(v.x, 0, 0, v.y, tx, ty)
    }
    return new Mat3x2(v.x, 0, 0, v.y, 0, 0)
  }

  static create_rotation = (radians: number) => {
    let c = Math.cos(radians),
      s = Math.sin(radians)
    return new Mat3x2(c, s, -s, c, 0, 0)
  }
  static create_transform = (position: Vec2, origin: Vec2, scale: Vec2, rotation: number) => {
  
    let matrix = Mat3x2.identity
    if (origin.x !== 0 || origin.y !== 0) {
      matrix = Mat3x2.create_translation_x(-origin.x, -origin.y)
    }
    if (scale.x !== 1 || scale.y !== 1) {
      matrix = matrix.mul(Mat3x2.create_scale_v(scale))
    }
    if (rotation !== 0) {
      matrix = matrix.mul(Mat3x2.create_rotation(rotation))
    }
    if (position.x !== 0 ||  position.y !== 0) {
      matrix = matrix.mul(Mat3x2.create_translation(position))
    }
    return matrix
  }

  static add = (a: Mat3x2, b: Mat3x2) => {
    return new Mat3x2(a.m11 + b.m11,
                      a.m12 + b.m12,
                      a.m21 + b.m21,
                      a.m22 + b.m22,
                      a.m31 + b.m31,
                      a.m32 + b.m32)
  }
  static sub = (a: Mat3x2, b: Mat3x2) => {
     return new Mat3x2(a.m11 - b.m11,
                      a.m12 - b.m12,
                      a.m21 - b.m21,
                      a.m22 - b.m22,
                      a.m31 - b.m31,
                      a.m32 - b.m32)
  }
  static mul = (a: Mat3x2, b: Mat3x2) => {
    return new Mat3x2(a.m11 * b.m11 + a.m12 * b.m21,
                      a.m11 * b.m12 + a.m12 * b.m22,
                      a.m21 * b.m11 + a.m22 * b.m21,
                      a.m21 * b.m12 + a.m22 * b.m22,
                      a.m31 * b.m11 + a.m32 * b.m21 + b.m31,
                      a.m31 * b.m12 + a.m32 * b.m22 + b.m32)
  }

  mul(m: Mat3x2) { return Mat3x2.mul(this, m) }
  add(m: Mat3x2) { return Mat3x2.add(this, m) }
  sub(m: Mat3x2) { return Mat3x2.sub(this, m) }
  mul_in(m: Mat3x2) { 
    let res = Mat3x2.mul(this, m)
    this.m11 = res.m11
    this.m12 = res.m12
    this.m21 = res.m21
    this.m22 = res.m22
    this.m31 = res.m31
    this.m32 = res.m32
    return this
  }

  get invert() {
    let { m11, m12, m21, m22, m31, m32 } = this
  
    let det = (m11 * m22) - (m21 * m12)
    let inv_det = 1 / det

    return new Mat3x2(
      m22 * inv_det,
      -m12 * inv_det,
      -m21 * inv_det,
      m11 * inv_det,
      (m21 * m32 - m31 * m22) * inv_det,
      (m31 * m12 - m11 * m32) * inv_det
    )
  }

  get scaling_factor() {
    let { m11, m12, m21, m22, m31, m32 } = this

    return Math.sqrt(m11 * m11 + m12 * m12)
  }

  equals(rhs: Mat3x2) {
    return Math.abs(this.m11 - rhs.m11) < epsilon &&
      Math.abs(this.m12 - rhs.m12) < epsilon &&
      Math.abs(this.m21 - rhs.m21) < epsilon &&
      Math.abs(this.m22 - rhs.m22) < epsilon &&
      Math.abs(this.m31 - rhs.m31) < epsilon &&
      Math.abs(this.m32 - rhs.m32) < epsilon
  }

  m11: number
  m12: number
  m21: number
  m22: number
  m31: number
  m32: number

  constructor(m11: number,
              m12: number,
              m21: number,
              m22: number,
              m31: number,
              m32: number) {
                this.m11 = m11
                this.m12 = m12
                this.m21 = m21
                this.m22 = m22
                this.m31 = m31
                this.m32 = m32
              }


}

export class Mat4x4 {

  static create_ortho = (width: number, height: number, z_near_plane: number, z_far_plane: number) => {
    let result = Mat4x4.identity
    result.m11 = 2 / width
    result.m12 = result.m13 = result.m14 = 0
    result.m22 = -2 / height
    result.m21 = result.m23 = result.m24 = 0
    result.m33 = 1/ (z_near_plane - z_far_plane)
    result.m31 = result.m32 = result.m34 = 0
    result.m41 = result.m42 = 0
    result.m43 = z_near_plane / (z_near_plane - z_far_plane)
    result.m44 = 1
    return result
  }

  static create_ortho_offcenter = (left: number, right: number, bottom: number, top: number, z_near_plane: number, z_far_plane: number) => {
    let result = Mat4x4.identity
    result.m11 = 2 / (right - left)
    result.m12 = result.m13 = result.m14 = 0
    result.m22 = 2 / (top - bottom)
    result.m21 = result.m23 = result.m24 = 0
    result.m33 = 1 / (z_near_plane - z_far_plane)
    result.m31 = result.m32 = result.m34 = 0
    result.m41 = (left + right) / (left - right)
    result.m42 = (top + bottom) / (bottom - top)
    result.m43 = z_near_plane / (z_near_plane - z_far_plane)
    result.m44 = 1
    return result
  }
  static create_perspective = (field_of_view: number, ratio: number, z_near_plane: number, z_far_plane: number) => {
  
    let scale_x = 1 / Math.tan(field_of_view * 0.5)
    let scale_y = scale_x / ratio

    let result = Mat4x4.identity
    result.m11 = scale_y
    result.m12 = result.m13 = result.m14 = 0
    result.m22 = scale_x
    result.m21 = result.m23 = result.m24 = 0
    result.m31 = result.m32 = 0
    result.m33 = z_far_plane / (z_near_plane - z_far_plane)
    result.m34 = -1
    result.m41 = result.m42 = result.m44 = 0
    result.m43 = z_near_plane * z_far_plane / (z_near_plane - z_far_plane)
    return result
  }

  static create_translation = (x: number, y: number, z: number) => {
    let result = Mat4x4.identity
    result.m41 = x
    result.m42 = y
    result.m43 = z
    return result
  }

  static create_scale = (x: number, y: number, z: number) => {
    let result = Mat4x4.identity
    result.m11 = x
    result.m22 = y
    result.m33 = z
    return result
  }

  static create_lookat = (position: Vec3, target: Vec3, up: Vec3) => {
  
    let zaxis = position.sub(target).normal
    let xaxis = Vec3.cross(up, zaxis).normal
    let yaxis = Vec3.cross(zaxis, xaxis)

    let result = Mat4x4.identity
    result.m11 = xaxis.x
    result.m12 = yaxis.x
    result.m13 = zaxis.x
    result.m14 = 0
    result.m21 = xaxis.y
    result.m22 = yaxis.y
    result.m23 = zaxis.y
    result.m24 = 0
    result.m31 = xaxis.z
    result.m32 = yaxis.z
    result.m33 = zaxis.z
    result.m34 = 0
    result.m41 = -Vec3.dot(xaxis, position)
    result.m42 = -Vec3.dot(yaxis, position)
    result.m43 = -Vec3.dot(zaxis, position)
    result.m44 = 1
    return result
  }

  static get identity() {
    return new Mat4x4(1, 0, 0, 0,
                      0, 1, 0, 0,
                      0, 0, 1, 0,
                      0, 0, 0, 1)
  }


  mul(rhs: Mat4x4) {

    let { m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 } = this
    let m = Mat4x4.identity

    m.m11 = m11 * rhs.m11 + m12 * rhs.m21 + m13 * rhs.m31 + m14 * rhs.m41;
    m.m12 = m11 * rhs.m12 + m12 * rhs.m22 + m13 * rhs.m32 + m14 * rhs.m42;
    m.m13 = m11 * rhs.m13 + m12 * rhs.m23 + m13 * rhs.m33 + m14 * rhs.m43;
    m.m14 = m11 * rhs.m14 + m12 * rhs.m24 + m13 * rhs.m34 + m14 * rhs.m44;

    m.m21 = m21 * rhs.m11 + m22 * rhs.m21 + m23 * rhs.m31 + m24 * rhs.m41;
    m.m22 = m21 * rhs.m12 + m22 * rhs.m22 + m23 * rhs.m32 + m24 * rhs.m42;
    m.m23 = m21 * rhs.m13 + m22 * rhs.m23 + m23 * rhs.m33 + m24 * rhs.m43;
    m.m24 = m21 * rhs.m14 + m22 * rhs.m24 + m23 * rhs.m34 + m24 * rhs.m44;

    m.m31 = m31 * rhs.m11 + m32 * rhs.m21 + m33 * rhs.m31 + m34 * rhs.m41;
    m.m32 = m31 * rhs.m12 + m32 * rhs.m22 + m33 * rhs.m32 + m34 * rhs.m42;
    m.m33 = m31 * rhs.m13 + m32 * rhs.m23 + m33 * rhs.m33 + m34 * rhs.m43;
    m.m34 = m31 * rhs.m14 + m32 * rhs.m24 + m33 * rhs.m34 + m34 * rhs.m44;

    m.m41 = m41 * rhs.m11 + m42 * rhs.m21 + m43 * rhs.m31 + m44 * rhs.m41;
    m.m42 = m41 * rhs.m12 + m42 * rhs.m22 + m43 * rhs.m32 + m44 * rhs.m42;
    m.m43 = m41 * rhs.m13 + m42 * rhs.m23 + m43 * rhs.m33 + m44 * rhs.m43;
    m.m44 = m41 * rhs.m14 + m42 * rhs.m24 + m43 * rhs.m34 + m44 * rhs.m44;

    return m
  }

  m11: number
  m12: number
  m13: number
  m14: number

  m21: number
  m22: number
  m23: number
  m24: number

  m31: number
  m32: number
  m33: number
  m34: number

  m41: number
  m42: number
  m43: number
  m44: number


  constructor(m11: number,
              m12: number,
              m13: number,
              m14: number,

              m21: number,
              m22: number,
              m23: number,
              m24: number,

              m31: number,
              m32: number,
              m33: number,
              m34: number,

              m41: number,
              m42: number,
              m43: number,
              m44: number) {

                this.m11 = m11
                this.m12 = m12
                this.m13 = m13
                this.m14 = m14

                this.m21 = m21
                this.m22 = m22
                this.m23 = m23
                this.m24 = m24


                this.m31 = m31
                this.m32 = m32
                this.m33 = m33
                this.m34 = m34


                this.m41 = m41
                this.m42 = m42
                this.m43 = m43
                this.m44 = m44
              }




}





