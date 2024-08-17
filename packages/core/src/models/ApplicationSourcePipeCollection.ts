import { Pipe } from '../decorators/Pipe.js'
import { chain } from '../tools/chain.js'
import { ApplicationInjection } from './ApplicationInjection.js'
import { MetadataPipeArg } from './MetadataArgsStorage.js'

export class ApplicationSourcePipeCollection extends Set<Pipe> {
  readonly #parent: ApplicationSourcePipeCollection | null

  #run!: (inject: ApplicationInjection) => Promise<unknown>

  #flat(): Pipe[] {
    if (this.#parent) return [...this.#parent.#flat(), ...this]

    return [...this]
  }

  constructor(readonly parent: ApplicationSourcePipeCollection | null) {
    super()
    this.#parent = parent
  }

  public override add(_pipe: MetadataPipeArg | Pipe) {
    if (typeof _pipe === 'function') return super.add(_pipe)
    return super.add(_pipe.pipe)
  }

  public async run(injection: ApplicationInjection) {
    if (!this.#run) this.#run = chain(this.#flat()).bind(null, null)

    await this.#run(injection)
  }
}
