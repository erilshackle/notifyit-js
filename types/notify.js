/**
 * @typedef {'success'|'error'|'warning'|'info'|'default'} NotifyType
 */

/**
 * @typedef {'outline'|'subtle'|'elevated'|'solid'|'gradient'|'glass'} NotifyAppearance
 */

/**
 * @typedef {'top-right'|'top-left'|'bottom-right'|'bottom-left'} NotifyPosition
 */

/**
 * @typedef {Object} NotifyAction
 * @property {string} label
 * @property {(toast: NotifyToast) => void} [onClick]
 * @property {*} [value]
 */

/**
 * @typedef {Object} NotifyShowOptions
 * @property {string} message
 * @property {NotifyType} [type]
 * @property {NotifyAppearance} [appearance]
 * @property {NotifyPosition} [position]
 * @property {number} [duration]
 * @property {boolean} [closable]
 * @property {boolean} [pauseOnHover]
 * @property {NotifyAction[]} [actions]
 */

/**
 * @typedef {Object} NotifyPromiseOptions
 * @property {string} [loading]
 * @property {string|Function|{message?:string|Function,actions?:NotifyAction[]}} [success]
 * @property {string|Function|{message?:string|Function,actions?:NotifyAction[]}} [error]
 * @property {NotifyAppearance} [appearance]
 * @property {number} [duration]
 */

/**
 * @typedef {Object} NotifyToast
 * @property {string} id
 * @property {string} message
 * @property {NotifyType} type
 * @property {string} title
 * @property {NotifyAppearance} appearance
 * @property {string} layout
 * @property {NotifyPosition} position
 * @property {number} duration
 * @property {boolean} closable
 * @property {boolean} pauseOnHover
 * @property {NotifyAction[]} actions
 * @property {(value?: any) => void} resolve
 * @property {Promise<any>} promise
 * @property {number|null} timeoutId
 * @property {number|null} startTime
 * @property {number|null} remaining
 * @property {boolean} visible
 */

/**
 * @typedef {Promise<any> & { toast: NotifyToast }} NotifyPromise
 */

/**
 * @typedef {Object} NotifyAPI
 * @property {(config?: Partial<NotifyShowOptions>) => void} init
 * @property {(options: NotifyShowOptions) => NotifyPromise} show
 * @property {(message: string, options?: NotifyShowOptions) => NotifyPromise} success
 * @property {(message: string, options?: NotifyShowOptions) => NotifyPromise} error
 * @property {(message: string, options?: NotifyShowOptions) => NotifyPromise} warning
 * @property {(message: string, options?: NotifyShowOptions) => NotifyPromise} info
 * @property {(id: string) => void} remove
 * @property {() => void} clear
 * @property {(config: Object) => void} config
 * @property {() => any} getState
 * @property {(json: Object|string) => void} fromJsonResponse
 * @property {(event: Event) => void} triggerHx
 * @property {(promise: Promise<any>, options?: NotifyPromiseOptions) => Promise<any>} promise
 */
