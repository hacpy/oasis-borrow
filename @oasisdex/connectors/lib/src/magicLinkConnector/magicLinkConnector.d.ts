import { AbstractConnector } from '@web3-react/abstract-connector';
import { ConnectorUpdate } from '@web3-react/types';
import { MagicUserMetadata } from 'magic-sdk';
import { NetworkName } from '../types';
interface MagicLinkArguments {
    apiKey: string;
    chainId: number;
    network: NetworkName;
    email: string;
}
export declare class UserRejectedRequestError extends Error {
    constructor();
}
export declare class FailedVerificationError extends Error {
    constructor();
}
export declare class MagicLinkRateLimitError extends Error {
    constructor();
}
export declare class MagicLinkExpiredError extends Error {
    constructor();
}
export declare class MagicLinkConnector extends AbstractConnector {
    private readonly apiKey;
    private readonly chainId;
    private readonly network;
    private readonly email;
    private provider?;
    constructor({ apiKey, chainId, network, email }: MagicLinkArguments);
    activate(): Promise<ConnectorUpdate>;
    getProvider(): Promise<any>;
    getChainId(): Promise<number>;
    getAccount(): Promise<null | string>;
    getMetadata(): Promise<undefined | MagicUserMetadata>;
    getEmail(): string;
    deactivate(): void;
    close(): Promise<void>;
}
export {};
//# sourceMappingURL=magicLinkConnector.d.ts.map