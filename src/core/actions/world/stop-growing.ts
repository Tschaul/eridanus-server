import { Action } from "../action";
import { GameState } from "../../../shared/model/v1/state";
import { updateWorld } from "./update-world";
import { WorldWithOwner } from "../../../shared/model/v1/world";

export function worldStopGrowing(
  worldId: string,
): Action {
  return {
    describe: () => `WorldStopGrowing ${JSON.stringify({ worldId })}`,
    apply: (state: GameState) => {

      return updateWorld<WorldWithOwner, WorldWithOwner>(state, worldId, (oldWorld) => {
        const newWorld = {
          ...oldWorld,
          populationGrowthStatus: { type: 'NOT_GROWING' },
        }
        return newWorld as WorldWithOwner;
      })
    }
  }
}