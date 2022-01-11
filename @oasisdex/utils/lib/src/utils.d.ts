import { BigNumber } from 'bignumber.js';
export declare function amountFromWei(amount: BigNumber, precision?: number): BigNumber;
export declare function amountToWei(amount: BigNumber, precision?: number): BigNumber;
export declare function eth2weth(token: string): string;
export declare function weth2eth(token: string): string;
export declare function padLeft(str: string, chars: number, sign?: string): string;
export declare const nullAddress = "0x0000000000000000000000000000000000000000";
export declare function storageHexToBigNumber(uint256: string): [BigNumber, BigNumber];
export declare function localStorageStoreDict(dict: {
    [index: string]: boolean;
}, key: string): void;
export declare function localStorageGetDict(key: string): any;
//# sourceMappingURL=utils.d.ts.map