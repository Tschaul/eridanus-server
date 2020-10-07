import { Action } from "../action";
import { GameState } from "../../../shared/model/v1/state";
import { ReadyWorld, BuildingShipsWorld, worldWithOwnerBase } from "../../../shared/model/v1/world";
import { updateWorld } from "./update-world";

export function buildShips(
  worldId: string,
  readyTimestamp: number,
  amount: number,
  activeIndustry: number
): Action {
  return {
    describe: () => `BuildShips ${JSON.stringify({ worldId, readyTimestamp, amount, activeIndustry })}`,
    apply: (state: GameState) => {

      return updateWorld<ReadyWorld, BuildingShipsWorld>(state, worldId, (oldWorld) => {
        console.log(oldWorld)
        return {
          ...worldWithOwnerBase(oldWorld),
          status: 'BUILDING_SHIPS',
          readyTimestamp: readyTimestamp,
          ownerId: oldWorld.ownerId,
          buildingShipsAmount: amount,
          buildingShipsActiveIndustry: activeIndustry
          
        }
      })
    }
  }
}
