import { BigNumber } from 'bignumber.js'
import { ALLOWED_MULTIPLY_TOKENS, ONLY_MULTIPLY_TOKENS } from 'blockchain/tokensMetadata'
import { useModal } from 'helpers/modalHook'
import { useRedirect } from 'helpers/useRedirect'

import { SelectVaultTypeModal } from './SelectVaultTypeModal'

export function useRedirectToOpenVault() {
  const openModal = useModal()
  const { push } = useRedirect()

  return (ilk: string, token: string, liquidationRatio: BigNumber) => {
    if (ALLOWED_MULTIPLY_TOKENS.includes(token)) {
      return openModal(SelectVaultTypeModal, {
        ilk: ilk,
        token: token,
        liquidationRatio: liquidationRatio,
      })
    }

    if (ONLY_MULTIPLY_TOKENS.includes(token)) {
      push(`/vaults/open-multiply/${ilk}`)
    } else {
      push(`/vaults/open/${ilk}`)
    }
  }
}
