#version 300 es
precision mediump float;

uniform sampler2D u_texture;
in vec2 v_tex;
in vec4 v_col;
in vec4 v_type;
out vec4 o_color;

void main(void) {
  vec4 color = texture(u_texture, v_tex);
  o_color = 
          v_type.x * color * v_col +
          v_type.y * color.a * v_col +
          v_type.z * v_col;

  o_color = vec4(1.0, 1.0, 0.0, 1.0);
}
