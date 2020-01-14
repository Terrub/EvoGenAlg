function createRenderer(display, world, size) {
    var proto_renderer;

    function getByteAverage(byte_segment) {
        let total = 0;
        const num_bytes = byte_segment.length / 8 | 0;
        for (let i = 0; i < byte_segment.length; i += 8) {
            const byte = byte_segment.substr(i,8);
            total += parseInt(byte, 2);
        }
        let byte_average = total / num_bytes | 0;
        
        return byte_average;
    }

    function determineColorFromGenome(genome) {
        const red_count = (genome.match(/00/g) || []).length;
        const grn_count = (genome.match(/11/g) || []).length;
        const blu_count = (genome.match(/01/g) || []).length;
        const total_count = red_count + blu_count + grn_count;

        const r = red_channel = (red_count / total_count) * 255 | 0;
        const g = grn_channel = (grn_count / total_count) * 255 | 0;
        const b = blu_channel = (blu_count / total_count) * 255 | 0;

        const color = "rgb("+r+","+g+","+b+")";

        return color;
    }

    // function determineColorFromGenome(genome) {        
    //     const num_channel_segments = (genome.length / 3 | 0);
        
    //     const red_segment = genome.substr(0 * num_channel_segments, num_channel_segments);
    //     const grn_segment = genome.substr(1 * num_channel_segments, num_channel_segments);
    //     const blu_segment = genome.substr(2 * num_channel_segments, num_channel_segments);
        
    //     const r = red_channel = getByteAverage(red_segment);
    //     const g = grn_channel = getByteAverage(grn_segment);
    //     const b = blu_channel = getByteAverage(blu_segment);

    //     const color = "rgb("+r+","+g+","+b+")";

    //     return color;
    // }

    function renderCurrentState() {
        display.clear();
        
        const grid = world.getGrid();
        for (let index = 0; index < grid.length; index += 1) {
            const cell = grid[index];
            if (cell === 1) {
                const position = world.getPositionFromIndex(index);
                const entity = world.getEntityAtIndex(index);
                if (entity) {
                    const genome = entity.genome;
                    const color = determineColorFromGenome(genome);
                    display.drawRect(position.x * size, position.y * size, size, size, color);
                }
            }
        }
    }

    proto_renderer = {
        "renderCurrentState": renderCurrentState
    };

    return proto_renderer;
}