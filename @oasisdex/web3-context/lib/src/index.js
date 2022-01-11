"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAccountBalances = exports.createWeb3Context$ = exports.getNetworkName = exports.getNetworkId = exports.contract = void 0;
var network_1 = require("./network");
Object.defineProperty(exports, "contract", { enumerable: true, get: function () { return network_1.contract; } });
Object.defineProperty(exports, "getNetworkId", { enumerable: true, get: function () { return network_1.getNetworkId; } });
Object.defineProperty(exports, "getNetworkName", { enumerable: true, get: function () { return network_1.getNetworkName; } });
var web3_context_1 = require("./web3_context");
Object.defineProperty(exports, "createWeb3Context$", { enumerable: true, get: function () { return web3_context_1.createWeb3Context$; } });
Object.defineProperty(exports, "fetchAccountBalances", { enumerable: true, get: function () { return web3_context_1.fetchAccountBalances; } });
//# sourceMappingURL=index.js.map