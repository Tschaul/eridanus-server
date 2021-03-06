import { Action } from "../action";
import { GameState } from "../../../shared/model/v1/state";
import { updateWorld } from "./update-world";
import { WorldWithOwner } from "../../../shared/model/v1/world";

export function worldStartMining(
  worldId: string,
  nextMetalMinedTimestamp: number
): Action {
  return {
    describe: () => `WorldStartMining ${JSON.stringify({ worldId, nextMetalMinedTimestamp })}`,
    apply: (state: GameState) => {

      return updateWorld<WorldWithOwner, WorldWithOwner>(state, worldId, (oldWorld) => {
        return {
          ...oldWorld,
          miningStatus: {
            type: 'MINING',
            nextMetalMinedTimestamp,
          }
        }
      })
    }
  }
}