import { Action } from "../action";
import { GameState } from "../../../shared/model/v1/state";
import { updateWorld } from "./update-world";
import { baseWorld, ReadyWorld, WorldWithOwner, combatCaptureAndMiningStatus, worldWithOwnerBase } from "../../../shared/model/v1/world";

export function worldReady(
  worldId: string,
): Action {
  return {
    describe: () => `WorldReady ${JSON.stringify({ worldId })}`,
    apply: (state: GameState) => {

      return updateWorld<WorldWithOwner, ReadyWorld>(state, worldId, (oldWorld) => {
        return {
          ...worldWithOwnerBase(oldWorld),
          status: 'READY',
          ownerId: oldWorld.ownerId,
        }
      })
    }
  }
}