"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSend = exports.getTxHash = exports.isSuccess = exports.isDoneButNotSuccessful = exports.isDone = exports.UnreachableCaseError = void 0;
const _ = __importStar(require("lodash"));
const lodash_1 = require("lodash");
const ramda_1 = require("ramda");
const rxjs_1 = require("rxjs");
const ajax_1 = require("rxjs/ajax");
const operators_1 = require("rxjs/operators");
const serialization_1 = require("./serialization");
const types_1 = require("./types");
const rxjs_take_while_inclusive_1 = require("rxjs-take-while-inclusive");
class UnreachableCaseError extends Error {
    constructor(val) {
        super(`Unreachable case: ${val}`);
    }
}
exports.UnreachableCaseError = UnreachableCaseError;
let txCounter = 1;
function isDone(state) {
    return [types_1.TxStatus.CancelledByTheUser, types_1.TxStatus.Error, types_1.TxStatus.Failure, types_1.TxStatus.Success].includes(state.status);
}
exports.isDone = isDone;
function isDoneButNotSuccessful(state) {
    return [types_1.TxStatus.CancelledByTheUser, types_1.TxStatus.Error, types_1.TxStatus.Failure].indexOf(state.status) >= 0;
}
exports.isDoneButNotSuccessful = isDoneButNotSuccessful;
function isSuccess(state) {
    return types_1.TxStatus.Success === state.status;
}
exports.isSuccess = isSuccess;
function getTxHash(state) {
    if (state.status === types_1.TxStatus.Success ||
        state.status === types_1.TxStatus.Failure ||
        state.status === types_1.TxStatus.Error ||
        state.status === types_1.TxStatus.WaitingForConfirmation) {
        return state.txHash;
    }
    return undefined;
}
exports.getTxHash = getTxHash;
function createExternalNonce2tx(onEveryBlock$, context$, account) {
    return rxjs_1.combineLatest([context$, onEveryBlock$.pipe(operators_1.first()), onEveryBlock$]).pipe(operators_1.switchMap(([context, firstBlock]) => ajax_1.ajax({
        url: `${context.etherscan.apiUrl}?module=account` +
            `&action=txlist` +
            `&address=${account}` +
            `&startblock=${firstBlock}` +
            `&sort=desc` +
            `&apikey=${context.etherscan.apiKey}`,
    })), operators_1.map(({ response }) => response.result), operators_1.map((transactions) => ramda_1.fromPairs(_.map(transactions, (tx) => [tx.nonce, { hash: tx.hash, callData: tx.input }]))), operators_1.catchError((error) => {
        console.error(error);
        return rxjs_1.of({});
    }), operators_1.shareReplay(1));
}
const externalNonce2Tx = lodash_1.memoize(createExternalNonce2tx, (_onEveryBlock$, _context$, account) => account);
function txRebroadcastStatus(account, context$, onEveryBlock$, { hash, nonce, input }) {
    const externalNonce2tx$ = externalNonce2Tx(onEveryBlock$, context$, account);
    return rxjs_1.combineLatest([externalNonce2tx$, onEveryBlock$]).pipe(operators_1.map(([externalNonce2tx]) => {
        if (externalNonce2tx[nonce] && externalNonce2tx[nonce].hash !== hash) {
            return [
                externalNonce2tx[nonce].hash,
                input === externalNonce2tx[nonce].callData
                    ? types_1.TxRebroadcastStatus.speedup
                    : types_1.TxRebroadcastStatus.cancel,
            ];
        }
        return [hash, types_1.TxRebroadcastStatus.lost];
    }));
}
function successOrFailure(onEveryBlock$, context$, txHash, receipt, common, rebroadcast) {
    const end = new Date();
    if (!receipt.status) {
        // TODO: failure should be confirmed!
        return rxjs_1.of(Object.assign(Object.assign({}, common), { txHash,
            receipt,
            end, lastChange: end, blockNumber: receipt.blockNumber, status: types_1.TxStatus.Failure }));
    }
    // TODO: error handling!
    return rxjs_1.combineLatest([context$, onEveryBlock$]).pipe(operators_1.map(([context, blockNumber]) => {
        const x = Object.assign(Object.assign({}, common), { txHash,
            receipt,
            end,
            rebroadcast, lastChange: new Date(), blockNumber: receipt.blockNumber, status: types_1.TxStatus.Success, confirmations: Math.max(0, blockNumber - receipt.blockNumber), safeConfirmations: context.safeConfirmations });
        return x;
    }));
}
function monitorTransaction(account, onEveryBlock$, context$, web3, txHash, broadcastedAt, common) {
    const everySecondUpUntil30Min$ = rxjs_1.timer(0, 1000).pipe(operators_1.takeUntil(rxjs_1.timer(30 * 60 * 1000)));
    const getTransaction = rxjs_1.bindNodeCallback(web3.eth.getTransaction);
    const getTransactionReceipt = rxjs_1.bindNodeCallback(web3.eth.getTransactionReceipt);
    const propagatingTxState = Object.assign(Object.assign({}, common), { broadcastedAt,
        txHash, status: types_1.TxStatus.Propagating });
    const waitingForConfirmationTxState = Object.assign(Object.assign({}, common), { broadcastedAt,
        txHash, status: types_1.TxStatus.WaitingForConfirmation });
    function errorTxState(error) {
        return Object.assign(Object.assign({}, common), { error,
            txHash, end: new Date(), lastChange: new Date(), status: types_1.TxStatus.Error });
    }
    function notEnoughConfirmations(state) {
        return (!isDone(state) ||
            (state.status === types_1.TxStatus.Success && state.confirmations < state.safeConfirmations));
    }
    const txState$ = everySecondUpUntil30Min$.pipe(operators_1.switchMap(() => getTransaction(txHash)), operators_1.filter((transaction) => transaction !== null), operators_1.first(), operators_1.mergeMap((transaction) => txRebroadcastStatus(account, context$, onEveryBlock$, transaction).pipe(operators_1.switchMap(([hash, rebroadcast]) => getTransactionReceipt(hash).pipe(operators_1.filter((receipt) => receipt && !!receipt.blockNumber), operators_1.map((receipt) => [receipt, rebroadcast]))), operators_1.first(), operators_1.mergeMap(([receipt, rebroadcast]) => successOrFailure(onEveryBlock$, context$, receipt.transactionHash, receipt, common, rebroadcast)), rxjs_take_while_inclusive_1.takeWhileInclusive(notEnoughConfirmations), operators_1.startWith(waitingForConfirmationTxState), operators_1.catchError((error) => rxjs_1.of(errorTxState(error))))), operators_1.startWith(propagatingTxState));
    return txState$;
}
function send(onEveryBlock$, context$, change, account, networkId, meta, method) {
    const common = {
        account,
        networkId,
        meta,
        txNo: txCounter += 1,
        start: new Date(),
        lastChange: new Date(),
        dismissed: false,
    };
    const waitingForApprovalTxState = Object.assign(Object.assign({}, common), { status: types_1.TxStatus.WaitingForApproval });
    function cancelledByTheUserTxState(error) {
        return Object.assign(Object.assign({}, common), { error, end: new Date(), lastChange: new Date(), status: types_1.TxStatus.CancelledByTheUser });
    }
    const promiEvent = method();
    const result = context$.pipe(operators_1.first(), operators_1.switchMap(({ web3 }) => rxjs_1.merge(rxjs_1.fromEvent(promiEvent, 'transactionHash'), promiEvent).pipe(operators_1.map((txHash) => [txHash, new Date()]), operators_1.first(), operators_1.mergeMap(([txHash, broadcastedAt]) => monitorTransaction(account, onEveryBlock$, context$, web3, txHash, broadcastedAt, common)), operators_1.startWith(waitingForApprovalTxState), operators_1.catchError((error) => {
        if (error.message.indexOf('User denied transaction signature') === -1) {
            console.error(error);
        }
        return rxjs_1.of(cancelledByTheUserTxState(error));
    }))), operators_1.shareReplay(1));
    result.subscribe((state) => change({ state, kind: 'newTx' }));
    return result;
}
function createTransactions$(account$, context$, onEveryBlock$) {
    const transactionObserver = new rxjs_1.Subject();
    const txs$ = transactionObserver.pipe(operators_1.scan((transactions, change) => {
        switch (change.kind) {
            case 'cachedTx':
            case 'newTx': {
                const newState = change.state;
                const result = [...transactions];
                const i = result.findIndex((t) => t.txNo === newState.txNo);
                if (i >= 0) {
                    result[i] = newState;
                }
                else {
                    result.push(newState);
                }
                return result;
            }
            case 'dismissed': {
                const result = [...transactions];
                const i = result.findIndex((t) => t.txNo === change.txNo);
                result[i].dismissed = true;
                return result;
            }
            default:
                throw new UnreachableCaseError(change);
        }
    }, []), operators_1.shareReplay(1));
    txs$.subscribe(rxjs_1.identity);
    const persistentTxs$ = persist(account$, onEveryBlock$, context$, txs$, change);
    const accountTxs$ = rxjs_1.combineLatest([
        persistentTxs$,
        account$,
        context$,
    ]).pipe(operators_1.map(([txs, account, context]) => txs.filter((t) => t.account === account && t.networkId === context.id)), operators_1.startWith([]), operators_1.shareReplay(1));
    function change(ch) {
        transactionObserver.next(ch);
    }
    return [accountTxs$, change];
}
function sendCurried(onEveryBlock$, context$, change) {
    return (account, networkId, meta, method) => send(onEveryBlock$, context$, change, account, networkId, meta, method);
}
function saveTransactions(transactions) {
    if (transactions.length) {
        localStorage.setItem('transactions', serialization_1.serializeTransactions(transactions));
    }
}
function persist(account$, onEveryBlock$, context$, transactions$, change) {
    return rxjs_1.defer(() => {
        return context$.pipe(operators_1.switchMap(({ web3 }) => {
            return account$.pipe(operators_1.switchMap((account) => {
                const serializedTransactions = localStorage.getItem('transactions');
                if (!serializedTransactions) {
                    return transactions$;
                }
                const deserializedTransactions = serialization_1.deserializeTransactions(serializedTransactions);
                txCounter = deserializedTransactions.reduce((txNo, tx) => (tx.txNo > txNo ? tx.txNo : txNo), txCounter);
                const pendingTransactions$ = rxjs_1.merge(...deserializedTransactions
                    .filter((tx) => tx.status === types_1.TxStatus.WaitingForConfirmation ||
                    tx.status === types_1.TxStatus.Propagating)
                    .map((tx) => tx.status === types_1.TxStatus.WaitingForConfirmation ||
                    tx.status === types_1.TxStatus.Propagating
                    ? monitorTransaction(account, onEveryBlock$, context$, web3, tx.txHash, tx.broadcastedAt, tx)
                    : rxjs_1.of()));
                pendingTransactions$.subscribe((state) => change({ kind: 'cachedTx', state }));
                deserializedTransactions
                    .filter((tx) => tx.status !== types_1.TxStatus.WaitingForConfirmation &&
                    tx.status !== types_1.TxStatus.Propagating)
                    .forEach((state) => change({ kind: 'cachedTx', state }));
                return transactions$;
            }));
        }));
    }).pipe(operators_1.tap(saveTransactions));
}
function createSend(account$, onEveryBlock$, context$) {
    const [transactions$, change] = createTransactions$(account$, context$, onEveryBlock$);
    const zend = sendCurried(onEveryBlock$, context$, change);
    return [zend, transactions$, (txNo) => change({ kind: 'dismissed', txNo })];
}
exports.createSend = createSend;
//# sourceMappingURL=transactions.js.map