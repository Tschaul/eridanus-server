import { injectable } from "inversify";
import { SocketConnection } from "../socket-connection";
import { GamesListAllSubscription } from "../../../shared/messages/subscriptions";
import { GameListAllSubscriptionResult, MapListFinalSubscriptionResult, RulesListFinalSubscriptionResult } from "../../../shared/messages/subscription-result";
import { shareReplay, map, tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { GameInfo } from "../../../shared/model/v1/game-info";
import { makeId } from "../make-id";
import { GameMap } from "../../../shared/model/v1/game-map";
import { GameRuleSet } from "../../../shared/model/v1/rules";

@injectable()
export class LobbyService {

  constructor(private connection: SocketConnection) {}

  allGames$ = this.connection.subscribe<GamesListAllSubscription, GameListAllSubscriptionResult>({
    type: 'GAME/LIST_ALL'
  }).pipe(
    map(result => result.games),
    shareReplay(1)
  ) as Observable<GameInfo[]>

  getGameInfoById(id: string) {
    return this.allGames$.pipe(
      map(games => games.find(game => game.id === id) || null)
    )
  }

  async createGame(): Promise<string> {
    const id = makeId();
    await this.connection.sendCommand({
      type: 'GAME/CREATE',
      gameId: id
    })
    return id;
  }

  async joinGame(id: string): Promise<void> {
    await this.connection.sendCommand({
      type: 'GAME/JOIN',
      gameId: id
    })
  }

  async readyForGame(id: string): Promise<void> {
    await this.connection.sendCommand({
      type: 'GAME/READY',
      gameId: id
    })
  }

}