import dayjs from "dayjs"

export default class UpdateTimer {

    constructor(elem, updateTime) {
        this.updateTime = updateTime;
        this.elem = elem;
        this.timer = null;
        this.interval = 60000;
        this.elem.innerText = dayjs(updateTime * 1000).fromNow();
        this.documentUpdated(updateTime);
    }

    documentUpdated(updateTime) {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.updateTime = updateTime;

        const now = Math.floor(Date.now() / 1000);
        this.interval = this.updateIntervalInMsByDistance(now);
        console.log("update this interval", this.interval);
        this.timer = setInterval(() => {this.updateElem()}, this.interval);
    }

    updateElem() {

        this.elem.innerText = dayjs(this.updateTime*1000).fromNow();
        const now = Math.floor(Date.now() / 1000);
        const interval = this.updateIntervalInMsByDistance(now);
        if (interval != this.interval) {
            clearInterval(this.timer);
            this.interval = interval;
            this.timer = setInterval(() => {this.updateElem()}, interval);
        }
    }

    updateIntervalInMsByDistance(now) {
        const distanceInSec = now - this.updateTime;

        if (distanceInSec < 60) {
            return 5000;
        }
        else if (distanceInSec >= 60 && distanceInSec < 3600) {
            return 60 * 1000;
        }
        else if (distanceInSec > 3600) {
            return 3600 * 1000;
        }
    }
}