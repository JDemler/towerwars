import { Layer, Stage, StageProps } from "react-konva";
import GridCoordinate from "../../lib/GridCoordinate";
import BackgroundLayer from "../background/BackgroundLayer";
import Mob from "../entities/Mob";
import Turret from "../entities/Turret";
import Bullet from '../entities/Bullet';
import { useFieldModel } from "../../hooks/useFieldModel";

export interface FieldProps extends StageProps {
    onTileClick?: (coordinate: GridCoordinate) => void;
}

const Field: React.FC<FieldProps> = ({ onTileClick }) => {
    const field = useFieldModel();

    return (
      <Stage width={field.map.size.tileWidth} height={field.map.size.tileHeight}>
        <BackgroundLayer width={field.map.size.width} height={field.map.size.height} onTileClick={onTileClick} />
        <Layer>
            {field.towers.map(tower => 
                <Turret key={`${tower.coordinate.x},${tower.coordinate.y}`} coordinate={tower.coordinate} />)
            }
            {field.mobs.map((mob, i) => 
                <Mob key={i} coordinate={mob.coordinate} />)
            }
            {field.bullets.map((bullet, i) => 
                <Bullet key={i} coordinate={bullet.coordinate} />)
            }
        </Layer>
      </Stage>
    );
    
}

export default Field;