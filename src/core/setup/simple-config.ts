import { GameRules } from "../rules";

const fiveSeconds = 1000 * 5;

export const testConfig: GameRules = {
  combat: {
    integrityDamagePerShip: 0.456789,
    meanFiringInterval: 3 * fiveSeconds
  },
  building: {
    buildIndustryDelay: 50 * fiveSeconds,
    buildShipDelay: 10 * fiveSeconds,
    buildIndustryCost: 5,
  },
  warping: {
    arriveWorldDelay: 1 * fiveSeconds,
    leaveWorldDelay: 1 * fiveSeconds,
    warpToWorldDelay: 1 * fiveSeconds,
  },
  transfering: {
    transferMetalDelay: 1 * fiveSeconds,
    transferShipsDelay: 1 * fiveSeconds,
  }
}