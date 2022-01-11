import { TxMeta, TxState } from './types';
export declare function deserializeTransactions<A extends TxMeta>(serializedTransactions: string): TxState<A>[];
export declare function serializeTransactions<A extends TxMeta>(transactions: TxState<A>[]): string;
//# sourceMappingURL=serialization.d.ts.map