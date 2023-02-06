import invariant from 'tiny-invariant'

// import { Currency, ETHER } from './currency'
// import { Token, WETH } from './token'
import { Pair } from './pair'
// import { Price } from './fractions/price'
import { ChainId, Token, Price, Currency } from '@lyfebloc/lb-sdk-core'

export class Route<TInput extends Currency, TOutput extends Currency> {
  public readonly pairs: Pair[]
  public readonly path: Token[]
  public readonly input: TInput
  public readonly output: TOutput
  // public readonly midPrice: Price

  public constructor(pairs: Pair[], input: TInput, output: TOutput) {
    invariant(pairs.length > 0, 'PAIRS')
    const chainId: number = pairs[0].chainId
    invariant(
      pairs.every(pair => pair.chainId === chainId),
      'CHAIN_IDS'
    )
    const wrappedInput = input.wrapped
    invariant(pairs[0].involvesToken(wrappedInput), 'INPUT')
    invariant(typeof output === 'undefined' || pairs[pairs.length - 1].involvesToken(output.wrapped), 'OUTPUT')

    const path: Token[] = [wrappedInput]
    for (const [i, pair] of pairs.entries()) {
      const currentInput = path[i]
      invariant(currentInput.equals(pair.token0) || currentInput.equals(pair.token1), 'PATH')
      const output = currentInput.equals(pair.token0) ? pair.token1 : pair.token0
      path.push(output)
    }

    this.pairs = pairs
    this.path = path
    this.input = input
    this.output = output
  }

  private _midPrice: Price<TInput, TOutput> | null = null
  public get midPrice(): Price<TInput, TOutput> {
    if (this._midPrice !== null) return this._midPrice
    const prices: Price<Currency, Currency>[] = []
    for (const [i, pair] of this.pairs.entries()) {
      prices.push(pair.priceOf(this.path[i]))
    }
    const reduced = prices.slice(1).reduce((accumulator, currentValue) => accumulator.multiply(currentValue), prices[0])
    return (this._midPrice = new Price(this.input, this.output, reduced.denominator, reduced.numerator))
  }

  public get chainId(): ChainId {
    return this.pairs[0].chainId
  }
}
