"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localStorageGetDict = exports.localStorageStoreDict = exports.storageHexToBigNumber = exports.nullAddress = exports.padLeft = exports.weth2eth = exports.eth2weth = exports.amountToWei = exports.amountFromWei = void 0;
const bignumber_js_1 = require("bignumber.js");
function amountFromWei(amount, precision = 18) {
    return amount.div(new bignumber_js_1.BigNumber(10).pow(precision));
}
exports.amountFromWei = amountFromWei;
function amountToWei(amount, precision = 18) {
    return amount.times(new bignumber_js_1.BigNumber(10).pow(precision));
}
exports.amountToWei = amountToWei;
function eth2weth(token) {
    return token.replace(/^ETH/, 'WETH');
}
exports.eth2weth = eth2weth;
function weth2eth(token) {
    return token.replace(/^WETH/, 'ETH');
}
exports.weth2eth = weth2eth;
function padLeft(str, chars, sign) {
    return Array(chars - str.length + 1).join(sign || '0') + str;
}
exports.padLeft = padLeft;
exports.nullAddress = '0x0000000000000000000000000000000000000000';
function storageHexToBigNumber(uint256) {
    const match = uint256.match(/^0x(\w+)$/);
    if (!match) {
        throw new Error(`invalid uint256: ${uint256}`);
    }
    return match[0].length <= 32
        ? [new bignumber_js_1.BigNumber(0), new bignumber_js_1.BigNumber(uint256)]
        : [
            new bignumber_js_1.BigNumber(`0x${match[0].substr(0, match[0].length - 32)}`),
            new bignumber_js_1.BigNumber(`0x${match[0].substr(match[0].length - 32, 32)}`),
        ];
}
exports.storageHexToBigNumber = storageHexToBigNumber;
function localStorageStoreDict(dict, key) {
    localStorage === null || localStorage === void 0 ? void 0 : localStorage.setItem(key, JSON.stringify(dict));
}
exports.localStorageStoreDict = localStorageStoreDict;
function localStorageGetDict(key) {
    var _a;
    const dict = (_a = localStorage === null || localStorage === void 0 ? void 0 : localStorage.getItem(key)) !== null && _a !== void 0 ? _a : '{}';
    return JSON.parse(dict);
}
exports.localStorageGetDict = localStorageGetDict;
//# sourceMappingURL=utils.js.map