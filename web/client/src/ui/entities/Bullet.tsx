import { useMemo } from 'react';
import { Circle } from 'react-konva';
import useTransition from '../../hooks/useTransition';
import { getDurationFromServerSpeed } from '../../lib/GridCoordinate';
import { GridSize } from '../../lib/GridSize';
import { MobModel, BulletModel } from '../../models';

export interface BulletProps {
    model: BulletModel;

    targetMob: MobModel;
}

const Bullet: React.FC<BulletProps> = ({ model, targetMob }) => {
    const size = new GridSize(0.2, 0.2);

    const { coordinate, speed } = model;

    const duration = useMemo(() => 
        getDurationFromServerSpeed(coordinate, targetMob.coordinate, speed)
    , [coordinate, targetMob.coordinate, speed]);

    const currentCoordinate = useTransition(coordinate, targetMob.coordinate, duration);

    return <Circle x={currentCoordinate.tileCenterX} y={currentCoordinate.tileCenterY} width={size.tileWidth} height={size.tileHeight} fill="red" />;
}

export default Bullet;