import { Circle } from 'react-konva';
import { GridSize } from '../../lib/GridSize';
import MobModel from '../../models/MobModel';
import useTransition from '../../hooks/useTransition';

export interface MobProps {
    model: MobModel;
}

const Mob: React.FC<MobProps> = ({ model }) => {
    const size = new GridSize(0.5, 0.5);
    
    const { coordinate, targetCoordinate, speed } = model;

    const currentCoordinate = useTransition(coordinate, targetCoordinate, speed);

    return <Circle x={currentCoordinate.tileX} y={currentCoordinate.tileY} width={size.tileWidth} height={size.tileHeight} fill="blue" />;
}

export default Mob;