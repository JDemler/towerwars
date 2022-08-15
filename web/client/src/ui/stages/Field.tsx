import { Layer, Stage, StageProps } from "react-konva";
import BackgroundLayer from "../background/BackgroundLayer";
import Mob from "../entities/Mob";
import Turret from "../entities/Turret";
import { FieldModel } from '../models/GameState';

export interface FieldProps extends StageProps {
    field: FieldModel;
}

// React component that draws a single 1x1 rect based on the given GridCoordinate. 
// The fill color is determined by the coordinate in a chessboard pattern.
const Field: React.FC<FieldProps> = ({ field }) => {
    return (
      <Stage width={field.map.size.tileWidth} height={field.map.size.tileHeight}>
        <BackgroundLayer width={field.map.size.width} height={field.map.size.height} />
        <Layer>
            {field.towers.map(tower => 
                <Turret key={`${tower.coordinate.x},${tower.coordinate.y}`} coordinate={tower.coordinate} />)
            }
            {field.mobs.map((mob, i) => 
                <Mob key={i} coordinate={mob.coordinate} />)
            }
        </Layer>
      </Stage>
    );
    
}

export default Field;