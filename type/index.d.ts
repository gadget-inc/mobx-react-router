import type { History, Listener, To, Update } from 'history'

declare type UnregisterCallback = ReturnType<History['listen']>
export declare class RouterStore {
  readonly history: History

  readonly basePath?: string | undefined

  pathList: string[]

  state: Update

  /** @readonly */
  get location(): Update['location']

  constructor(history: History, basePath?: string | undefined)

  push(to: To, state?: any): void

  replace(to: To, state?: any): void

  go: History['go']

  back: History['back']

  forward: History['forward']

  updateState: (newState: Update) => void

  /**
   * get query format from location.search
   * @readonly
   * */
  get query(): Record<string, any>

  /**
   * get hash, not include '#'
   * @readonly
   * */
  get hashValue(): any

  /**
   * get path variable value, example:
   * /path/:name => /path/abc
   * router.pathValue.name => ac
   *
   * @readonly
   * */
  get pathValue(): Record<string, string>

  /**
   * append new path to router.pathList, like '/abc/:name'
   * Note: the pathList order will affect pathValue
   * */
  appendPathList(...pathList: string[]): void

  /**
   * preppend new path to router.pathList, like '/abc/:name'
   * Note: the pathList order will affect pathValue
   * */
  prependPathList(...pathList: string[]): void

  subscribe: (listener: Listener) => UnregisterCallback

  stopSyncWithHistory: UnregisterCallback

  private addBasename
}
export {}
