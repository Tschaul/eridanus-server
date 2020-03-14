import { GameState } from "../../../shared/model/v1/state";
import { dummyReadyWorld, dummyLostWorld } from "../test-helper";

export const visibilityTestMap: GameState = {
  currentTimestamp: 0,
  gameEndTimestamp: Number.MAX_VALUE,
  universe: {
    visibility: {
      p1: {},
      p2: {}
    },
    fleets: {
      "f1": {
        id: "f1",
        status: 'READY',
        combatStatus: 'AT_PEACE',
        currentWorldId: "w1",
        metal: 0,
        population: 0,
        orders: [],
        ownerId: "p1",
        ships: 10,
        integrity: 1
      }
    },
    worlds: {
      "w1": {
        ...dummyReadyWorld,
        id: "w1",
        ownerId: "p1",
      },
      "w2": {
        ...dummyLostWorld,
        id: "w2",
      },
      "w3": {
        ...dummyLostWorld,
        id: "w3",
      }
    },
    gates: {
      "w1": ["w2"],
      "w2": ["w1","w3"],
      "w3": ["w2"]
    }
  }
}