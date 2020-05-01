<template>
<div style="text-align: center">
    <ul class="vuejs-countdown">
        <li v-if="days > 0">
            <p class="digit">{{ days | twoDigits }}</p>
            <p class="text">{{ days > 1 ? 'jours' : 'jour' }}</p>
        </li>
        <li>
            <p class="digit">{{ hours | twoDigits }}</p>
            <p class="text">{{ hours > 1 ? 'heures' : 'heur' }}</p>
        </li>
        <li>
            <p class="digit">{{ minutes | twoDigits }}</p>
            <p class="text">min</p>
        </li>
        <li>
            <p class="digit">{{ seconds | twoDigits }}</p>
            <p class="text">sec</p>
        </li>
    </ul>
</div>
</template>

<script>
let interval = null;
export default {
    props: {
        end: {
            type: Date
        }
    },
    data: () => ({
        now: Math.trunc((new Date()).getTime() / 1000),
        date: null,
        diff: 0
    }),
    created() {
        this.init();
    },
    computed: {
        seconds() {
            return Math.trunc(this.diff) % 60
        },
        minutes() {
            return Math.trunc(this.diff / 60) % 60
        },
        hours() {
            return Math.trunc(this.diff / 60 / 60) % 24
        },
        days() {
            return Math.trunc(this.diff / 60 / 60 / 24)
        }
    },
    watch: {
        now(value) {
            this.diff = this.date - this.now;
            if(this.diff <= 0){
                this.diff = 0;
                clearInterval(interval);
                this.$emit("completed")
            }
        }
    },
    filters: {
        twoDigits(value) {
            if ( value.toString().length <= 1 ) {
                return '0'+value.toString()
            }
            return value.toString()
        }
    },
    destroyed() {
        clearInterval(interval);
    },
    methods: {
        init(endDate=null) {
            if (this.end) {
                this.date = Math.trunc(this.end.getTime() / 1000);
                if (!this.date) {
                    throw new Error("Date invalide");
                }
                interval = setInterval(() => {
                    this.now = Math.trunc((new Date()).getTime() / 1000);
                }, 1000);
            }
        }
    }
}
</script>
<style>
.vuejs-countdown {
    padding: 0;
    margin: 0;
}
.vuejs-countdown li {
    display: inline-block;
    margin: 0 8px;
    text-align: center;
    position: relative;
}
.vuejs-countdown li p {
    margin: 0;
}
.vuejs-countdown li:after {
    content: ":";
    position: absolute;
    top: 0;
    right: -13px;
    font-size: 32px;
}
.vuejs-countdown li:first-of-type {
    margin-left: 0;
}
.vuejs-countdown li:last-of-type {
    margin-right: 0;
}
.vuejs-countdown li:last-of-type:after {
    content: "";
}
.vuejs-countdown .digit {
    font-size: 32px;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 0;
}
.vuejs-countdown .text {
    text-transform: uppercase;
    margin-bottom: 0;
    font-size: 10px;
}
</style>
