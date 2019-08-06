const Vidle = {
  install(Vue, options) {
    Vue.component('v-idle', {
      render: function (createElement) {
        return createElement(
          'div',
          {
            'class': 'v-idle'
          },
          this.display
        )
      },
      props: {
        duration: {
          type: Number,
          // default 5 minutes
          default: 60 * 5
        },
        events: {
          type: Array,
          default: () => ['mousemove', 'keypress']
        },
        loop: {
          type: Boolean,
          default: false
        },
        reminders: {
          type: Array,
          // array of seconds
          // emit "remind" event on each second
          default: () => []
        },
        wait: {
          type: Number,
          default: 0
        }
      },
      data() {
        return {
          timer: null,
          counter: null,
          start: null,
          diff: null,
          minutes: null,
          seconds: null,
          display: null
        }
      },
      mounted() {
        setTimeout(() => {
          this.start = Date.now();
          this.setDisplay();
          this.$nextTick(() => {
            this.setTimer();
            for (let i = this.events.length - 1; i >= 0; i -= 1) {
              window.addEventListener(this.events[i], this.clearTimer);
            }
          })
        }, this.wait * 1000);
      },
      methods: {
        setDisplay() {
          // seconds since start
          this.diff = this.duration - (((Date.now() - this.start) / 1000) | 0);
          if (this.diff < 0 && !this.loop) {
            return;
          }
          this.shouldRemind();

          // bitwise OR to handle parseInt
          let minute = (this.diff / 60) | 0;
          let second = (this.diff % 60) | 0;

          this.minutes = minute < 10 ? "0" + minute : minute;
          this.seconds = second < 10 ? "0" + second : second;

          this.display = this.minutes + ":" + this.seconds;
        },
        shouldRemind() {
          if (this.reminders.length > 0) {
            if (this.reminders.indexOf(this.diff) > -1) {
              this.remind();
            }
          }
        },
        countdown() {
          this.setDisplay();

          if (this.diff <= 0 && this.loop) {
            // add second to start at the full duration
            // for instance 05:00, not 04:59
            this.start = Date.now() + 1000;
          }
        },
        idle() {
          this.$emit('idle');
        },
        remind() {
          this.$emit('remind', this.diff);
        },
        setTimer() {
          this.timer = setInterval(this.idle, this.duration * 1000);
          this.counter = setInterval(this.countdown, 1000);
        },
        clearTimer() {
          clearInterval(this.timer);
          clearInterval(this.counter);
          this.setDisplay();
          this.start = Date.now();
          this.diff = null;
          this.setTimer();
        }
      },
      beforeDestroy() {
        clearInterval(this.timer);
        clearInterval(this.counter);
        for (let i = this.events.length - 1; i >= 0; i -= 1) {
          window.removeEventListener(this.events[i], this.clearTimer);
        }
      }
    });
  }
};
export default Vidle;