const isSupportVisibilityState = typeof document.visibilityState !== undefined;

// Android 4.4.2 不支持 visibilityState，则添加 webkit 前缀
export const VISIBILITY_STATE = isSupportVisibilityState ? 'visibilityState' : 'webkitVisibilityState';
export const VISIBILITY_CHANGE = isSupportVisibilityState ? 'visibilitychange' : 'webkitvisibilitychange';

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 1000 * 60;
export const MS_PER_HOUR = 1000 * 60 * 60;
export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const EVENT_START = 'start';
export const EVENT_COUNT = 'count';
export const EVENT_VISIBILITY_HIDDEN = 'visibility-hidden';
export const EVENT_VISIBILITY_VISIBLE = 'visibility-visible';
export const EVENT_PAUSE = 'pause';
export const EVENT_CONTINUE = 'continue';
export const EVENT_END = 'end';
export const EVENT_FINISH = 'finish';
