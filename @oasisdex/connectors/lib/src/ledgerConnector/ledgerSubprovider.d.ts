import { LedgerSubproviderConfigs, PartialTxParams } from '@0x/subproviders/lib/src/types';
import { BaseWalletSubprovider } from '@0x/subproviders/lib/src/subproviders/base_wallet_subprovider';
export declare type OnDisconnectCallback = () => void;
export declare class LedgerSubprovider extends BaseWalletSubprovider {
    private readonly _connectionLock;
    private readonly _networkId;
    private _derivationPath;
    private readonly _ledgerEthereumClientFactoryAsync;
    private _ledgerClientIfExists?;
    private readonly _shouldAlwaysAskForConfirmation;
    private chosenAddress?;
    private addressToPathMap;
    private _onDisconnect;
    constructor(config: LedgerSubproviderConfigs & {
        onDisconnect: OnDisconnectCallback;
    });
    getAccountsAsync(accountsLength?: number): Promise<string[]>;
    private static obtainPathComponentsFromDerivationPath;
    signTransactionAsync(txParams: PartialTxParams): Promise<string>;
    signPersonalMessageAsync(data: string, address: string): Promise<string>;
    signTypedDataAsync(_address: string, _typedData: never): Promise<string>;
    private _createLedgerClientAsync;
    private _destroyLedgerClientAsync;
}
//# sourceMappingURL=ledgerSubprovider.d.ts.map