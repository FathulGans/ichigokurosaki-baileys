import { platform, release } from 'os';
import { proto } from '../../WAProto/index.js';
const PLATFORM_MAP = {
    aix: 'AIX',
    darwin: 'Mac OS',
    win32: 'Windows',
    android: 'Android',
    freebsd: 'FreeBSD',
    openbsd: 'OpenBSD',
    sunos: 'Solaris',
    linux: undefined,
    haiku: undefined,
    cygwin: undefined,
    netbsd: undefined
};
export const Browsers = {
    ubuntu: browser => ['Ubuntu', browser, '22.04.4'],
    macOS: browser => ['Mac OS', browser, '14.4.1'],
    baileys: browser => ['Baileys', browser, '6.5.0'],
    windows: browser => ['Windows', browser, '10.0.22631'],
    /** The appropriate browser based on your OS & release */
    appropriate: browser => [PLATFORM_MAP[platform()] || 'Ubuntu', browser, release()]
};
export const getPlatformId = (browser) => {
    const platformType = proto.DeviceProps.PlatformType[browser.toUpperCase()];
    return platformType ? platformType.toString() : '1'; //chrome
};
export const CompanionWebClientType = {
    UNKNOWN: 0,
    CHROME: 1,
    EDGE: 2,
    FIREFOX: 3,
    IE: 4,
    OPERA: 5,
    SAFARI: 6,
    ELECTRON: 7,
    UWP: 8,
    OTHER_WEB_CLIENT: 9
};
const BROWSER_TO_COMPANION_WEB_CLIENT = {
    Chrome: CompanionWebClientType.CHROME,
    Edge: CompanionWebClientType.EDGE,
    Firefox: CompanionWebClientType.FIREFOX,
    IE: CompanionWebClientType.IE,
    Opera: CompanionWebClientType.OPERA,
    Safari: CompanionWebClientType.SAFARI
};
export const getCompanionWebClientType = ([os, browserName]) => {
    if (browserName === 'Desktop') {
        return os === 'Windows' ? CompanionWebClientType.UWP : CompanionWebClientType.ELECTRON;
    }
    return BROWSER_TO_COMPANION_WEB_CLIENT[browserName] || CompanionWebClientType.OTHER_WEB_CLIENT;
};
export const getCompanionPlatformId = (browser) => {
    return getCompanionWebClientType(browser).toString();
};
export const buildPairingQRData = (ref, noiseKeyB64, identityKeyB64, advB64) => {
    return [ref, noiseKeyB64, identityKeyB64, advB64].join(',');
};
//# sourceMappingURL=browser-utils.js.map