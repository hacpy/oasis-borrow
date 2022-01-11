"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerSubprovider = void 0;
const assert_1 = require("@0x/assert");
const utils_1 = require("@0x/utils");
const ethereumjs_tx_1 = require("ethereumjs-tx");
const ethereumjs_util_1 = require("ethereumjs-util");
const ethjs_util_1 = require("ethjs-util");
const hdkey_1 = __importDefault(require("hdkey"));
const semaphore_async_await_1 = require("semaphore-async-await");
const base_wallet_subprovider_1 = require("@0x/subproviders/lib/src/subproviders/base_wallet_subprovider");
const types_1 = require("@0x/subproviders/lib/src/types");
const DEFAULT_BASE_DERIVATION_PATH = `44'/60'/0'`;
const ASK_FOR_ON_DEVICE_CONFIRMATION = false;
const DEFAULT_NUM_ADDRESSES_TO_FETCH = 5;
const ledgerLiveRegex = /^(44'\/(?:1|60|61)'\/)(\d+)('?)$/;
class LedgerSubprovider extends base_wallet_subprovider_1.BaseWalletSubprovider {
    constructor(config) {
        super();
        this._connectionLock = new semaphore_async_await_1.Lock();
        this.addressToPathMap = {};
        this._onDisconnect = config.onDisconnect;
        this._networkId = config.networkId;
        this._ledgerEthereumClientFactoryAsync = config.ledgerEthereumClientFactoryAsync;
        this._derivationPath = config.baseDerivationPath || DEFAULT_BASE_DERIVATION_PATH;
        this._shouldAlwaysAskForConfirmation =
            config.accountFetchingConfigs !== undefined &&
                config.accountFetchingConfigs.shouldAskForOnDeviceConfirmation !== undefined
                ? config.accountFetchingConfigs.shouldAskForOnDeviceConfirmation
                : ASK_FOR_ON_DEVICE_CONFIRMATION;
    }
    async getAccountsAsync(accountsLength = DEFAULT_NUM_ADDRESSES_TO_FETCH) {
        this._ledgerClientIfExists = await this._createLedgerClientAsync();
        try {
            const eth = this._ledgerClientIfExists;
            const addresses = [];
            if (this._derivationPath.match(ledgerLiveRegex)) {
                for (let i = 0; i < accountsLength; i++) {
                    const newPath = this._derivationPath.replace(ledgerLiveRegex, (_, g1, g2, g3) => g1 + String(parseInt(g2) + i) + g3) + '/0/0';
                    const { address } = await eth.getAddress(newPath, this._shouldAlwaysAskForConfirmation, true);
                    addresses.push(address);
                    this.addressToPathMap[address.toLowerCase()] = newPath;
                }
            }
            else {
                const pathComponents = LedgerSubprovider.obtainPathComponentsFromDerivationPath(this._derivationPath);
                const addressGenerator = new AddressGenerator(await eth.getAddress(pathComponents.basePath, this._shouldAlwaysAskForConfirmation, true));
                for (let i = 0; i < accountsLength; i++) {
                    const path = pathComponents.basePath + (pathComponents.index + i).toString();
                    const address = addressGenerator.getAddressString(i);
                    addresses.push(address);
                    this.addressToPathMap[address.toLowerCase()] = path;
                }
            }
            return addresses;
        }
        finally {
            await this._destroyLedgerClientAsync();
        }
    }
    static obtainPathComponentsFromDerivationPath(derivationPath) {
        // check if derivation path follows 44'/60'/x'/n pattern
        const regExp = /^(44'\/(?:1|60|61)'\/\d+'?\/(?:\d+'?\/)?)(\d+)$/;
        const matchResult = regExp.exec(derivationPath);
        if (matchResult === null) {
            throw new Error('invalid derivation path');
        }
        return { basePath: matchResult[1], index: parseInt(matchResult[2], 10) };
    }
    async signTransactionAsync(txParams) {
        LedgerSubprovider._validateTxParams(txParams);
        if (txParams.from === undefined || !utils_1.addressUtils.isAddress(txParams.from)) {
            throw new Error(types_1.WalletSubproviderErrors.FromAddressMissingOrInvalid);
        }
        if (this.chosenAddress) {
            txParams.from = this.chosenAddress;
        }
        const path = this.addressToPathMap[txParams.from.toLowerCase()];
        if (!path)
            throw new Error(`address unknown '${txParams.from}'`);
        this._ledgerClientIfExists = await this._createLedgerClientAsync();
        const tx = new ethereumjs_tx_1.Transaction(txParams, { chain: this._networkId });
        // Set the EIP155 bits
        const vIndex = 6;
        tx.raw[vIndex] = Buffer.from([this._networkId]); // v
        const rIndex = 7;
        tx.raw[rIndex] = Buffer.from([]); // r
        const sIndex = 8;
        tx.raw[sIndex] = Buffer.from([]); // s
        const txHex = tx.serialize().toString('hex');
        try {
            const result = await this._ledgerClientIfExists.signTransaction(path, txHex);
            // Store signature in transaction
            tx.r = Buffer.from(result.r, 'hex');
            tx.s = Buffer.from(result.s, 'hex');
            tx.v = Buffer.from(result.v, 'hex');
            // EIP155: v should be chain_id * 2 + {35, 36}
            const eip55Constant = 35;
            const signedChainId = Math.floor((tx.v[0] - eip55Constant) / 2);
            if (signedChainId !== this._networkId) {
                await this._destroyLedgerClientAsync();
                const err = new Error(types_1.LedgerSubproviderErrors.TooOldLedgerFirmware);
                throw err;
            }
            const signedTxHex = `0x${tx.serialize().toString('hex')}`;
            await this._destroyLedgerClientAsync();
            return signedTxHex;
        }
        catch (err) {
            await this._destroyLedgerClientAsync();
            throw err;
        }
    }
    async signPersonalMessageAsync(data, address) {
        if (data === undefined) {
            throw new Error(types_1.WalletSubproviderErrors.DataMissingForSignPersonalMessage);
        }
        assert_1.assert.isHexString('data', data);
        assert_1.assert.isETHAddressHex('address', address);
        const path = this.addressToPathMap[address.toLowerCase()];
        if (!path)
            throw new Error(`address unknown '${address}'`);
        this._ledgerClientIfExists = await this._createLedgerClientAsync();
        try {
            const result = await this._ledgerClientIfExists.signPersonalMessage(path, ethjs_util_1.stripHexPrefix(data));
            const lowestValidV = 27;
            const v = result.v - lowestValidV;
            const hexBase = 16;
            let vHex = v.toString(hexBase);
            if (vHex.length < 2) {
                vHex = `0${v}`;
            }
            const signature = `0x${result.r}${result.s}${vHex}`;
            await this._destroyLedgerClientAsync();
            return signature;
        }
        catch (err) {
            await this._destroyLedgerClientAsync();
            throw err;
        }
    }
    // tslint:disable-next-line:prefer-function-over-method
    async signTypedDataAsync(_address, _typedData) {
        throw new Error(types_1.WalletSubproviderErrors.MethodNotSupported);
    }
    async _createLedgerClientAsync() {
        var _a;
        await this._connectionLock.acquire();
        if (this._ledgerClientIfExists !== undefined) {
            this._connectionLock.release();
            throw new Error(types_1.LedgerSubproviderErrors.MultipleOpenConnectionsDisallowed);
        }
        const ledgerEthereumClient = await this._ledgerEthereumClientFactoryAsync();
        ledgerEthereumClient.transport.on('disconnect', (_a = this._onDisconnect) === null || _a === void 0 ? void 0 : _a.bind(this));
        this._connectionLock.release();
        return ledgerEthereumClient;
    }
    async _destroyLedgerClientAsync() {
        await this._connectionLock.acquire();
        if (this._ledgerClientIfExists === undefined) {
            this._connectionLock.release();
            return;
        }
        await this._ledgerClientIfExists.transport.close();
        this._ledgerClientIfExists = undefined;
        this._connectionLock.release();
    }
}
exports.LedgerSubprovider = LedgerSubprovider;
class AddressGenerator {
    constructor(data) {
        this.getAddressString = (index) => {
            const derivedKey = this.hdk.derive(`m/${index}`);
            const address = ethereumjs_util_1.publicToAddress(derivedKey.publicKey, true);
            const addressString = '0x' + address.toString('hex');
            return addressString;
        };
        this.hdk = new hdkey_1.default();
        this.hdk.publicKey = Buffer.from(data.publicKey, 'hex');
        this.hdk.chainCode = Buffer.from(data.chainCode, 'hex');
    }
}
//# sourceMappingURL=ledgerSubprovider.js.map