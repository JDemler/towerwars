import { Circle } from 'react-konva';
import { GridSize } from '../../lib/GridSize';
import { TowerModel } from '../../models';

export interface TurretProps {
    model: TowerModel;
}

const Turret: React.FC<TurretProps> = ({ model }) => {
    const size = new GridSize(0.8, 0.8);

    const { coordinate } = model;
    
    return <Circle x={coordinate.tileCenterX} y={coordinate.tileCenterY} width={size.tileWidth} height={size.tileHeight} fill="white" />;
}

export default Turret;