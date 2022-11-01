import { Target } from './graphics'

export type Config = {
  is_dev: boolean,
  name: string,
  width: number,
  height: number,
  max_updates: number,
  on_startup?: () => void,
  on_update?: () => void,
  on_render?: () => void,
  on_log?: () => void
}

class _App {

  backbuffer!: Target
  config!: Config

  get is_dev() {
    return this.config.is_dev
  }

  run(config: Config) {
  }
}

export const App = new _App()
