import { injectable } from "inversify";
import { GameEventQueue, GameEvent } from "../event";
import { Observable, combineLatest } from "rxjs";
import { FleetProjector } from "../../projectors/fleet-projector";
import { TransferingCargoFleet } from "../../../shared/model/v1/fleet";
import { map } from "rxjs/operators";
import { giveOrTakeWorldMetal } from "../../actions/world/give-or-take-metal";
import { giveOrTakeWorldPopulation } from "../../actions/world/give-or-take-population";
import { waitForCargo } from "../../actions/fleet/wait-for-cargo";
import { fleetReady } from "../../actions/fleet/fleet-ready";
import { WorldProjector } from "../../projectors/world-projector";
import { worldHasOwner } from "../../../shared/model/v1/world";
import { transferCargoToWorld } from "../../actions/fleet/transfer-cargo-to-world";
import { GameSetupProvider } from "../../game-setup-provider";
import { Action } from "../../actions/action";
import { captureWorld } from "../../actions/world/capture";
import { arrivesAtEndpoint, nextDestinationOfRoute } from "./cargo-route-helpers";

@injectable()
export class EndTransferingCargoEventQueue implements GameEventQueue {

  public upcomingEvent$: Observable<GameEvent | null>;

  constructor(
    private readonly fleets: FleetProjector,
    private readonly worlds: WorldProjector,
    private setup: GameSetupProvider
  ) {

    const nextArrivingTransferingCargoFleet$ = this.fleets.firstByStatusAndTimestamp<TransferingCargoFleet>('TRANSFERING_CARGO', 'arrivingTimestamp')

    this.upcomingEvent$ = combineLatest([
      nextArrivingTransferingCargoFleet$,
      this.worlds.byId$
    ]).pipe(
      map(([fleet, worldsById]) => {
        if (!fleet) {
          return null
        } else {
          return {
            timestamp: fleet.arrivingTimestamp,
            happen: () => {

              const world = worldsById[fleet.toWorldId]

              if (worldHasOwner(world) && world.ownerId !== fleet.ownerId && fleet.ownerId !== '@defeated') {

                const arrivingTimestamp = fleet.arrivingTimestamp + this.setup.rules.warping.warpToWorldDelay;

                return [
                  transferCargoToWorld(fleet.id, arrivingTimestamp, fleet.cargoMetal, fleet.cargoPopulation, fleet.fromWorldId, fleet.cargoRoute)
                ]
              }

              if (arrivesAtEndpoint(fleet.fromWorldId, fleet.toWorldId, fleet.cargoRoute)) {

                let captureAction: Action[] = []

                if (!worldHasOwner(world) && fleet.cargoPopulation > 0) {
                  captureAction = [
                    captureWorld(world.id, fleet.ownerId)
                  ]
                }

                return [
                  ...captureAction,
                  giveOrTakeWorldMetal(fleet.toWorldId, fleet.cargoMetal),
                  giveOrTakeWorldPopulation(fleet.toWorldId, fleet.cargoPopulation, fleet.ownerId),
                  waitForCargo(fleet.id, fleet.toWorldId, fleet.cargoRoute),
                ]
              } else {

                const nextWorldId = nextDestinationOfRoute(fleet.fromWorldId, fleet.toWorldId, fleet.cargoRoute)

                const arrivingTimestamp = fleet.arrivingTimestamp + this.setup.rules.warping.warpToWorldDelay;

                return [
                  transferCargoToWorld(fleet.id, arrivingTimestamp, fleet.cargoMetal, fleet.cargoPopulation, nextWorldId, fleet.cargoRoute)
                ]

              }

            }
          }
        }
      })
    );
  }



}