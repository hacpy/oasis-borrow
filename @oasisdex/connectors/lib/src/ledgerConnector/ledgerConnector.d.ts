import { AbstractConnector } from '@web3-react/abstract-connector';
import { ConnectorUpdate } from '@web3-react/types';
import Web3ProviderEngine from 'web3-provider-engine';
interface LedgerConnectorArguments {
    chainId: number;
    url: string;
    pollingInterval?: number;
    requestTimeoutMs?: number;
    accountFetchingConfigs?: any;
    baseDerivationPath?: string;
}
export declare class LedgerConnector extends AbstractConnector {
    private readonly chainId;
    private readonly url;
    private readonly pollingInterval?;
    private readonly requestTimeoutMs?;
    private readonly accountFetchingConfigs?;
    private readonly baseDerivationPath?;
    private provider;
    constructor({ chainId, url, pollingInterval, requestTimeoutMs, accountFetchingConfigs, baseDerivationPath, }: LedgerConnectorArguments);
    activate(): Promise<ConnectorUpdate>;
    getProvider(): Promise<Web3ProviderEngine>;
    getChainId(): Promise<number>;
    getAccount(): Promise<string>;
    getAccounts(accountsLength: number): Promise<string[]>;
    deactivate(): void;
}
export {};
//# sourceMappingURL=ledgerConnector.d.ts.map