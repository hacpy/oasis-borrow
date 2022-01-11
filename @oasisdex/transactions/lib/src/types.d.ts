import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs';
export interface CommonContext {
    id: string;
    etherscan: {
        apiUrl: string;
        apiKey: string;
    };
    safeConfirmations: number;
    web3: Web3;
}
export declare type TxMeta = {
    kind: any;
    [key: string]: string | number | boolean | BigNumber | undefined;
};
export declare enum TxStatus {
    WaitingForApproval = "WaitingForApproval",
    CancelledByTheUser = "CancelledByTheUser",
    Propagating = "Propagating",
    WaitingForConfirmation = "WaitingForConfirmation",
    Success = "Success",
    Error = "Error",
    Failure = "Failure"
}
export declare enum TxRebroadcastStatus {
    speedup = "speedup",
    cancel = "cancel",
    lost = "lost"
}
export declare type CommonTxState<A extends TxMeta> = {
    account: string;
    txNo: number;
    networkId: string;
    meta: A;
    start: Date;
    end?: Date;
    lastChange: Date;
    dismissed: boolean;
};
export interface WaitingForConfirmationTxState {
    status: TxStatus.WaitingForConfirmation;
    txHash: string;
    broadcastedAt: Date;
}
export interface PropagatingTxState {
    status: TxStatus.Propagating;
    txHash: string;
    broadcastedAt: Date;
}
export interface WaitingForApprovalTxState {
    status: TxStatus.WaitingForApproval;
}
export interface CancelledByTheUserTxState {
    status: TxStatus.CancelledByTheUser;
    error: any;
}
export interface SuccessTxState {
    status: TxStatus.Success;
    txHash: string;
    blockNumber: number;
    receipt: any;
    confirmations: number;
    safeConfirmations: number;
    rebroadcast?: TxRebroadcastStatus;
}
export interface FailureTxState {
    status: TxStatus.Failure;
    txHash: string;
    blockNumber: number;
    receipt: any;
}
export interface ErrorTxState {
    status: TxStatus.Error;
    txHash: string;
    error: any;
}
export declare type TxState<A extends TxMeta> = CommonTxState<A> & (WaitingForConfirmationTxState | PropagatingTxState | WaitingForApprovalTxState | CancelledByTheUserTxState | SuccessTxState | FailureTxState | ErrorTxState);
declare type NodeCallback<I, R> = (i: I, callback: (err: any, r: R) => any) => any;
export interface TransactionReceiptLike {
    transactionHash: string;
    status: boolean;
    blockNumber: number;
}
export declare type GetTransactionReceipt = NodeCallback<string, TransactionReceiptLike>;
export interface TransactionLike {
    hash: string;
    nonce: number;
    input: string;
    blockHash: string;
}
export declare type GetTransaction = NodeCallback<string, TransactionLike | null>;
export interface NewTransactionChange<A extends TxMeta> {
    kind: 'newTx';
    state: TxState<A>;
}
export interface CachedTransactionChange<A extends TxMeta> {
    kind: 'cachedTx';
    state: TxState<A>;
}
export interface DismissedChange {
    kind: 'dismissed';
    txNo: number;
}
export declare type TransactionsChange<A extends TxMeta> = NewTransactionChange<A> | DismissedChange | CachedTransactionChange<A>;
export declare type SendFunction<A extends TxMeta> = (account: string, networkId: string, meta: A, method: (...args: any[]) => any) => Observable<TxState<A>>;
export {};
//# sourceMappingURL=types.d.ts.map