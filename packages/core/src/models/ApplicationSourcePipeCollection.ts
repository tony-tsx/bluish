import { Next } from '../decorators/Next.js'
import { PipeInput } from '../decorators/UsePipe.js'
import { chain } from '../tools/chain.js'
import { MetadataPipeArg } from './MetadataArgsStorage.js'
import { Pipe } from './Pipe.js'

function run(pipe: Pipe, input: PipeInput, next: Next) {
  return pipe.run(input, async value => {
    if (typeof value === 'undefined') return next()

    input.value = value

    return next()
  })
}

export class ApplicationSourcePipeCollection {
  readonly #pipes = new Set<Pipe>()

  readonly #parent: ApplicationSourcePipeCollection | null

  #run!: (next: Next | null, input: PipeInput) => Promise<unknown>

  #flat(): Pipe[] {
    if (this.#parent) return [...this.#parent.#flat(), ...this.#pipes]

    return [...this.#pipes]
  }

  public get length() {
    return this.#pipes.size
  }

  constructor(readonly parent: ApplicationSourcePipeCollection | null) {
    this.#parent = parent
  }

  public add(_pipe: MetadataPipeArg | Pipe) {
    if (_pipe instanceof Pipe) this.#pipes.add(_pipe)
    else this.#pipes.add(new Pipe(_pipe.pipe))
  }

  public async run(input: PipeInput, next: Next) {
    if (!this.#run) this.#run = chain(this.#flat(), run)

    return await this.#run(next, input)
  }
}
