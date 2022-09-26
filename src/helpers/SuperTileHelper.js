import { res } from '@/resource';
import { getPositionFromTag } from './TileHelper';
import { HEIGHT, WIDTH } from '../configs/field';
import { MIN_CHAIN } from '../configs/superTiles';

export function selectAction(length, tag) {
    if (length >= MIN_CHAIN.ALL) {
        return { action: res.SuperAll_png, tag };
    }
    if (length >= MIN_CHAIN.BOMB) {
        return { action: res.SuperBomb_png, tag };
    }
    if (length >= MIN_CHAIN.COLUMN) {
        return { action: res.SuperColumn_png, tag };
    }
    if (length >= MIN_CHAIN.ROW) {
        return { action: res.SuperRow_png, tag };
    }
    return null;
}

// Проходим по кругу по сторонам ромба и вносим его координаты
export function createBomb(tag) {
    const R = 4;
    const { x, y } = getPositionFromTag(tag);
    const tiles = [];
    for (let i = 0; i < R; i += 1) {
        for (let j = 0; j < R - i; j += 1) {
            tiles.push(`${x - R + 1 + j + i}${y + j}`);
        }
        for (let j = 0; j < R - i - 1; j += 1) {
            tiles.push(`${x + 1 + j}${y + R - 2 - j - i}`);
        }
        for (let j = 0; j < R - i - 1; j += 1) {
            tiles.push(`${x + R - 2 - j - i}${y - 1 - j}`);
        }
        for (let j = 0; j < R - i - 2; j += 1) {
            tiles.push(`${x - 1 - j}${y - R + 2 + j + i}`);
        }
    }
    return tiles;
}

export function selectTilesBySuper(superTileImg, tag) {
    const superTiles = [];
    if (superTileImg === res.SuperAll_png) {
        for (let i = 0; i < WIDTH; i += 1) {
            for (let j = 0; j < HEIGHT; j += 1) {
                superTiles.push(`${i}${j}`);
            }
        }
    }
    if (superTileImg === res.SuperRow_png) {
        const { y } = getPositionFromTag(tag);
        for (let i = 0; i < WIDTH; i += 1) {
            superTiles.push(`${i}${y}`);
        }
    }
    if (superTileImg === res.SuperColumn_png) {
        const { x } = getPositionFromTag(tag);
        for (let i = 0; i < HEIGHT; i += 1) {
            superTiles.push(`${x}${i}`);
        }
    }
    if (superTileImg === res.SuperBomb_png) {
        superTiles.push(...createBomb(tag));
    }
    return superTiles;
}
