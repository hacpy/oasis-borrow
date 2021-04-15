import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20'
import { DEFAULT_PROXY_ADDRESS } from 'blockchain/vaults'
import { one, zero } from 'helpers/zero'

import { manageVaultStory } from './ManageVaultBuilder'
import { ManageVaultView } from './ManageVaultView'

const proxyAddress = DEFAULT_PROXY_ADDRESS

export const DepositAndWithdrawAmountsEmpty = manageVaultStory({
  title:
    'If both the deposit and withdraw input fields are empty when editing "Collateral" then we flag the error and block the flow propagating as no vault change would occur',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('3000'),
  },
  proxyAddress,
})

export const PaybackAndWithdrawAmountsEmpty = manageVaultStory({
  title:
    'If both the generate and payback input fields are empty when editing "Dai" then we flag the error and block the flow propagating as no vault change would occur',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('3000'),
  },
  stage: 'daiEditing',
  proxyAddress,
})

export const DepositEmpty = manageVaultStory({
  title:
    'Similar to DepositAndWithdrawAmountsEmpty only that the connected user is not the controller of the vault. At the "Collateral" editing stage they would only be able deposit so we block the flow if no deposit amount is set',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('3000'),
    controller: '0x1',
  },
  account: '0x0',
  proxyAddress,
})

export const PaybackEmpty = manageVaultStory({
  title:
    'Similar to PaybackAndWithdrawAmountsEmpty only that the connected user is not the controller of the vault. At the "Dai" editing stage they would only be able payback so we block the flow if no payback amount is set',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('3000'),
    controller: '0x1',
  },
  stage: 'daiEditing',
  account: '0x0',
  proxyAddress,
})

export const DepositAmountExceedsCollateralBalance = manageVaultStory({
  title:
    'Error is shown where a user is trying to deposit more collateral than they have as balance in their account',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('3000'),
  },
  balanceInfo: { collateralBalance: new BigNumber('5') },
  stage: 'collateralEditing',
  depositAmount: new BigNumber('6'),
  proxyAddress,
})

export const WithdrawAmountExceedsFreeCollateral = manageVaultStory({
  title:
    'Error is shown when a user is trying to withdraw an amount of collateral from the vault which is greater than the amount of collateral which is "free", not backing the outstanding debt in the vault',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('15'),
    debt: new BigNumber('3000'),
  },
  stage: 'collateralEditing',
  withdrawAmount: new BigNumber('8'),
  proxyAddress,
})

export const WithdrawAmountExceedsFreeCollateralAtNextPrice = manageVaultStory({
  title:
    'Error is shown when a user is trying to withdraw an amount of collateral from the vault which at next price update is greater than the amount of collateral which is "free", not backing the outstanding debt in the vault',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('15'),
    debt: new BigNumber('3000'),
  },
  priceInfo: { collateralChangePercentage: new BigNumber('-0.1') },
  stage: 'collateralEditing',
  withdrawAmount: new BigNumber('6'),
  proxyAddress,
})

export const GenerateAmountExceedsDaiYieldFromTotalCollateral = manageVaultStory({
  title:
    'Error is shown when a user is trying to generate an amount of DAI that is greater than the maximum of dai that can be generated from the collateral already locked in the vault and the amount of collateral the user is also depositing',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('15'),
    debt: new BigNumber('3000'),
  },
  stage: 'collateralEditing',
  showDepositAndGenerateOption: true,
  depositAmount: new BigNumber('3'),
  generateAmount: new BigNumber('4000'),
  proxyAddress,
})

export const GenerateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice = manageVaultStory({
  title:
    'Error is shown when a user is trying to generate an amount of DAI that is greater than the maximum of dai at next price update that can be generated from the collateral already locked in the vault and the amount of collateral the user is also depositing',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('15'),
    debt: new BigNumber('3500'),
  },
  priceInfo: {
    collateralChangePercentage: new BigNumber('-0.6'),
  },
  stage: 'collateralEditing',
  showDepositAndGenerateOption: true,
  depositAmount: new BigNumber('30'),
  generateAmount: new BigNumber('4000'),
  proxyAddress,
})

export const VaultWillBeUnderCollateralized = manageVaultStory({
  title:
    'Error is same as Generate Amount Exceeds Dai Yield From Total Collateral only that this exemplifies that it is coupled with Vault Will Be UnderCollateralized error - we can scrutinize to a lower level of detail if necessary',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  stage: 'daiEditing',
  generateAmount: new BigNumber('8000'),
  proxyAddress,
})

export const VaultWillBeUnderCollateralizedAtNextPrice = manageVaultStory({
  title: 'Same as above',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('20'),
    debt: new BigNumber('3000'),
  },
  stage: 'daiEditing',
  generateAmount: new BigNumber('4000'),
  priceInfo: { collateralChangePercentage: new BigNumber('-0.3') },
  proxyAddress,
})

export const GenerateAmountExceedsDebtCeiling = manageVaultStory({
  title:
    'Error is shown where the total debt generated for an ilk is almost at the debt ceiling and the amount of dai the user wants to generate would be greater than the difference. In this example, the user has plenty of collateral in their vault to generate plenty of DAI but is blocked as there is only 1,000 DAI until the ceiling is reached',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('30'),
    debt: new BigNumber('3000'),
  },
  ilkData: { ilkDebt: new BigNumber('15000'), debtCeiling: new BigNumber('16000') },
  stage: 'daiEditing',
  generateAmount: new BigNumber('2000'),
  proxyAddress,
})

