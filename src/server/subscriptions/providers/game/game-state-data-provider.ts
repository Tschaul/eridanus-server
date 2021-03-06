import { Observable, from, EMPTY } from "rxjs";
import { injectable } from "inversify";
import { map, switchMap, first, filter } from "rxjs/operators";
import { DataProvider } from "../data-provider";
import { VisibilityProjector } from "../../../../core/projectors/visibility-projector";
import { GameStateSubscription } from "../../../../shared/messages/subscriptions/game-subscriptions";
import { GameStateSubscriptionResult } from "../../../../shared/messages/subscriptions/game-subscription-results";
import { ReadonlyStore } from "../../../../core/store";
import { GameRepository } from "../../../repositories/games/games-repository";
import { GameSetupProvider } from "../../../../core/game-setup-provider";
import { GameState } from "../../../../shared/model/v1/state";

@injectable()
export class GameStateDataProvider implements DataProvider {
  authenticationRequired = true;

  constructor(
    private visibility: VisibilityProjector,
    private store: ReadonlyStore,
    private gameRepository: GameRepository,
    private setup: GameSetupProvider
  ){}

  getObservable(subscription: GameStateSubscription, playerId: string): Observable<GameStateSubscriptionResult> {

    return this.gameRepository.getGameInfoByIdAsObservable(this.setup.gameId).pipe(
      first(),
      switchMap(gameInfo => {

        if (gameInfo.state === 'PROPOSED') {
          return EMPTY;
        }

        const playerInfo = gameInfo.players[playerId];

        if (!playerInfo) {
          return EMPTY;
        }

        if (subscription.timestamp) {
          if (!playerInfo.isSpectator && gameInfo.state !== 'ENDED') {
            return EMPTY;
          }

          return this.gameRepository.getGameHistoryEntry(this.setup.gameId, subscription.timestamp).pipe(
            map(state => {
              return {
                type: 'GAME/STATE' as 'GAME/STATE',
                state
              }
            })
          )
        }

        if (gameInfo.state === 'ENDED') {
          return from(this.gameRepository.getGameState(this.setup.gameId)).pipe(
            filter(it => !!it),
            map(state => {
              return {
                type: 'GAME/STATE' as 'GAME/STATE',
                state: state as GameState
              }
            })
          );
        }

        if (playerInfo.isSpectator) {
          return this.store.state$.pipe(
            map(state => {
              return {
                type: 'GAME/STATE' as 'GAME/STATE',
                state
              }
            })
          );
        }

        return this.visibility.visibleUniverseForPlayer(playerId).pipe(
          map(state => {
            return {
              type: 'GAME/STATE' as 'GAME/STATE',
              state
            }
          })
        ) 
      })
    )
  }
}