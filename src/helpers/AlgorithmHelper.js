import { MIN_CHAIN_LENGTH } from '../configs/rules';
import { getPositionFromTag } from './TileHelper';

export function LeeAlgorithm(startPoint, gameLayerInstance) {
    if (!startPoint) {
        return null;
    }

    let current = [];
    const marked = [];
    current.push(startPoint.tag);
    while (current.length) {
        // eslint-disable-next-line no-loop-func
        current.forEach((currentItem) => {
            const { x, y } = getPositionFromTag(currentItem);
            [`${x + 1}${y}`, `${x - 1}${y}`, `${x}${y + 1}`, `${x}${y - 1}`].forEach((tag) => {
                const tile = gameLayerInstance.getChildByTag(tag);
                const canAdd = tile
                    && !marked.includes(tag)
                    && !current.includes(tag)
                    && startPoint.colorImg === tile.texture.url;
                if (canAdd) {
                    current.push(tag);
                }
            });
            marked.push(currentItem);
            current = current.filter((currentBufferItem) => currentBufferItem !== currentItem);
        });
    }
    return marked.length && marked.length >= MIN_CHAIN_LENGTH ? marked : null;
}
