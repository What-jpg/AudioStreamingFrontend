const MICROS_PER_MILLISECOND = 1000;
const MICROS_PER_SECOND = 1000000;
const MICROS_PER_MINUTE = MICROS_PER_SECOND * 60;
const MICROS_PER_HOUR = MICROS_PER_MINUTE * 60;
const MICROS_PER_DAY = MICROS_PER_HOUR * 24;

function round(n: number): number {
    if (n < 0) {
        return Math.ceil(n);
    } else if (n > 0) {
        return Math.floor(n);
    }

    return 0;
}

export function milliseconds(timeSpanInDouble: number) {
    return round((timeSpanInDouble / MICROS_PER_MILLISECOND) % 60);
}

export function seconds(timeSpanInDouble: number) {
    return round((timeSpanInDouble / MICROS_PER_SECOND) % 60);
}

export function minutes(timeSpanInDouble: number) {
    return round((timeSpanInDouble / MICROS_PER_MINUTE) % 60);
}

export function hours(timeSpanInDouble: number) {
    return round((timeSpanInDouble / MICROS_PER_HOUR) % 24);
}

export function toSeconds(timeSpanInDouble: number) {
    return timeSpanInDouble / MICROS_PER_SECOND;
}

export function toMinutes(timeSpanInDouble: number) {
    return timeSpanInDouble / MICROS_PER_MINUTE;
}

export function toHours(timeSpanInDouble: number) {
    return timeSpanInDouble / MICROS_PER_HOUR;
}