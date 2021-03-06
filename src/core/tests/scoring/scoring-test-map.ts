import { GameState } from "../../../shared/model/v1/state";
import { dummyReadyWorld } from "../test-helper";

export const scoringTestMap: GameState = {
  currentTimestamp: 0,
  gameStartTimestamp: 0,
  gameEndTimestamp: 100000,
  players: {
    "p1": {
      playerId: "p1",
      status: 'PLAYING'
    },
    "p2": {
      playerId: "p1",
      status: 'PLAYING'
    },
  },
  universe: {
    fleets: {
      "f1": {
        id: "f1",
        status: 'READY',
        combatStatus: 'AT_PEACE',
        currentWorldId: "w1",
        orders: [],
        ownerId: "p1",
        ships: 10,
        integrity: 1,
        lastDamageTimestamp: 0,
        idleNotificationSent: false
      },
      "f2": {
        id: "f2",
        status: 'READY',
        combatStatus: 'AT_PEACE',
        currentWorldId: "w2",
        orders: [],
        ownerId: "p2",
        ships: 10,
        integrity: 1,
        lastDamageTimestamp: 0,
        idleNotificationSent: false
      },
    },
    worlds: {
      "w1": {
        ...dummyReadyWorld,
        population: {p1: 25},
        id: "w1",
        ownerId: "p1",
      },
      "w2": {
        ...dummyReadyWorld,
        id: "w2",
        ownerId: "p2",
        population: {p2: 25},
      }
    },
    gates: {
      "w1": ["w2"],
      "w2": ["w1"],
    }
  }
}