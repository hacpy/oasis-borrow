"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSendWithGasConstraints = exports.createSendTransaction = exports.estimateGas = exports.call = exports.DEFAULT_GAS = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/internal/operators");
exports.DEFAULT_GAS = 6000000;
function call(context, { call, prepareArgs, postprocess }) {
    return (args) => {
        return rxjs_1.from(call(args, context)(...prepareArgs(args, context)).call(context.status === 'connected' ? { from: context.account } : {})).pipe(operators_1.map((i) => (postprocess ? postprocess(i, args) : i)));
    };
}
exports.call = call;
// we accommodate for the fact that blockchain state
// can be different when tx execute and it can take more gas
const GAS_ESTIMATION_MULTIPLIER = 1.5;
function estimateGas(context, { call, prepareArgs, options }, args) {
    const result = rxjs_1.from((call
        ? call(args, context, context.status === 'connected' ? context.account : undefined)(...prepareArgs(args, context, context.account))
        : context.web3.eth).estimateGas(Object.assign({ from: context.account }, (options ? options(args) : {})))).pipe(operators_1.map((e) => {
        return Math.floor(e * GAS_ESTIMATION_MULTIPLIER);
    }));
    return result;
}
exports.estimateGas = estimateGas;
function createSendTransaction(send, context) {
    return ({ call, prepareArgs, options }, args) => {
        return send(context.account, context.id, args, () => call
            ? call(args, context, context.account)(...prepareArgs(args, context, context.account)).send(Object.assign({ from: context.account }, (options ? options(args) : {})))
            : context.web3.eth.sendTransaction(Object.assign({ from: context.account }, (options ? options(args) : {}))));
    };
}
exports.createSendTransaction = createSendTransaction;
function createSendWithGasConstraints(send, context, gasPrice$) {
    return (callData, args) => {
        return rxjs_1.combineLatest(estimateGas(context, callData, args), gasPrice$).pipe(operators_1.first(), operators_1.switchMap(([gas, gasPrice]) => {
            return createSendTransaction(send, context)(Object.assign(Object.assign({}, callData), { options: (args1) => (Object.assign(Object.assign({}, (callData.options ? callData.options(args1) : {})), { gas,
                    gasPrice })) }), args);
        }));
    };
}
exports.createSendWithGasConstraints = createSendWithGasConstraints;
//# sourceMappingURL=callHelpersContextParametrized.js.map