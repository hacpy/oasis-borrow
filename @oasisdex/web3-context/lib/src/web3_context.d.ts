import { Observable } from 'rxjs';
import Web3 from 'web3';
import { LedgerConnector } from '@oasisdex/connectors';
import { ContractDesc } from './network';
import { AccountWithBalances, Web3Context } from './types';
export declare type BalanceOfMethod = (address: string) => {
    call: () => Promise<string>;
};
export declare type BalanceOfCreator = (web3: Web3, chainId: number) => BalanceOfMethod;
export declare function fetchAccountBalances(accountsLength: number, connector: LedgerConnector, daiContractDesc: ContractDesc): Promise<AccountWithBalances[]>;
export declare function createWeb3Context$(chainIdToRpcUrl: {
    [chainId: number]: string;
}, chainIdToDaiContractDesc: {
    [chainId: number]: ContractDesc;
}): [Observable<Web3Context>, () => void];
//# sourceMappingURL=web3_context.d.ts.map