export const GenerateAmountLessThanDebtFloor = manageVaultStory({
  title:
    'Error is shown when a user is generating an amount of DAI that would cause the debt outstanding in the vault to be less than the dust limit/debt floor. In more detail, if this vault has a debt of 1999 DAI and the dust limit was 2000 DAI, were the user to generate 1 DAI, then they could proceed',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('10'),
    debt: zero,
  },
  ilkData: { debtFloor: new BigNumber('200') },
  stage: 'daiEditing',
  generateAmount: new BigNumber('1'),
  proxyAddress,
})

export const PaybackAmountExceedsDaiBalance = manageVaultStory({
  title: 'Error occurs when user is trying to pay back more DAI than they have in their wallet',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('50'),
    debt: new BigNumber('9000'),
  },
  balanceInfo: { daiBalance: new BigNumber('5000') },
  stage: 'daiEditing',
  paybackAmount: new BigNumber('6000'),
  proxyAddress,
})

export const PaybackAmountExceedsVaultDebt = manageVaultStory({
  title: 'Error occurs when the user tries to payback more DAI than exists as debt in their vault',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  stage: 'daiEditing',
  paybackAmount: new BigNumber('6000'),
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})

export const PaybackAmountCausesVaultDebtToBeLessThanDebtFloor = manageVaultStory({
  title:
    'Error occurs when the user pays back an amount of DAI which would cause the remaining vault debt to be under the dust limit but not the full amount',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  stage: 'daiEditing',
  paybackAmount: new BigNumber('4000'),
  balanceInfo: { daiBalance: new BigNumber('10000') },
  proxyAddress,
})

export const DepositingAllEthBalance = manageVaultStory({
  title: 'Error occurs when a user with an ETH vault tries to deposit all their ETH into the vault',
  vault: {
    ilk: 'ETH-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  balanceInfo: {
    collateralBalance: new BigNumber('100'),
  },
  stage: 'collateralEditing',
  depositAmount: new BigNumber('100'),
  proxyAddress,
})

export const CustomCollateralAllowanceEmpty = manageVaultStory({
  title: 'Error should block user if the allowance they wish to set is zero',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  stage: 'collateralAllowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  balanceInfo: { daiBalance: new BigNumber('10000') },
  selectedCollateralAllowanceRadio: 'custom',
  collateralAllowanceAmount: undefined,
  proxyAddress,
})

export const CustomCollateralAllowanceAmountGreaterThanMaxUint256 = manageVaultStory({
  title: 'Error should block user if the allowance they wish to set a value above maxUint256',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  stage: 'collateralAllowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  balanceInfo: { daiBalance: new BigNumber('10000') },
  selectedCollateralAllowanceRadio: 'custom',
  collateralAllowanceAmount: maxUint256.plus(one),
  proxyAddress,
})

export const CustomCollateralAllowanceAmountLessThanDepositAmount = manageVaultStory({
  title: 'Error should block user if the allowance they wish to set a value above maxUint256',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  stage: 'collateralAllowanceWaitingForConfirmation',
  depositAmount: new BigNumber('10'),
  balanceInfo: { daiBalance: new BigNumber('10000') },
  collateralAllowanceAmount: new BigNumber('9'),
  selectedCollateralAllowanceRadio: 'custom',
  proxyAddress,
})

export const CustomDaiAllowanceEmpty = manageVaultStory({
  title: 'Error should block user if the allowance they wish to set is zero',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  stage: 'daiAllowanceWaitingForConfirmation',
  paybackAmount: new BigNumber('500'),
  balanceInfo: { daiBalance: new BigNumber('10000') },
  selectedDaiAllowanceRadio: 'custom',
  daiAllowanceAmount: undefined,
  proxyAddress,
})

export const CustomDaiAllowanceAmountGreaterThanMaxUint256 = manageVaultStory({
  title: 'Error should block user if the allowance they wish to set a value above maxUint256',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  stage: 'daiAllowanceWaitingForConfirmation',
  paybackAmount: new BigNumber('500'),
  balanceInfo: { daiBalance: new BigNumber('10000') },
  selectedDaiAllowanceRadio: 'custom',
  daiAllowanceAmount: maxUint256.plus(one),
  proxyAddress,
})

export const CustomDaiAllowanceAmountLessThanDepositAmount = manageVaultStory({
  title: 'Error should block user if the allowance they wish to set a value above maxUint256',
  vault: {
    ilk: 'WBTC-A',
    collateral: new BigNumber('100'),
    debt: new BigNumber('5000'),
  },
  stage: 'daiAllowanceWaitingForConfirmation',
  paybackAmount: new BigNumber('500'),
  balanceInfo: { daiBalance: new BigNumber('10000') },
  selectedDaiAllowanceRadio: 'custom',
  daiAllowanceAmount: new BigNumber('9'),
  proxyAddress,
})

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ManageVault/Errors',
  component: ManageVaultView,
}
