"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerConnector = void 0;
const hw_app_eth_1 = __importDefault(require("@ledgerhq/hw-app-eth"));
const hw_transport_webusb_1 = __importDefault(require("@ledgerhq/hw-transport-webusb"));
const abstract_connector_1 = require("@web3-react/abstract-connector");
const web3_provider_engine_1 = __importDefault(require("web3-provider-engine"));
const cache_js_1 = __importDefault(require("web3-provider-engine/subproviders/cache.js"));
const ledgerSubprovider_1 = require("./ledgerSubprovider");
const rpc_subprovider_1 = require("@0x/subproviders/lib/src/subproviders/rpc_subprovider");
async function ledgerEthereumNodeJsClientFactoryAsync() {
    const ledgerConnection = await hw_transport_webusb_1.default.create();
    const ledgerEthClient = new hw_app_eth_1.default(ledgerConnection);
    return ledgerEthClient;
}
class LedgerConnector extends abstract_connector_1.AbstractConnector {
    constructor({ chainId, url, pollingInterval, requestTimeoutMs, accountFetchingConfigs, baseDerivationPath, }) {
        super({ supportedChainIds: [chainId] });
        this.chainId = chainId;
        this.url = url;
        this.pollingInterval = pollingInterval;
        this.requestTimeoutMs = requestTimeoutMs;
        this.accountFetchingConfigs = accountFetchingConfigs;
        this.baseDerivationPath = baseDerivationPath;
    }
    async activate() {
        if (!this.provider) {
            const engine = new web3_provider_engine_1.default({ pollingInterval: this.pollingInterval });
            engine.addProvider(new ledgerSubprovider_1.LedgerSubprovider({
                networkId: this.chainId,
                ledgerEthereumClientFactoryAsync: ledgerEthereumNodeJsClientFactoryAsync,
                accountFetchingConfigs: this.accountFetchingConfigs,
                baseDerivationPath: this.baseDerivationPath,
                onDisconnect: this.emitDeactivate.bind(this),
            }));
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
        return (await this.getAccounts(1))[0];
    }
    async getAccounts(accountsLength) {
        return this.provider._providers[0].getAccountsAsync(accountsLength);
    }
    deactivate() {
        this.provider.stop();
    }
}
exports.LedgerConnector = LedgerConnector;
//# sourceMappingURL=ledgerConnector.js.map