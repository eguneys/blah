import { Time } from './time'
import { Platform } from './platform'
import { Renderer } from './renderer'
import { Target, Attachments } from './graphics'
import { Color } from './color'

export type Config = {
  name: string,
  width: number,
  height: number,
  max_updates?: number,
  on_startup?: () => void,
  on_update?: () => void,
  on_render?: () => void,
  on_log?: () => void
}

const get_drawable_size = () => {
  return App.renderer.get_draw_size || App.platform.get_draw_size
}

class BackBuffer extends Target {

  static empty_textures: Attachments = []


  get width() { return get_drawable_size()[0] }
  get height() { return get_drawable_size()[1] }

  get textures() { return BackBuffer.empty_textures }


  clear(color: Color, depth: number, stencil: number) {
    App.renderer.clear_backbuffer(color, depth, stencil)
  }

}

class _App {

  platform!: Platform
  renderer!: Renderer
  backbuffer!: Target
  config!: Config

  get canvas() {
    return this.platform.canvas
  }

  app_time_last: number = 0
  app_time_accumulator: number = 0

  run(config: Config) {
    this.config = config

    this.backbuffer = new BackBuffer()

    {
      this.platform = Platform.try_make_platform(this.config)
      this.platform.init()
    }

    {
      this.renderer = Renderer.try_make_renderer()
      this.renderer.init()
    }

    // input + poll the platform once
    this.platform.update()

    this.config.on_startup?.()

    this.app_time_accumulator = 0

    this.platform.ready()

    this.begin_iterate()
  }


  begin_iterate() {

    const _step = () => {
      this.platform.update()
      this.renderer.update()
      this.config.on_update?.()
    }

    const step = (ticks_curr: number) => {

      /*
      let ticks_diff = ticks_curr - this.app_time_last
      this.app_time_last = ticks_curr
      this.app_time_accumulator += ticks_diff

      Time.delta = ticks_diff / Time.ticks_per_second

      if (Time.pause_timer > 0) {
        Time.pause_timer -= Time.delta
      } else {
        Time.previous_ticks = Time.ticks
        Time.ticks += ticks_diff
        Time.previous_seconds = Time.seconds
        Time.seconds += Time.delta

        _step()
      }
      */

      let time_target = (1.0 / 60) * Time.ticks_per_second
      let ticks_diff = ticks_curr - this.app_time_last
      this.app_time_last = ticks_curr
      this.app_time_accumulator += ticks_diff


      while (this.app_time_accumulator >= time_target) {
        this.app_time_accumulator -= time_target

        Time.delta = 1.0 / 60

        if (Time.pause_timer > 0) {
          Time.pause_timer -= Time.delta
          if (Time.pause_timer <= -0.0001) {
            Time.delta = - Time.pause_timer
          } else {
            continue
          }
        }

        Time.previous_ticks = Time.ticks
        Time.ticks += time_target
        Time.previous_seconds = Time.seconds
        Time.seconds += Time.delta

        _step()
      }


      {
        this.renderer.before_render()
        this.config.on_render?.()
        this.renderer.after_render()
        this.platform.present()
      }
      requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }
}

export const App = new _App()
