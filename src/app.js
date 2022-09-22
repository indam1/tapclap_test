/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

const N = 10;
const M = 10;
const K = 2;
const xAxes = {};
for (let i = 0; i < N; i++) {
    xAxes[i] = N;
}
const yAxes = {};
for (let i = 0; i < M; i++) {
    yAxes[i] = M;
}
const cubes = {
    blue: res.Blue_png,
    green: res.Green_png,
    red: res.Red_png,
    purple: res.Purple_png,
    yellow: res.Yellow_png,
};

function xPosition(width, index) {
    return width / 4 + index * 51;
}

function yPosition(height, index) {
    return height / 1.25 - index * 51;
}

const LeeAlgorithm = {
    marked: [],
    current: [],
    start: null,
    parent: null,
    cleanUp() {
        this.marked = [];
        this.current = [];
        this.start = null;
    },
    canAdd: function(x, y) {
        const tag = `${x}${y}`;
        const cube = this.parent.getChildByTag(tag)
        return cube
            && !this.marked.includes(tag)
            && !this.current.includes(tag)
            && this.start.cube === cube.texture.url;
    },
    mark: function(x, y) {
        const tag = `${x}${y}`;
        this.current.push(tag);
    },
    execute: function(start) {
        if (!start) {
            return null;
        }
        this.start = start;
        this.current.push(this.start.tag);
        while (this.current.length) {
            this.current.forEach((currentItem) => {
                const x = parseInt(currentItem[0], 10);
                const y = parseInt(currentItem[1], 10);
                const variants = [
                    { x: x + 1, y },
                    { x: x - 1, y },
                    { x: x, y: y + 1},
                    { x: x, y: y - 1},
                ];
                variants.forEach((variant) => {
                    if (this.canAdd(variant.x, variant.y)) {
                        this.mark(variant.x, variant.y);
                    }
                })
                this.marked.push(currentItem);
                this.current = this.current.filter((currentBufferItem) => currentBufferItem !== currentItem);
            })
        }
        const marked = this.marked;
        const hasAction = this.marked.length >= K;
        if (hasAction) {
            this.marked.forEach(markedItem => {
                this.parent.removeChildByTag(markedItem);
            })
        }
        this.cleanUp();
        return hasAction ? marked : null;
    }
}

const HelloWorldLayer = cc.Layer.extend({
    sprite: null,
    algLee: LeeAlgorithm,

    createSprite: function(x, y, color = null) {
        const size = cc.winSize;
        const cubeKeys = Object.keys(cubes);
        const randomIndex = Math.floor(Math.random() * cubeKeys.length);
        const cube = color ?? cubes[cubeKeys[randomIndex]];
        const sprite = new cc.Sprite(cube);
        sprite.attr({
            x: xPosition(size.width, x),
            y: yPosition(size.height, y),
            scale: 0.3,
        });
        sprite.setLocalZOrder(100000 - y);
        this.addChild(sprite);
        const tag = `${x}${y}`;
        sprite.setTag(tag);
        cc.eventManager.addListener(this.touchListener(tag, cube), sprite);
        return sprite;
    },
    touchListener: function (tag, cube) {
        const algLee = this.algLee;
        const parent = this;

        return {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                const target = event.getCurrentTarget();
                const locationInNode = target.convertToNodeSpace(touch.getLocation());
                const s = target.getContentSize();
                const rect = cc.rect(0, 0, s.width, s.height);
                if (!cc.rectContainsPoint(rect, locationInNode)) {
                    return false;
                }

                const deletedCubes = algLee.execute({ tag, cube });
                if (!deletedCubes || !deletedCubes.length) {
                    return false;
                }

                const deletedCubesList = deletedCubes.reduce((result, coordinates) => {
                    const x = parseInt(coordinates[0], 10);
                    const y = parseInt(coordinates[1], 10);
                    if (!result[x]) {
                        result[x] = [];
                    }
                    result[x].push(y);
                    return result;
                }, {});

                const lastMax = Object.keys(deletedCubesList).reduce((result, column) => {
                    let columnArray = deletedCubesList[column];
                    while (columnArray.length) {
                        const sortedColumnArray = columnArray.sort((rowA, rowB) => rowB - rowA);
                        if (sortedColumnArray[sortedColumnArray.length - 1] === 0) {
                            result[column] = sortedColumnArray.length - 1;
                            break;
                        }
                        const lowestEmptyRow = sortedColumnArray.shift(0);
                        for (let upperRow = lowestEmptyRow - 1; upperRow >= 0; upperRow--) {
                            const oldTag = `${column}${upperRow}`;
                            if (parent.getChildByTag(oldTag)) {
                                const newTag = `${column}${lowestEmptyRow}`;
                                parent.replace(oldTag, newTag);
                                sortedColumnArray.push(upperRow);
                                result[column] = upperRow;
                                break;
                            }
                        }
                        columnArray = sortedColumnArray;
                    }
                    return result;
                }, {});

                Object.keys(lastMax).forEach(column => {
                    for (let i = 0; i <= lastMax[column]; i++) {
                        parent.createSprite(column, i);
                    }
                })
                return true;
            }
        }
    },
    replace: function (oldTag, newTag) {
        const oldPlace = this.getChildByTag(oldTag);
        const newPlace = this.getChildByTag(newTag);
        if (!oldPlace) {
            return;
        }
        if (newPlace) {
            return;
        }

        const color = oldPlace.texture.url;
        this.removeChildByTag(oldTag, true);
        const x = parseInt(newTag[0], 10);
        const y = parseInt(newTag[1], 10);
        this.createSprite(x, y, color);
    },
    ctor: function () {
        this._super();
        this.algLee.parent = this;

        for (let i = M - 1; i >= 0; i--) {
            for (let j = 0; j < N; j++) {
                this.createSprite(j, i);
            }
        }

        return true;
    }
});

const HelloWorldScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        const layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

