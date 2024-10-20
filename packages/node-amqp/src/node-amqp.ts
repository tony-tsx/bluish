import { actionDecoratorFactory, Application, Context } from '@bluish/core'
import amqplib from 'amqplib'

export class NodeAmqpChannelMessageContext extends Context {
  constructor(
    public readonly message: amqplib.ConsumeMessage,
    public readonly channel: amqplib.Channel,
  ) {
    super()
  }
}

export interface NodeAmqpQueueOptions {
  queue: string
  channel?: amqplib.Channel | 'isolated'
  assert?: boolean | amqplib.Options.AssertQueue
  consume?: amqplib.Options.Consume
}

export const NodeAmqpQueue = actionDecoratorFactory<
  NodeAmqpChannelMessageContext,
  NodeAmqpQueueOptions
>({
  context: NodeAmqpChannelMessageContext,
  input: context => context.message,
})

export interface NodeAmqpOptions extends amqplib.Options.Connect {
  application: Application
  url?: string
  connection?: amqplib.Connection
  channel?: amqplib.Channel | 'by-queue' | 'isolated'
  assert?: boolean | amqplib.Options.AssertQueue
  consume?: amqplib.Options.Consume
}

export class NodeAmqp {
  #channelByQueue = new Map<string, amqplib.Channel>()
  #channel: amqplib.Channel | null = null
  #connection: amqplib.Connection | null = null

  public readonly application!: Application

  constructor(public readonly options: NodeAmqpOptions) {
    this.application = options.application
  }

  private async getConnection() {
    if (this.options.connection) return this.options.connection

    if (!this.#connection) {
      if (this.options.url)
        this.#connection = await amqplib.connect(this.options.url)
      else this.#connection = await amqplib.connect(this.options)
    }

    return this.#connection
  }

  private async getChannel(options: NodeAmqpQueueOptions) {
    if (this.options.channel === 'isolated') {
      const connection = await this.getConnection()

      const channel = await connection.createChannel()

      const assert = options.assert ?? this.options.assert

      if (!assert) return channel

      if (assert === true) await channel.assertQueue(options.queue)
      else channel.assertQueue(options.queue, assert)

      return channel
    }

    if (this.options.channel === 'by-queue') {
      if (!this.#channelByQueue.has(options.queue)) {
        const connection = await this.getConnection()

        this.#channelByQueue.set(
          options.queue,
          await connection.createChannel(),
        )
      }

      return this.#channelByQueue.get(options.queue)!
    }

    if (!this.#channel) {
      const connection = await this.getConnection()

      this.#channel = await connection.createChannel()
    }

    return this.#channel
  }

  public async bootstrap() {
    const actions = this.application.actions.filterByContext(
      NodeAmqpChannelMessageContext,
    )

    for (const action of actions) {
      const options = action._action.options as NodeAmqpQueueOptions

      if (!options) throw new TypeError()

      if (!options.queue) throw new TypeError()

      const channel = await this.getChannel(options)

      await channel.consume(
        options.queue,
        async message => {
          if (!message) return

          action
            .run(new NodeAmqpChannelMessageContext(message, channel))
            .then(() => channel.ack(message))
            .catch(() => channel.nack(message))
        },
        options.consume ?? this.options.consume,
      )
    }
  }
}
