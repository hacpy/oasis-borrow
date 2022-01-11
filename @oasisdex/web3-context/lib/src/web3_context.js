"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWeb3Context$ = exports.fetchAccountBalances = void 0;
const utils_1 = require("@oasisdex/utils");
const core_1 = require("@web3-react/core");
const network_connector_1 = require("@web3-react/network-connector");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const lodash_1 = require("lodash");
const react_1 = require("react");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const web3_1 = __importDefault(require("web3"));
const connectors_1 = require("@oasisdex/connectors");
const network_1 = require("./network");
async function fetchAccountBalances(accountsLength, connector, daiContractDesc) {
    const provider = await connector.getProvider();
    const web3 = new web3_1.default(provider);
    const accounts = await connector.getAccounts(accountsLength);
    return Promise.all(accounts.map(async (address) => {
        const etherBalance = utils_1.amountFromWei(new bignumber_js_1.default(await web3.eth.getBalance(address)));
        const daiBalanceOfMethod = network_1.contract(web3, daiContractDesc).methods.balanceOf;
        const daiBalance = utils_1.amountFromWei(new bignumber_js_1.default(await daiBalanceOfMethod(address).call()));
        return {
            address: web3_1.default.utils.toChecksumAddress(address),
            daiAmount: daiBalance,
            ethAmount: etherBalance,
        };
    }));
}
exports.fetchAccountBalances = fetchAccountBalances;
function createWeb3Context$(chainIdToRpcUrl, chainIdToDaiContractDesc) {
    const web3Context$ = new rxjs_1.ReplaySubject(1);
    function push(c) {
        web3Context$.next(c);
    }
    function setupWeb3Context$() {
        const context = core_1.useWeb3React();
        const { connector, library, chainId, account, activate, deactivate, active, error } = context;
        const [activatingConnector, setActivatingConnector] = react_1.useState();
        const [connectionKind, setConnectionKind] = react_1.useState();
        const [hwAccount, setHWAccount] = react_1.useState();
        async function connect(connector, connectionKind) {
            setActivatingConnector(connector);
            setConnectionKind(connectionKind);
            setHWAccount(undefined);
            await activate(connector);
        }
        async function connectLedger(chainId, baseDerivationPath) {
            const connector = new connectors_1.LedgerConnector({
                baseDerivationPath,
                chainId,
                url: chainIdToRpcUrl[chainId],
                pollingInterval: 1000,
            });
            await connect(connector, 'ledger');
        }
        react_1.useEffect(() => {
            if (activatingConnector && activatingConnector === connector) {
                setActivatingConnector(undefined);
            }
        }, [activatingConnector, connector]);
        react_1.useEffect(() => {
            if (activatingConnector) {
                push({
                    status: 'connecting',
                    connectionKind: connectionKind,
                });
                return;
            }
            if (error) {
                console.log(error);
                push({
                    status: 'error',
                    error,
                    connect,
                    connectLedger,
                    deactivate,
                });
                return;
            }
            if (!connector) {
                push({
                    status: 'notConnected',
                    connect,
                    connectLedger,
                });
                return;
            }
            if (!account) {
                push({
                    status: 'connectedReadonly',
                    connectionKind: connectionKind,
                    web3: library,
                    chainId: chainId,
                    connect,
                    connectLedger,
                    deactivate,
                });
                return;
            }
            if ((connectionKind === 'ledger' || connectionKind === 'trezor') && !hwAccount) {
                push({
                    status: 'connectingHWSelectAccount',
                    connectionKind,
                    getAccounts: async (accountsLength) => await fetchAccountBalances(accountsLength, connector, chainIdToDaiContractDesc[chainId]),
                    selectAccount: (account) => {
                        setHWAccount(account);
                    },
                    deactivate,
                });
                return;
            }
            if (chainId !== network_1.getNetworkId()) {
                setTimeout(() => {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    connect(new network_connector_1.NetworkConnector({
                        urls: chainIdToRpcUrl,
                        defaultChainId: network_1.getNetworkId(),
                    }), 'network');
                });
                return;
            }
            if (connectionKind) {
                push({
                    status: 'connected',
                    connectionKind,
                    web3: library,
                    chainId: chainId,
                    account: ['ledger', 'trezor'].indexOf(connectionKind) >= 0 ? hwAccount : account,
                    deactivate,
                    magicLinkEmail: undefined,
                });
            }
        }, [
            activatingConnector,
            connectionKind,
            connector,
            library,
            chainId,
            account,
            activate,
            deactivate,
            active,
            error,
            hwAccount,
        ]);
    }
    return [web3Context$.pipe(operators_1.distinctUntilChanged(lodash_1.isEqual)), setupWeb3Context$];
}
exports.createWeb3Context$ = createWeb3Context$;
//# sourceMappingURL=web3_context.js.map