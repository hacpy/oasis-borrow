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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrezorConnector = void 0;
const abstract_connector_1 = require("@web3-react/abstract-connector");
const web3_provider_engine_1 = __importDefault(require("web3-provider-engine"));
const cache_js_1 = __importDefault(require("web3-provider-engine/subproviders/cache.js"));
const trezorSubprovider_1 = require("./trezorSubprovider"); // https://github.com/0xProject/0x-monorepo/issues/1400
const rpc_subprovider_1 = require("@0x/subproviders/lib/src/subproviders/rpc_subprovider");
class TrezorConnector extends abstract_connector_1.AbstractConnector {
    constructor({ chainId, url, pollingInterval, requestTimeoutMs, config = {}, manifestEmail, manifestAppUrl, }) {
        super({ supportedChainIds: [chainId] });
        this.chainId = chainId;
        this.url = url;
        this.pollingInterval = pollingInterval;
        this.requestTimeoutMs = requestTimeoutMs;
        this.config = config;
        this.manifestEmail = manifestEmail;
        this.manifestAppUrl = manifestAppUrl;
    }
    async activate() {
        if (!this.provider) {
            const { default: TrezorConnect } = await Promise.resolve().then(() => __importStar(require('trezor-connect')));
            TrezorConnect.manifest({
                email: this.manifestEmail,
                appUrl: this.manifestAppUrl,
            });
            const engine = new web3_provider_engine_1.default({ pollingInterval: this.pollingInterval });
            engine.addProvider(new trezorSubprovider_1.TrezorSubprovider(Object.assign({ trezorConnectClientApi: TrezorConnect }, this.config)));
            engine.addProvider(new cache_js_1.default());
            engine.addProvider(new rpc_subprovider_1.RPCSubprovider(this.url, this.requestTimeoutMs));
            this.provider = engine;
        }
        this.provider.start();
        return { provider: this.provider, chainId: this.chainId };
    }
    async getProvider() {
        return this.provider;
    }
    async getChainId() {
        return this.chainId;
    }
    async getAccount() {
        return this.provider._providers[0]
            .getAccountsAsync(1)
            .then((accounts) => accounts[0]);
    }
    async getAccounts(accountsLength) {
        return this.provider._providers[0].getAccountsAsync(accountsLength);
    }
    deactivate() {
        this.provider.stop();
    }
}
exports.TrezorConnector = TrezorConnector;
//# sourceMappingURL=trezorConnector.js.map