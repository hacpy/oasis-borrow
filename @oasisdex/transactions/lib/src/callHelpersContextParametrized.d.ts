import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs';
import Web3 from 'web3';
import { SendFunction, TxMeta, TxState } from './types';
declare type GasPrice$ = Observable<BigNumber>;
export declare const DEFAULT_GAS = 6000000;
export declare type Context = {
    status: string;
    web3: Web3;
    id: string;
};
export declare type ContextConnected = {
    account: string;
} & Context;
export declare type TxOptions = {
    to?: string;
    value?: string;
    from?: string;
    gas?: number;
};
export declare type ArgsType = Array<string | number | boolean>;
export interface CallDef<A, R, C extends Context> {
    call: (args: A, context: C, account?: string) => any;
    prepareArgs: (args: A, context: C, account?: string) => any[];
    postprocess?: (r: R, a: A) => R;
}
export interface TransactionDef<A extends TxMeta, CC extends ContextConnected> {
    call?: (args: A, context: CC, account?: string) => any;
    prepareArgs: (args: A, context: CC, account?: string) => ArgsType;
    options?: (args: A) => TxOptions;
}
export declare function call<D, R, CC extends ContextConnected>(context: CC, { call, prepareArgs, postprocess }: CallDef<D, R, CC>): (args: D) => Observable<R>;
export declare function estimateGas<A extends TxMeta, CC extends ContextConnected>(context: CC, { call, prepareArgs, options }: TransactionDef<A, CC>, args: A): Observable<number>;
export declare type SendTransactionFunction<A extends TxMeta, CC extends ContextConnected> = <B extends A>(def: TransactionDef<B, CC>, args: B) => Observable<TxState<B>>;
export declare type EstimateGasFunction<A extends TxMeta, CC extends ContextConnected> = <B extends A>(def: TransactionDef<B, CC>, args: B) => Observable<number>;
export declare function createSendTransaction<A extends TxMeta, CC extends ContextConnected>(send: SendFunction<A>, context: CC): SendTransactionFunction<A, CC>;
export declare function createSendWithGasConstraints<A extends TxMeta, CC extends ContextConnected>(send: SendFunction<A>, context: CC, gasPrice$: GasPrice$): <B extends A>(callData: TransactionDef<B, CC>, args: B) => Observable<TxState<B>>;
export {};
//# sourceMappingURL=callHelpersContextParametrized.d.ts.map