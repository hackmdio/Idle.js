interface IdleOption {
    awayTimeout?: string | number,
    onAway?: Function,
    onAwayBack?: Function,
    onVisible?: Function,
    onHidden?: Function
}

interface ExtendedDocument extends Document {
    msHidden?: boolean
    webkitHidden?: boolean
}

function noop() {
}

// Idle.js main class
export default class Idle {
    isAway: boolean = false;

    // set default timeout to 3 seconds
    awayTimeout: number = 3000;
    awayTimestamp: number = 0;
    awayTimer: number | null = null;

    // events for monitoring user activity on the page
    onAway: Function = noop;
    onAwayBack: Function = noop;
    // events for the visibility API
    onVisible: Function = noop;
    onHidden: Function = noop;

    listener: EventListener | null = null;

    /**
     * Initialize the class
     * @param {IdleOption} options
     */
    constructor(options?: IdleOption) {
        if (options) {
            this.awayTimeout = parseInt(options.awayTimeout as string, 10);
            this.onAway = options.onAway || noop;
            this.onAwayBack = options.onAwayBack || noop;
            this.onVisible = options.onVisible || noop;
            this.onHidden = options.onHidden || noop;
        }

        const activeMethod = () => {
            return this.onActive();
        };

        // the methods that we will use to know when there is some activity on the page
        window.addEventListener('click', activeMethod);
        window.addEventListener('mousemove', activeMethod);
        window.addEventListener('mouseenter', activeMethod);
        window.addEventListener('keydown', activeMethod);
        window.addEventListener('scroll', activeMethod);
        window.addEventListener('mousewheel', activeMethod);
        window.addEventListener('touchmove', activeMethod);
        window.addEventListener('touchstart', activeMethod);
    }

    onActive() {
        this.awayTimestamp = new Date().getTime() + this.awayTimeout;
        if (this.isAway) {
            this.onAwayBack();
            this.start();
        }
        this.isAway = false;
        return true;
    }

    start() {
        if (!this.listener) {
            this.listener = (events: Event) => {
                this.handleVisibilityChange();
            };
            document.addEventListener("visibilitychange", this.listener, false);
            document.addEventListener("webkitvisibilitychange", this.listener, false);
            document.addEventListener("msvisibilitychange", this.listener, false);
        }
        this.awayTimestamp = new Date().getTime() + this.awayTimeout;
        if (this.awayTimer !== null) {
            clearTimeout(this.awayTimer);
        }
        this.awayTimer = setTimeout(() => {
            this.checkAway();
        }, this.awayTimeout + 100);
        return this;
    }

    stop() {
        if (this.awayTimer != null) {
            clearTimeout(this.awayTimer);
        }
        if (this.listener !== null) {
            document.removeEventListener("visibilitychange", this.listener);
            document.removeEventListener("webkitvisibilitychange", this.listener);
            document.removeEventListener("msvisibilitychange", this.listener);
            this.listener = null;
        }
        return this;
    }

    setAwayTimeout(ms: number) {
        this.awayTimeout = ms;
        return this;
    }

    checkAway() {
        const t = new Date().getTime();
        if (t < this.awayTimestamp) {
            this.isAway = false;
            this.awayTimer = setTimeout(() => {
                this.checkAway();
            }, this.awayTimestamp - t + 100);
            return
        }
        // away now
        if (this.awayTimer != null) {
            clearTimeout(this.awayTimer)
        }
        this.isAway = true;
        this.onAway();
    }

    handleVisibilityChange() {
        // check for hidden for various browsers
        if (document.hidden || (document as ExtendedDocument).msHidden || (document as ExtendedDocument).webkitHidden) {
            this.onHidden()
        } else {
            this.onVisible();
        }
    }
}
