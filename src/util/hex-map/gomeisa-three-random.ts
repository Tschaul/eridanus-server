import { Gates, Universe } from "../../shared/model/v1/universe";
import { makeHexCoordinates, getRank } from "./make-hex-coordinates";
import { Vec2 } from "../../shared/math/vec2";
import { LostWorld } from "../../shared/model/v1/world";
import { DrawingPositions } from "../../shared/model/v1/drawing-positions";
import { GameMap } from "../../shared/model/v1/game-map";
import { WorldTypeBag } from "./chose-world-type";
import { distributeWorldTypes } from "./distribute-world-types";
import { applyWorldTypes } from "./apply-world-types";

const homeWorlds = ['c3', 'c7', 'c11'];

const seats: { [key: string]: string } = {
  c3: 'p1',
  c7: 'p2',
  c11: 'p3'
}

export function makeGomeisaThreeRandom(): GameMap {
  const worldPositions = makeHexCoordinates(4, 1);

  const universe: Universe = {
    fleets: {},
    worlds: {},
    gates
  }

  const worldTypeBag = new WorldTypeBag(Object.getOwnPropertyNames(worldPositions).length)

  const drawingPositions: DrawingPositions = {};

  Object.getOwnPropertyNames(worldPositions).forEach(worldId => {
    const [x, y] = worldPositions[worldId];
    const position: Vec2 = { x, y }
    drawingPositions[worldId] = position;

    if (homeWorlds.includes(worldId)) {
      universe.worlds[worldId] = {
        worldType: { type: 'HOME', playerId: seats[worldId] },
        id: worldId,
        status: 'OWNED',
        ownerId: seats[worldId],
        miningStatus: { type: 'NOT_MINING' },
        populationGrowthStatus: { type: 'NOT_GROWING' },
        combatStatus: { type: 'AT_PEACE' },
        metal: 0,
        mines: 0,
        industry: 25,
        population: { [seats[worldId]]: 50 },
        populationLimit: 50,
        populationConversionStatus: { type: 'NOT_BEING_CAPTURED' },
        buildShipsStatus: { type: 'NOT_BUILDING_SHIPS' },
        worldHasBeenDiscovered: false
      };

      ([1, 2, 3, 4, 5]).forEach((index) => {
        const fleetId = 'w' + worldId + 'f' + index;
        universe.fleets[fleetId] = {
          status: 'READY',
          combatStatus: 'AT_PEACE',
          currentWorldId: worldId,
          id: fleetId,
          integrity: 1,
          orders: [],
          ownerId: seats[worldId],
          ships: 5,
          idleNotificationSent: true,
          lastDamageTimestamp: 0
        }
      })
    } else {
      universe.worlds[worldId] = makeWorld(worldId, worldTypeBag);
    }

  })

  distributeWorldTypes(universe)
  applyWorldTypes(universe)

  return {
    seats: Object.values(seats),
    universe,
    drawingPositions
  }
}

function makeWorld(id: string, bag: WorldTypeBag): LostWorld {

  const rank = getRank(id);

  const random = randomSphericArray(2);

  const industry = 0;
  const metal = Math.round(random[0] * 20);

  const populationLimitStatic = getStaticPopulationLimit(rank);
  const populationLimitRandom = Math.round(random[1] * 25);

  const populationLimit = Math.max(populationLimitRandom + populationLimitStatic, metal + industry)

  const world: LostWorld = {
    worldType: bag.next(),
    id,
    industry,
    metal: metal,
    mines: 0,
    populationLimit,
    status: 'LOST',
    worldHasBeenDiscovered: false
  }

  return world;
}

function getStaticPopulationLimit(rank: 1 | 2 | 3 | 4 | 5) {
  switch (rank) {
    case 1: return 40;
    case 2: return 30;
    case 3: return 15;
    default: return 5;
  }
}

function randomSphericArray(length: number) {
  const equal = Array.from(Array(length).keys()).map(_ => Math.random());

  const squared = equal.reduce((acc, num) => {
    return acc += num * num;
  }, 0)

  return equal.map(num => num / Math.sqrt(squared));

}

export const gates: Gates = {
  a1: ['b2', 'b4', 'b6'],

  b1: ['b2', 'b6', 'c2', 'c1', 'c12'],
  b2: ['a1', 'b1', 'b3', 'c2', 'c3', 'c4'],
  b3: ['b2', 'b4', 'c4', 'c5', 'c6'],
  b4: ['a1', 'b3', 'b5', 'c6', 'c7', 'c8'],
  b5: ['b4', 'b6', 'c8', 'c9', 'c10'],
  b6: ['a1', 'b5', 'b1', 'c10', 'c11', 'c12'],

  c1: ['b1', 'd2', 'd18'],
  c2: ['b1', 'b2', 'd2', 'd3'],
  c3: ['b2', 'd3', 'd5'],
  c4: ['b2', 'b3', 'd5', 'd6'],
  c5: ['b3', 'd6', 'd8'],
  c6: ['b3', 'b4', 'd8', 'd9'],
  c7: ['b4', 'd9', 'd11'],
  c8: ['b4', 'b5', 'd11', 'd12'],
  c9: ['b5', 'd12', 'd14'],
  c10: ['b5', 'b6', 'd14', 'd15'],
  c11: ['b6', 'd15', 'd17'],
  c12: ['b6', 'b1', 'd17', 'd18'],

  d1: ['d18', 'd2'],
  d2: ['c1', 'c2', 'd1', 'd3'],
  d3: ['c2', 'c3', 'd2', 'd4'],
  d4: ['d3', 'd5'],
  d5: ['c3', 'c4', 'd4', 'd6'],
  d6: ['c4', 'c5', 'd5', 'd7'],
  d7: ['d6', 'd8'],
  d8: ['c5', 'c6', 'd7', 'd9'],
  d9: ['c6', 'c7', 'd8', 'd10'],
  d10: ['d9', 'd11'],
  d11: ['c7', 'c8', 'd10', 'd12'],
  d12: ['c8', 'c9', 'd11', 'd13'],
  d13: ['d12', 'd14'],
  d14: ['c9', 'c10', 'd13', 'd15'],
  d15: ['c10', 'c11', 'd14', 'd16'],
  d16: ['d15', 'd17'],
  d17: ['c11', 'c12', 'd16', 'd18'],
  d18: ['c12', 'c1', 'd17', 'd1'],

}