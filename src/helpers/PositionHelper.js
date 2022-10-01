const { rect, rectContainsPoint } = cc;

export function isInRect(event, target) {
    const locationInNode = target.convertToNodeSpace(event.getLocation());
    const s = target.getContentSize();
    const myRect = rect(0, 0, s.width, s.height);
    return rectContainsPoint(myRect, locationInNode);
}
