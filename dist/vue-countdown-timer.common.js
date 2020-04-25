
/**
 * vue-countdown-timer v0.1.0
 * (c) 2020-2020 wind-stone
 * Released under the MIT License.
 */

'use strict';

const isSupportVisibilityState = typeof document.visibilityState !== undefined; // Android 4.4.2 不支持 visibilityState，则添加 webkit 前缀

const VISIBILITY_STATE = isSupportVisibilityState ? 'visibilityState' : 'webkitVisibilityState';
const VISIBILITY_CHANGE = isSupportVisibilityState ? 'visibilitychange' : 'webkitvisibilitychange';
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 1000 * 60;
const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const EVENT_START = 'start';
const EVENT_COUNT = 'count';
const EVENT_VISIBILITY_HIDDEN = 'visibility-hidden';
const EVENT_VISIBILITY_VISIBLE = 'visibility-visible';
const EVENT_PAUSE = 'pause';
const EVENT_CONTINUE = 'continue';
const EVENT_END = 'end';
const EVENT_FINISH = 'finish';

const ua = navigator.userAgent;
const camelizeRE = /-(\w)/g;
function camelize(str) {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '');
}
function isIOS() {
  return !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
}
function getCurrentTime() {
  return Date.now();
}

/**
 * @file 倒计时组件，解决切换到后台、iOS UIWebview 滚动时导致计时器暂停的问题
 * @author wind-stone@qq.com
 * @date 2020-02-23
 *
 * Inspired By https://github.com/fengyuanchen/vue-countdown
 *
 * 兼容性说明
 * - requestAnimationFrame 的兼容性：Android 4.4+ 和 iOS 7+ 完全支持
 */
