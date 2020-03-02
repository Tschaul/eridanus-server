import { Container } from "inversify";
import { BeginLoadingMetalEventQueue } from "./transfer/begin-loading-metal";
import { CompleteEventQueue } from "./complete-event-queue";
import { BeginLoadingShipsEventQueue } from "./transfer/begin-loading-ships";
import { EndLoadMetalEventQueue } from "./transfer/end-loading-metal";
import { EndLoadingShipsEventQueue } from "./transfer/end-loading-ships";
import { ArriveAtWorldEventQueue } from "./warping/arrive-world";
import { BeginWarpEventQueue } from "./warping/begin-warp";
import { EndWarpEventQueue } from "./warping/end-warp";
import { LeaveWorldEventQueue } from "./warping/leave-world";
import { BeginBuildingShipEventQueue } from "./building/begin-building-ship";
import { EndBuildShipsEventQueue } from "./building/end-build-ship";
import { BeginBuildingIndustryEventQueue } from "./building/begin-building-industry";
import { EndBuildIndustryEventQueue } from "./building/end-build-industry";
import { FleetStartFiringEventQueue } from "./combat/fleet-start-firing";
import { FleetFireEventQueue } from "./combat/fleet-fire";
import { FleetStopFiringEventQueue } from "./combat/fleet-stop-firing";
import { WorldStartFiringEventQueue } from "./combat/world-start-firing";
import { WorldFireEventQueue } from "./combat/world-fire";
import { WorldStopFiringEventQueue } from "./combat/world-stop-firing";
import { CaptureFleetEventQueue } from "./capture/capture-fleet";
import { CaptureWorldEventQueue } from "./capture/capture-world";
import { TickEventQueue } from "./tick";
import { BeginDroppingMetalEventQueue } from "./transfer/begin-dropping-metal";
import { BeginDroppingShipsEventQueue } from "./transfer/begin-dropping-ships";
import { EndDroppingMetalEventQueue } from "./transfer/end-dropping-metal";
import { EndDroppingShipsEventQueue } from "./transfer/end-dropping-ships";

export function registerEventQueues(container: Container) {

  container.bind(BeginLoadingMetalEventQueue).toSelf();
  container.bind(BeginLoadingShipsEventQueue).toSelf();
  container.bind(EndLoadMetalEventQueue).toSelf();
  container.bind(EndLoadingShipsEventQueue).toSelf();

  container.bind(BeginDroppingMetalEventQueue).toSelf();
  container.bind(BeginDroppingShipsEventQueue).toSelf();
  container.bind(EndDroppingMetalEventQueue).toSelf();
  container.bind(EndDroppingShipsEventQueue).toSelf();

  container.bind(ArriveAtWorldEventQueue).toSelf();
  container.bind(BeginWarpEventQueue).toSelf();
  container.bind(EndWarpEventQueue).toSelf();
  container.bind(LeaveWorldEventQueue).toSelf();

  container.bind(BeginBuildingShipEventQueue).toSelf();
  container.bind(EndBuildShipsEventQueue).toSelf();
  container.bind(BeginBuildingIndustryEventQueue).toSelf();
  container.bind(EndBuildIndustryEventQueue).toSelf();

  container.bind(FleetStartFiringEventQueue).toSelf();
  container.bind(FleetFireEventQueue).toSelf();
  container.bind(FleetStopFiringEventQueue).toSelf();

  container.bind(WorldStartFiringEventQueue).toSelf();
  container.bind(WorldFireEventQueue).toSelf();
  container.bind(WorldStopFiringEventQueue).toSelf();

  container.bind(CaptureFleetEventQueue).toSelf();
  container.bind(CaptureWorldEventQueue).toSelf();

  container.bind(TickEventQueue).toSelf();

  container.bind(CompleteEventQueue).toSelf();

}