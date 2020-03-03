import { Action } from "../action";
import { GameState } from "../../../shared/model/v1/state";
import { updateWorld } from "./update-world";
import { baseWorld, ReadyWorld, WorldWithOwner, combatAndMiningStatus } from "../../../shared/model/v1/world";

export function worldStopFiring(
  worldId: string,
): Action {
  return {
    describe: () => `WorldStopFiring ${JSON.stringify({ worldId })}`,
    apply: (state: GameState) => {

      return updateWorld<WorldWithOwner, WorldWithOwner>(state, worldId, (oldWorld) => {
        const newWorld = {
          ...oldWorld,
          combatStatus: 'AT_PEACE',
        }

        if ('weaponsReadyTimestamp' in newWorld) {
          delete newWorld.weaponsReadyTimestamp;
        }

        return newWorld as WorldWithOwner;
      })
    }
  }
}