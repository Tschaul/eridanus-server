import { GameEventQueue, GameEvent } from "../event";
import { Observable, combineLatest } from "rxjs";
import { injectable, inject } from "inversify";
import 'reflect-metadata';
import { TimeProjector } from "../../projectors/time-projector";
import { CONFIG, GameConfig } from "../../config";
import { map, withLatestFrom } from "rxjs/operators";
import { FleetProjector } from "../../projectors/fleet-projector";
import { Fleet, FleetAtPeace, ReadyFleet } from "../../model/fleet";
import { RandomNumberGenerator } from "../../infrastructure/random-number-generator";
import { startFiring } from "../../actions/fleet/start-firing";
import { CombatProjector } from "../../projectors/combat-projector";
import { WorldProjector } from "../../projectors/world-projector";
import { World, ReadyWorld } from "../../model/world";
import { WorldOrder } from "../../model/world-order";
import { determineTarget, determineDamage } from "./combat-helper";
import { setFleetIntegrity } from "../../actions/fleet/set-integrity";
import { looseFleet } from "../../actions/fleet/loose-fleet";
import { giveOrTakeFleetShips } from "../../actions/fleet/give-or-take-ships";
import { setWorldIntegrity } from "../../actions/world/set-integrity";

@injectable()
export class FleetFireEventQueue implements GameEventQueue {
  public upcomingEvent$: Observable<GameEvent | null>;

  constructor(
    private worlds: WorldProjector,
    private fleets: FleetProjector,
    private combat: CombatProjector,
    private time: TimeProjector,
    private random: RandomNumberGenerator,
    @inject(CONFIG) config: GameConfig) {

    this.upcomingEvent$ = this.combat.firstFiringFleet$.pipe(
      withLatestFrom(this.worlds.byId$, this.fleets.byCurrentWorldId$),
      map(([fleet, worldsById, fleetsByCurrentworldId]) => {
        if (!fleet) {
          return null;
        }
        return {
          timestamp: fleet.weaponsReadyTimestamp,
          happen: () => {

            const weaponsReadyTimestamp = fleet.weaponsReadyTimestamp + random.exponential() * config.combat.meanFiringInterval

            const world = worldsById[fleet.currentWorldId];

            const [targetType, target] = determineTarget(fleet, world, fleetsByCurrentworldId[world.id], this.random);

            const [newShips, newIntegrity] = determineDamage(fleet, target, config);

            switch (targetType) {
              case 'FLEET':
                if (newShips === 0) {
                  return [
                    giveOrTakeFleetShips(target.id, -1 * target.ships),
                    setFleetIntegrity(target.id, 1),
                    looseFleet(target.id),
                    startFiring(fleet.id, weaponsReadyTimestamp),
                  ]
                } else {
                  return [
                    giveOrTakeFleetShips(target.id, newShips - target.ships),
                    setFleetIntegrity(target.id, newIntegrity),
                    startFiring(fleet.id, weaponsReadyTimestamp),
                  ]
                }
              case 'WORLD':
                return [
                  giveOrTakeFleetShips(target.id, newShips - target.ships),
                  setWorldIntegrity(target.id, newIntegrity),
                  startFiring(fleet.id, weaponsReadyTimestamp),
                ]
            }

          }
        }
      })
    )
  }


}