var index = {
  name: 'VueCountdownTimer',
  props: {
    // 倒计时总时间
    time: {
      type: Number,
      required: true,
      validator: val => val >= 0
    },
    // 倒计时的时间间隔，单位为 ms，建议不低于 100
    interval: {
      type: Number,
      default: 1000
    },
    // 是否自动开启倒计时
    autoStart: {
      type: Boolean,
      default: true
    },
    // 是否在倒计时过程中 emit 出事件，可以有如下取值：
    // - true: emit 出所有的事件
    // - false: 不 emit 事件
    // - Object: 按需配置要 emit 的事件
    // {
    //    start: true,
    //    count: false,
    //    'visibilityHidden': true,
    //    'visibilityVisible': true,
    //    pause: true,
    //    continue: true,
    //    end: true,
    //    finish: true
    // }
    emitEvents: {
      type: [Boolean, Object],
      default: true
    },
    // 格式化函数
    format: {
      type: Function,
      default: props => props
    },
    // 是否启用 VisibilityChange 事件，启用后会修复切换到后台倒计时停止的 bug
    enableVisibilityHiddenFix: {
      type: Boolean,
      default: true
    },
    // 是否启用修复 iOS UIWebview 滚动时倒计时停止的 bug
    enableIosUiwebviewScrollFix: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      // 总倒计时毫秒数
      totalMilliseconds: 0,
      // 倒计时完成的时间点
      finishTimestamp: 0,
      // 是否正在倒计时
      isCounting: false,
      // 组件是否正在运行，只有调用 start 开始运行，调用 end/_finish 停止运行
      isRunning: false,
      isPaused: false
    };
  },

  render(h) {
    return h('span', this.$scopedSlots.default ? [this.$scopedSlots.default(this.format({
      days: this.days,
      hours: this.hours,
      minutes: this.minutes,
      seconds: this.seconds,
      milliseconds: this.milliseconds,
      totalDays: this.totalDays,
      totalHours: this.totalHours,
      totalMinutes: this.totalMinutes,
      totalSeconds: this.totalSeconds,
      totalMilliseconds: this.totalMilliseconds
    }))] : this.$slots.default);
  },

  computed: {
    days() {
      return Math.floor(this.totalMilliseconds / MS_PER_DAY);
    },

    hours() {
      return Math.floor(this.totalMilliseconds % MS_PER_DAY / MS_PER_HOUR);
    },

    minutes() {
      return Math.floor(this.totalMilliseconds % MS_PER_HOUR / MS_PER_MINUTE);
    },

    seconds() {
      return Math.floor(this.totalMilliseconds % MS_PER_MINUTE / MS_PER_SECOND);
    },

    milliseconds() {
      return Math.floor(this.totalMilliseconds % MS_PER_SECOND);
    },

    totalDays() {
      return this.days;
    },

    totalHours() {
      return Math.floor(this.totalMilliseconds / MS_PER_HOUR);
    },

    totalMinutes() {
      return Math.floor(this.totalMilliseconds / MS_PER_MINUTE);
    },

    totalSeconds() {
      return Math.floor(this.totalMilliseconds / MS_PER_SECOND);
    }

  },
  watch: {
    time(val) {
      this._stopCount();

      this.totalMilliseconds = val;
      this.finishTimestamp = getCurrentTime() + val;

      this._recoverCount();
    }

  },

  created() {
    this.totalMilliseconds = this.time;

    if (this.autoStart) {
      this.start();
    }

    document.addEventListener(VISIBILITY_CHANGE, this._handleVisibilityChange);

    if (this.enableIosUiwebviewScrollFix && isIOS()) {
      // 在 iOS UI webview 上，滚动事件回调只会在滚动完全结束之后触发，不会频发触发
      document.addEventListener('scroll', this._correctTime);
    }
  },

  beforeDestroy() {
    document.removeEventListener(VISIBILITY_CHANGE, this._handleVisibilityChange);

    if (this.enableIosUiwebviewScrollFix && isIOS()) {
      document.removeEventListener('scroll', this._correctTime);
    }
  },

  methods: {
    /**
     * 开启倒计时
     */
    start() {
      if ( // 以下几种情况不能开启倒计时
      this.isCounting // 正在计时时
      || document[VISIBILITY_STATE] !== 'visible' // 用户不可见页面时
      || this.totalMilliseconds <= 0) {
        return;
      }

      this.finishTimestamp = getCurrentTime() + this.totalMilliseconds;
      this.isRunning = true;
      this.isCounting = true;

      this._emitEvent(EVENT_START);

      this._count();
    },

    /**
     * 终止倒计时
     */
    end() {
      cancelAnimationFrame(this.timer);

      this._emitEvent(EVENT_END);

      this.isCounting = this.isRunning = false;
      this.totalMilliseconds = this.finishTimestamp = 0;
    },

    /**
     * 暂停计时
     */
    pause() {
      if (!this.isCounting || this.isPaused) {
        return;
      }

      this._stopCount();

      this.isPaused = true;

      this._emitEvent(EVENT_PAUSE);
    },

    /**
     * 从暂停中恢复计时，对应 pause
     */
    continue() {
      if (this.isCounting || !this.isRunning || !this.isPaused) {
        return;
      }

      this.isPaused = false;
      this.finishTimestamp = getCurrentTime() + this.totalMilliseconds;

      this._recoverCount();

      this._emitEvent(EVENT_CONTINUE);
    },

    /**
     * 确定是否需要 emit 事件
     */
    _canEmitEvents(eventName) {
      eventName = camelize(eventName);
      return this.emitEvents === true || this.emitEvents && this.emitEvents[eventName];
    },

    /**
     * 获取 emit 事件时的 payload
     */
    _getEmitPayload() {
      return {
        days: this.days,
        hours: this.hours,
        minutes: this.minutes,
        seconds: this.seconds,
        milliseconds: this.milliseconds,
        totalDays: this.totalDays,
        totalHours: this.totalHours,
        totalMinutes: this.totalMinutes,
        totalSeconds: this.totalSeconds,
        totalMilliseconds: this.totalMilliseconds
      };
    },

    /**
     * emit 事件
     */
    _emitEvent(eventName) {
      this._canEmitEvents(eventName) && this.$emit(eventName, this._getEmitPayload());
    },

    /**
     * 倒计时计数
     */
    _count() {
      if (!this.isCounting) {
        return;
      }

      const delay = Math.min(this.totalMilliseconds, this.interval);

      if (delay > 0) {
        // 计数开始时间
        const init = getCurrentTime();
        let times = 0;

        const step = () => {
          times++;
          const now = getCurrentTime();
          const averageFrameTime = (now - init) / times;

          if (now - init >= delay - averageFrameTime / 2) {
            this._minus();
          } else {
            this.timer = requestAnimationFrame(step);
          }
        };

        this.timer = requestAnimationFrame(step);
      } else {
        this._finish();
      }
    },

    /**
     * 减去计数一次消逝的时间
     */
    _minus() {
      if (!this.isCounting) {
        return;
      }

      this.totalMilliseconds -= this.interval;
      this.totalMilliseconds = Math.max(0, this.totalMilliseconds);

      if (this.totalMilliseconds === 0) {
        this._finish();
      } else {
        this._emitEvent(EVENT_COUNT);

        this._count();
      }
    },

    /**
     * 停止计时
     */
    _stopCount() {
      if (!this.isCounting || !this.isRunning) {
        return;
      }

      this.isCounting = false;
      cancelAnimationFrame(this.timer);
    },

    /**
     * 恢复计时，对应 _stopCount
     */
    _recoverCount() {
      if (this.isCounting || !this.isRunning || this.isPaused) {
        return;
      }

      this.isCounting = true;

      this._correctTime();

      this._count();
    },

    /**
     * 更新倒计时总时间
     */
    _correctTime() {
      if (!this.isCounting) {
        return;
      }

      this.totalMilliseconds = Math.max(0, this.finishTimestamp - getCurrentTime());
    },

    /**
     * 倒计时正常结束
     */
    _finish() {
      if (!this.isCounting) {
        return;
      }

      this.isCounting = false;
      this.isRunning = false;

      this._emitEvent(EVENT_FINISH);
    },

    /**
     * 处理切入后台/切回前台
     */
    _handleVisibilityChange() {
      switch (document[VISIBILITY_STATE]) {
        case 'hidden':
          this._emitEvent(EVENT_VISIBILITY_HIDDEN);

          this.enableVisibilityHiddenFix && this._stopCount();
          break;

        case 'visible':
          this.enableVisibilityHiddenFix && this._recoverCount();

          this._emitEvent(EVENT_VISIBILITY_VISIBLE);

          break;
      }
    }

  }
};

module.exports = index;
