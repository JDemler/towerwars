import { Group, Rect } from 'react-konva';
import GridCoordinate from '../../lib/GridCoordinate';
import { GridSize } from '../../lib/GridSize';

export interface HealthBarProps {
    health: number;
    maxHealth: number;

    coordinate: GridCoordinate;
    size: GridSize;
    padding?: number;
}

const HealthBar: React.FC<HealthBarProps> = ({ health, maxHealth, coordinate, size, padding = 2 }) => {
    const healthPercentage = health > 0 ? health / maxHealth : 0;

    return <Group x={coordinate.tileX - size.tileWidth / 2} y={coordinate.tileY - size.tileHeight / 2}>
        <Rect width={size.tileWidth} height={size.tileHeight} fill="white" />
        <Rect x={padding} width={size.tileWidth - padding * 2} y={padding} height={size.tileHeight - padding * 2} fill="darkGray" />
        <Rect x={padding} width={(size.tileWidth - padding * 2) * healthPercentage} y={padding} height={size.tileHeight - padding * 2} fill="red" />
    </Group>
}

export default HealthBar;