import { GameState } from "../../../shared/model/v1/state";

export const scrappingTestMap: GameState = {
  currentTimestamp: 0,
  gameEndTimestamp: Number.MAX_VALUE,
  universe: {
    fleets: {
      "f1": {
        id: "f1",
        status: 'READY',
        combatStatus: 'AT_PEACE',
        currentWorldId: "w1",
        metal: 0,
        orders: [],
        ownerId: "p1",
        ships: 20,
        integrity: 1,
      }
    },
    worlds: {
      "w1": {
        status: 'READY',
        id: "w1",
        industry: 0,
        metal: 10,
        mines: 1,
        ownerId: "p1",
        population: 25,
        ships: 5,
        orders: [],
        integrity: 1,
        combatStatus: 'AT_PEACE',
        miningStatus: 'NOT_MINING'
      }
    },
    gates: {
    }
  }
}