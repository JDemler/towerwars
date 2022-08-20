import { Circle } from 'react-konva';
import { GridSize } from '../../lib/GridSize';
import useTransition from '../../hooks/useTransition';
import { getDurationFromServerSpeed } from '../../lib/GridCoordinate';
import { useMemo } from 'react';
import { BulletModel, MobModel } from '../../models';
import Bullet from './Bullet';

export interface MobProps {
    model: MobModel;

    bullets: BulletModel[];
}

const Mob: React.FC<MobProps> = ({ model, bullets }) => {
    const size = new GridSize(0.5, 0.5);
    
    const { coordinate, targetCoordinate, speed } = model;

    const duration = useMemo(() => 
        getDurationFromServerSpeed(coordinate, targetCoordinate, speed)
    , [coordinate, targetCoordinate, speed]);

    const currentCoordinate = useTransition(coordinate, targetCoordinate, duration);

    return <>
        <Circle x={currentCoordinate.tileX} y={currentCoordinate.tileY} width={size.tileWidth} height={size.tileHeight} fill="blue" />

        {bullets.map(bullet => (
            <Bullet key={bullet.id} model={bullet} targetCoordinate={currentCoordinate} />
        ))}
    </>;
}

export default Mob;