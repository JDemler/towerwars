import { useMemo } from 'react';
import { Circle } from 'react-konva';
import useTransition from '../../hooks/useTransition';
import GridCoordinate, { getDurationFromServerSpeed } from '../../lib/GridCoordinate';
import { GridSize } from '../../lib/GridSize';
import { MobModel, BulletModel } from '../../models';

export interface BulletProps {
    model: BulletModel;

    targetCoordinate: GridCoordinate;
}

const Bullet: React.FC<BulletProps> = ({ model, targetCoordinate }) => {
    const size = new GridSize(0.2, 0.2);

    const { coordinate, speed } = model;

    const duration = useMemo(() => 
        getDurationFromServerSpeed(coordinate, targetCoordinate, speed)
    , [coordinate, targetCoordinate, speed]);

    const currentCoordinate = useTransition(coordinate, targetCoordinate, duration);

    return <Circle x={currentCoordinate.tileCenterX} y={currentCoordinate.tileCenterY} width={size.tileWidth} height={size.tileHeight} fill="red" />;
}

export default Bullet;