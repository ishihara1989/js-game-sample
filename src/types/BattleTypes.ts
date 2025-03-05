import { Unit } from '../objects/Unit';

export interface BattleResult {
  victory: boolean;
  defeatedUnit: Unit;
  victorUnit: Unit;
  exp: number;
  gold: number;
  items: string[];
}
