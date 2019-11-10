import { Action } from "../action";
import { State } from "../../state";
import { updateFleet } from "./update-fleet";
import { baseFleet, FleetAtWorld, LostFleet } from "../../model/fleet";

export function looseFleet(
  fleetId: string,
): Action {
  return {
    describe: () => `LooseFleet ${JSON.stringify({ fleetId })}`,
    apply: (state: State) => {

      return updateFleet<FleetAtWorld, LostFleet>(state, fleetId, (oldFleet) => {
        return {
          ...baseFleet(oldFleet),
          currentWorldId: oldFleet.currentWorldId,
          status: 'LOST',
        }
      })
    }
  }
}