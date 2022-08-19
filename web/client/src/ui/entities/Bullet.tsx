import { Circle } from 'react-konva';
import { GridSize } from '../../lib/GridSize';
import BulletModel from '../../models/BulletModel';

export interface BulletProps {
    model: BulletModel;
}

const Bullet: React.FC<BulletProps> = ({ model }) => {
    const size = new GridSize(0.2, 0.2);

    const { coordinate } = model;

    return <Circle x={coordinate.tileCenterX} y={coordinate.tileCenterY} width={size.tileWidth} height={size.tileHeight} fill="red" />;
}

export default Bullet;