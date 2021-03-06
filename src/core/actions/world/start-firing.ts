import { Action } from "../action";
import { GameState } from "../../../shared/model/v1/state";
import { updateWorld } from "./update-world";
import { WorldWithOwner } from "../../../shared/model/v1/world";

export function worldStartFiring(
  worldId: string,
  weaponsReadyTimestamp: number
): Action {
  return {
    describe: () => `WorldStartFiring ${JSON.stringify({ worldId,weaponsReadyTimestamp })}`,
    apply: (state: GameState) => {

      return updateWorld<WorldWithOwner, WorldWithOwner>(state, worldId, (oldWorld) => {
        return {
          ...oldWorld,
          combatStatus: {
            type: 'FIRING',
            weaponsReadyTimestamp
          }
        }
      })
    }
  }
}