import { Layer, Stage, StageProps } from "react-konva";
import GridCoordinate from "../../lib/GridCoordinate";
import BackgroundLayer from "../background/BackgroundLayer";
import Mob from "../entities/Mob";
import Turret from "../entities/Turret";
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
                <Turret key={tower.id ?? `${tower.coordinate.x},${tower.coordinate.y}`} model={tower} />
            )}
            {field.mobs.map((mob) => 
                <Mob key={mob.id} model={mob} bullets={field.bullets.filter(bullet => bullet.targetId === mob.id)} />
            )}
        </Layer>
      </Stage>
    );
    
}

export default Field;