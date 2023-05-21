"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOverlapping = void 0;
// a  . --- .
// b      . ---- .
function isOverlapping(a, b) {
    let aTo = new Date(a.to);
    let aFrom = new Date(a.from);
    let bTo = new Date(b.to);
    let bFrom = new Date(b.from);
    return (aTo > bFrom && aFrom < bTo) || (bTo > aFrom && bFrom < aTo);
}
exports.isOverlapping = isOverlapping;
