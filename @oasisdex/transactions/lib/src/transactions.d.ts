import { Observable } from 'rxjs';
import { CommonContext, TxMeta, TxState, SendFunction } from './types';
export declare class UnreachableCaseError extends Error {
    constructor(val: never);
}
export declare function isDone<A extends TxMeta>(state: TxState<A>): boolean;
export declare function isDoneButNotSuccessful<A extends TxMeta>(state: TxState<A>): boolean;
export declare function isSuccess<A extends TxMeta>(state: TxState<A>): boolean;
export declare function getTxHash<A extends TxMeta>(state: TxState<A>): string | undefined;
export declare function createSend<A extends TxMeta>(account$: Observable<string>, onEveryBlock$: Observable<number>, context$: Observable<CommonContext>): [SendFunction<A>, Observable<TxState<A>[]>, (txNo: number) => void];
//# sourceMappingURL=transactions.d.ts.map