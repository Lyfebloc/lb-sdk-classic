import { Fetcher } from '../src'
import { ChainId } from '@lyfebloc/lb-sdk-core'

// TODO: replace the provider in these tests
describe('data', () => {
  it('Token', async () => {
    const token = await Fetcher.fetchTokenData(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F') // DAI
    expect(token.decimals).toEqual(18)
  })

  it('Token:CACHE', async () => {
    const token = await Fetcher.fetchTokenData(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599') // WBTC
    expect(token.decimals).toEqual(8)
  })
})
