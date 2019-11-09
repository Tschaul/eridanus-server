import 'reflect-metadata';
import { Container, injectable } from "inversify";
import { CommandHandler } from "./commands/command-handler";
import { SubscriptionHandler } from "./subscriptions/subscription-handler";
import { Clock } from "../core/infrastructure/clock";
import { Logger } from "../core/infrastructure/logger";
import { RandomNumberGenerator } from "../core/infrastructure/random-number-generator";
import { Store, ReadonlyStore } from "../core/store";
import { Game } from "../core/game";
import { registerEventQueues } from "../core/events/register-queues";
import { registerProjectors } from "../core/projectors/register-projectors";
import { registerGlobalDataProviders } from "./subscriptions/providers/register-data-providers";
import { GameSetupProvider } from "../core/game-setup-provider";
import { registerCommandExecutors } from './commands/executors/register-command-executors';

@injectable()
export class ContainerRegistry {

  public globalContainer: Container;
  private containersByGameId = new Map<string, Container>();

  constructor() {

    this.globalContainer = new Container({
      defaultScope: "Singleton"
    });

    this.globalContainer.bind(CommandHandler).toSelf();
    this.globalContainer.bind(SubscriptionHandler).toSelf();

    registerGlobalDataProviders(this.globalContainer);
  }

  public getContainerByGameId(gameId: string | null | undefined): Container {

    if (!gameId) {
      return this.globalContainer;
    }

    if (this.containersByGameId.has(gameId)) {

      return this.containersByGameId.get(gameId) as Container;

    } else {

      const container = new Container({
        defaultScope: "Singleton",
      });

      container.parent = this.globalContainer;

      container.bind(Clock).toConstantValue(new Clock(new Date().getTime()));
      container.bind(Logger).toSelf();
      container.bind(RandomNumberGenerator).toSelf();
      container.bind(Store).toSelf();
      container.bind(ReadonlyStore).toSelf();
      container.bind(Game).toSelf();
      container.bind(GameSetupProvider).toSelf();

      const setup =  container.get(GameSetupProvider);

      setup.gameId = gameId;

      registerCommandExecutors(container);
      registerEventQueues(container);
      registerProjectors(container);

      this.containersByGameId.set(gameId, container);

      return container;
    }
  }

}