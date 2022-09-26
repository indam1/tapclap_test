import { res } from '@/resource';
import { commonScale } from '../configs/ui';

const tileColors = {
    blue: res.Blue_png,
    green: res.Green_png,
    red: res.Red_png,
    purple: res.Purple_png,
    yellow: res.Yellow_png,
};

export function xTilePosition(width, index, tileWidth = 0) {
    return width / 2 + tileWidth * commonScale * index;
}

export function yTilePosition(height, index, tileWidth = 0) {
    return height / 1.5 - tileWidth * commonScale * index;
}

export function getPositionFromTag(tag) {
    const x = parseInt(tag[0], 10);
    const y = parseInt(tag[1], 10);
    return { x, y };
}

export function tagsArrayToList(tagsArray) {
    return tagsArray.reduce((result, coordinates) => {
        const { x, y } = getPositionFromTag(coordinates);
        if (!result[x]) {
            result[x] = [];
        }
        result[x].push(y);
        return result;
    }, {});
}

export function selectColor() {
    const tileKeys = Object.keys(tileColors);
    const randomIndex = Math.floor(Math.random() * tileKeys.length);
    return tileColors[tileKeys[randomIndex]];
}
