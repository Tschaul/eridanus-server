import * as React from 'react';
import { observer } from 'mobx-react';
import { GameStageViewModel } from '../../../view-model/game/game-stage-view-model';
import autobind from "autobind-decorator";
import { World } from '../../../../shared/model/world';
import { getClosestAttribute } from '../../helper/get-attribute';
import { WarpingFleet } from '../../../../shared/model/fleet';
import { mul, add, diff, normal } from '../../../../shared/math/vec2';

const WORLD_OUTER_RADIUS = 50;

const FLEET_DISTANCE = 33;
const FLEET_SPREAD_DURING_WARP = 22;

@observer
@autobind
export class GameStageForeground extends React.Component<{
  vm: GameStageViewModel
}> {
  render() {
    return (
      <g opacity="1">
        {this.renderWorlds()}
        {this.renderFleets()}
      </g>
    )
  }

  private renderFleets() {
    return this.props.vm.warpingFleetOwnersByBothWorlds.map(([id1, world1Pos, id2, world2Pos, fleetOwners]) => {

      const meanPosition = mul(add(world1Pos, world2Pos), 0.5);

      const delta = diff(world1Pos, world2Pos);
      const n = normal(delta);

      const offset = ((fleetOwners.length - 1) / 2) * FLEET_SPREAD_DURING_WARP;
      const offsetPoint = diff(meanPosition, mul(n, offset));
      const step = mul(n, FLEET_SPREAD_DURING_WARP);

      return <g key={`${id1}:${id2}`}>
        {fleetOwners.map((ownerId, index) => {
          const playerInfo = this.props.vm.playerInfos[ownerId];
          const pos = add(offsetPoint, mul(step, index))
          return (
            <text
              key={ownerId}
              x={pos.x}
              y={pos.y}
              dominantBaseline="middle"
              textAnchor="middle"
              fill={playerInfo.color}
              fontSize={22}
              data-world-id1={id1}
              data-world-id2={id2}
              onClick={this.handleGateClick}
              cursor='pointer'
            >►</text>
            );
        })}
      </g>
    })
  }

  private renderWorlds(): React.ReactNode {
    return this.props.vm.worldsWithKeyAndDisplayPosition.map(world => {
      const color = this.getColorForWorld(world);
      const fleetOwners = this.props.vm.fleetOwnersByWorldId[world.id] || [];
      return (
        <g key={world.id}>
          <text
            x={world.x}
            y={world.y}
            dominantBaseline="middle"
            textAnchor="middle"
            fill={color}
            fontSize={33}
          >◉</text>
          {fleetOwners.map(ownerId => {
            const playerInfo = this.props.vm.playerInfos[ownerId];
            return (
              <text
                key={ownerId}
                x={world.x + FLEET_DISTANCE * playerInfo.fleetDrawingPosition.x}
                y={world.y + FLEET_DISTANCE * playerInfo.fleetDrawingPosition.y}
                dominantBaseline="middle"
                textAnchor="middle"
                fill={playerInfo.color}
                fontSize={22}
              >►</text>);
          })}
          <circle
            cx={world.x}
            cy={world.y}
            r={WORLD_OUTER_RADIUS}
            opacity="0"
            data-world-id={world.id}
            onClick={this.handleWorldClick}
            style={{ cursor: 'pointer' }}
          />
        </g>);
    });
  }

  @autobind
  handleWorldClick(event: React.MouseEvent) {
    const worldId = getClosestAttribute(event, 'data-world-id');
    this.props.vm.selectWorld(worldId);
  }

  @autobind
  handleGateClick(event: React.MouseEvent) {
    const world1Id = getClosestAttribute(event, 'data-world-id1');
    const world2Id = getClosestAttribute(event, 'data-world-id2');
    if (world1Id && world2Id) {
      this.props.vm.selectGate(world1Id, world2Id);
    }
  }

  getColorForWorld(world: World) {
    if (world.status === 'LOST') {
      return 'grey'
    } else {
      return this.props.vm.playerInfos[world.ownerId].color;
    }
  }
}
