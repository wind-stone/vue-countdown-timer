# vue-countdown-timer

基于 Vue 2.x 的倒计时工具，能解决页面 Tab 切换、页面切换到后台、iOS Webview 页面滚动等导致的倒计时暂停问题。

此外，该工具的特点还有：

- 基于 requestAnimationFrame 的倒计时，能让倒计时更加精准。
- 支持手动暂停/恢复倒计时功能。
  - TODO: 手动暂停倒计时再恢复后，在最后一个`interval`要向上取完整的一个`interval`时间。

## 使用

### 示例

```html
<VueCountdownTimer
    ref="vueCountdown"
    :time="60000"
    :interval="1000"
    :format="format"
>
    <template v-slot="props">
        <span>{{ `${props.hours}:${props.minutes}:${props.seconds}` }}</span>
    </template>
</VueCountdownTimer>
```

```js
export default {
    methods: {
        format(props) {
            Object.entries(props).forEach(([key, value]) => {
                props[key] = value < 10 ? `0${value}` : String(value);
            });
            return props;
        }
    }
};
```

### Props

#### time

- type: `Number`
- default: `0`

倒计时的总时间。单位为毫秒`ms`。该值不能小于`0`。

#### interval

- type: `Number`
- default: `1000`

每次倒计时的时间间隔。单位为毫秒`ms`。该值不能小于`0`。

#### autoStart

- type: `Boolean`
- default: `true`

是否在组件挂载后（`mounted`钩子执行时）自动开启倒计时。

### emitEvents

- type: `Boolean`/`Object`
- default: `true`

是否`emit`事件，取值如下：

- `true`: 所有事件都`emit`
- `false`: 所有事件都不`emit`
- `Object`类型，自定义选择哪些事件需要`emit`。`key`为事件名，`value`为`true`/`false`，默认为`false`
  - `start`: 开始事件
  - `count`: 计时事件
  - `pause`: 暂停事件
  - `continue`: （从暂停中恢复）继续事件
  - `end`: 终止事件
  - `finish`: 完成事件
  - `visibilityHidden`: `document.visibilityState`变化为`hidden`时触发的事件
  - `visibilityVisible`: `document.visibilityState`变化为`visible`时触发的事件

`Object`类型的取值示例：

```js
{
    start: true,
    count: false,
    pause: true,
    continue: true,
    end: true,
    finish: true,
    'visibility-hidden': false,
    'visibility-visible': false
}
```

### format

- type: `Function`
- default: `props => props`

渲染之前，格式化输出属性的函数。

### enableVisibilityHiddenFix

- type: `Boolean`
- default: `true`

是否启用对“页面不可见导致倒计时停止”问题的修复。页面不可见的情况包括：

- PC 端：页面处于背景标签页、窗口处于最小化状态、电脑锁屏、切屏等
- 移动端：应用切到后台、锁屏等

### enableIosUiwebviewScrollFix

- type: `Boolean`
- default: `false`

是否启用对“iOS UIWebview 滚动时计时器停止”问题的修复。该问题的表现为，处于 iOS UIWebview 里的页面在滚动时计时器将停止运行，停止滚动后页面从上次剩余的总时间上继续倒计时，没有减去滚动期间的时间，导致倒计时的总时间增加。

## Methods

```html
<div>
    <VueCountdownTimer
        ref="vueCountdown"
        :time="60000"
        :interval="1000"
        :auto-start="false"
    >
        <template v-slot="props">
            <span>{{ `${props.hours}:${props.minutes}:${props.seconds}` }}</span>
        </template>
    </VueCountdownTimer>
    <div class="btns">
        <button @click="pause">pause</button>
        <button @click="continueCount">continue</button>
        <button @click="end">end</button>
    </div>
</div>
```

```js
export default {
    mounted() {
        this.$refs.vueCountdown.start();
    },
    pause() {
        this.$refs.vueCountdown.pause();
    },
    continueCount() {
        this.$refs.vueCountdown.continue();
    }
    end() {
        this.$refs.vueCountdown.end();
    }
};
```

### start

开启倒计时。在`autoStart`设为`false`时，手动调用`start`开启倒计时。

### pause/continue

暂停/恢复倒计时。注意，假设在倒计时还有 10s 的时候调用`pause`暂停，5s 后调用`continue`恢复倒计时，此时倒计时的初始值仍为 10s，即暂停期间的时间会被忽略。

### end

（在倒计时未完成时）终止倒计时。

## 事件

```html
<VueCountdownTimer
    ref="vueCountdown"
    :time="60000"
    :interval="1000"
    :format="format"
    @start="consoleEvent('start', $event)"
    @count="consoleEvent('count', $event)"
    @pause="consoleEvent('pause', $event)"
    @continue="consoleEvent('continue', $event)"
    @end="consoleEvent('end', $event)"
    @finish="consoleEvent('finish', $event)"
    @visibility-hidden="consoleEvent('visibility-hidden', $event)"
    @visibility-visible="consoleEvent('visibility-visible', $event)"
>
    <template v-slot="props">
        <span>{{ `${props.hours}:${props.minutes}:${props.seconds}` }}</span>
    </template>
</VueCountdownTimer>
```

```js
export default {
    methods: {
        consoleEvent(evtName, props) {
            console.log(evtName, props);
            // start {days: 0, hours: 0, minutes: 1, seconds: 0, milliseconds: 0, …}
            // count {days: 0, hours: 0, minutes: 0, seconds: 59, milliseconds: 0, …}
            // count {days: 0, hours: 0, minutes: 0, seconds: 58, milliseconds: 0, …}
            // ...
        }
    }
};
```

## 浏览器支持

- Android 4.4+
- iOS 7+ 完全支持
