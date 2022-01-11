"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MagicLinkConnector = exports.MagicLinkExpiredError = exports.MagicLinkRateLimitError = exports.FailedVerificationError = exports.UserRejectedRequestError = void 0;
const abstract_connector_1 = require("@web3-react/abstract-connector");
const lodash_1 = require("lodash");
const magic_sdk_1 = require("magic-sdk");
class UserRejectedRequestError extends Error {
    constructor() {
        super();
        this.name = this.constructor.name;
        this.message = 'The user rejected the request.';
    }
}
exports.UserRejectedRequestError = UserRejectedRequestError;
class FailedVerificationError extends Error {
    constructor() {
        super();
        this.name = this.constructor.name;
        this.message = 'The email verification failed.';
    }
}
exports.FailedVerificationError = FailedVerificationError;
class MagicLinkRateLimitError extends Error {
    constructor() {
        super();
        this.name = this.constructor.name;
        this.message = 'The Magic rate limit has been reached.';
    }
}
exports.MagicLinkRateLimitError = MagicLinkRateLimitError;
class MagicLinkExpiredError extends Error {
    constructor() {
        super();
        this.name = this.constructor.name;
        this.message = 'The Magic link has expired.';
    }
}
exports.MagicLinkExpiredError = MagicLinkExpiredError;
class MagicLinkConnector extends abstract_connector_1.AbstractConnector {
    constructor({ apiKey, chainId, network, email }) {
        super({ supportedChainIds: [chainId] });
        this.apiKey = apiKey;
        this.chainId = chainId;
        this.network = network;
        this.email = email;
    }
    async activate() {
        if (!this.provider) {
            this.provider = new magic_sdk_1.Magic(this.apiKey, {
                network: this.network,
            });
        }
        const isLoggedIn = await this.provider.user.isLoggedIn();
        const loggedInEmail = isLoggedIn ? (await this.provider.user.getMetadata()).email : null;
        const emailChanged = loggedInEmail !== this.email;
        if (isLoggedIn && emailChanged) {
            await this.provider.user.logout();
        }
        if (!isLoggedIn || emailChanged) {
            try {
                await this.provider.auth.loginWithMagicLink({ email: this.email });
            }
            catch (err) {
                if (!(err instanceof magic_sdk_1.RPCError)) {
                    throw err;
                }
                if (err.code === magic_sdk_1.RPCErrorCode.MagicLinkFailedVerification) {
                    throw new FailedVerificationError();
                }
                if (err.code === magic_sdk_1.RPCErrorCode.MagicLinkExpired) {
                    throw new MagicLinkExpiredError();
                }
                if (err.code === magic_sdk_1.RPCErrorCode.MagicLinkRateLimited) {
                    throw new MagicLinkRateLimitError();
                }
                // This error gets thrown when users close the login window.
                // -32603 = JSON-RPC InternalError
                if (err.code === -32603) {
                    throw new UserRejectedRequestError();
                }
            }
        }
        const provider = this.provider.rpcProvider;
        const account = await provider.enable().then((accounts) => accounts[0]);
        return { provider: this.provider.rpcProvider, chainId: this.chainId, account };
    }
    async getProvider() {
        return this.provider;
    }
    async getChainId() {
        return this.chainId;
    }
    async getAccount() {
        return this.provider
            ? this.provider.rpcProvider
                .send('eth_accounts')
                .then((accounts) => accounts[0])
            : null;
    }
    async getMetadata() {
        var _a;
        return await ((_a = this.provider) === null || _a === void 0 ? void 0 : _a.user.getMetadata());
    }
    getEmail() {
        return this.email;
    }
    deactivate() {
        lodash_1.noop();
    }
    async close() {
        var _a;
        await ((_a = this.provider) === null || _a === void 0 ? void 0 : _a.user.logout());
        this.emitDeactivate();
    }
}
exports.MagicLinkConnector = MagicLinkConnector;
//# sourceMappingURL=magicLinkConnector.js.map