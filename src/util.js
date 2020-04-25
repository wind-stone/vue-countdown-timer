const ua = navigator.userAgent;
const camelizeRE = /-(\w)/g;

export function camelize(str) {
    return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '');
}

export function isIOS() {
    return !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
}

export function getCurrentTime() {
    return Date.now();
}
