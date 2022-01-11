"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TxRebroadcastStatus = exports.TxStatus = void 0;
var TxStatus;
(function (TxStatus) {
    TxStatus["WaitingForApproval"] = "WaitingForApproval";
    TxStatus["CancelledByTheUser"] = "CancelledByTheUser";
    TxStatus["Propagating"] = "Propagating";
    TxStatus["WaitingForConfirmation"] = "WaitingForConfirmation";
    TxStatus["Success"] = "Success";
    TxStatus["Error"] = "Error";
    TxStatus["Failure"] = "Failure";
})(TxStatus = exports.TxStatus || (exports.TxStatus = {}));
var TxRebroadcastStatus;
(function (TxRebroadcastStatus) {
    TxRebroadcastStatus["speedup"] = "speedup";
    TxRebroadcastStatus["cancel"] = "cancel";
    TxRebroadcastStatus["lost"] = "lost";
})(TxRebroadcastStatus = exports.TxRebroadcastStatus || (exports.TxRebroadcastStatus = {}));
//# sourceMappingURL=types.js.map