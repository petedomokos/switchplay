const defs = svg.append("defs")

const mask = defs.append("mask")
    .attr("id", "goal-mask")

//as fill is black, it does fully hide the middle.
//however, masks hide the entire object by default,
//so teh rest of the circle is also hidden.
//so we need another circle which is filled white to fully reveal the rest of it
mask
    .append("circle")
        .attr("cx", 100)
        .attr("cy", 100)
        .attr("r", 50)
        .attr("fill", "white")

mask
    .append("circle")
        .attr("cx", 100)
        .attr("cy", 100)
        .attr("r", 25)
        .attr("fill", "black")
        .attr("pointer-events", "none")

svg
    .append("circle")
        .attr("cx", 100)
        .attr("cy", 100)
        .attr("r", 25)
        .attr("fill", "blue")
        .on("click", () => { console.log("bottom circ clicked"); })

svg
    .append("circle")
        .attr("cx", 100)
        .attr("cy", 100)
        .attr("r", 50)
        .attr("fill", "red")
        .attr("mask", "url(#goal-mask)")
        .on("click", () => { console.log("top circ clicked"); })
        //opts - 1 - lesn how to pass bubble an event up, or just to propagate to the one behind
        //2 - just handle the click/drag entirely on pplanetRing, and if its inside the mask then
        //its a planetDrag not a ringDrag. But need to use eqn of ellipse to determine this.
        // 3 - just use a path to create the ring, so no need to use masks
        //4 - ?
        //.attr("mask", "#goal-mask")

function getD(cx, cy, rx, ry, requiresInner) {
    console.log("getD", requiresInner)
    var kappa=0.5522847498;
    var ox = rx * kappa; // x offset for the control point
    var oy = ry * kappa; // y offset for the control point 
    let d = `M${cx - rx},${cy}`;
        d+= `C${cx - rx}, ${cy - oy}, ${cx - ox}, ${cy - ry}, ${cx}, ${cy - ry},`
        d+= `C${cx + ox}, ${cy - ry}, ${cx + rx}, ${cy - oy}, ${cx + rx}, ${cy},`
        d+= `C${cx + rx}, ${cy + oy}, ${cx + ox}, ${cy + ry}, ${cx}, ${cy + ry},`
        d+= `C${cx - ox}, ${cy + ry}, ${cx - rx}, ${cy + oy}, ${cx - rx}, ${cy},`
        if(requiresInner){
            d+= "m10,0"
            //innerD will attach the z
            const innerD = getD(cx, cy, rx - 10, ry - 10, false);
            d += innerD;
        }else{
            d+= `z`;
        }

    console.log("d", d)
    return d;
}
const ellipseG = svg.append("g").attr("transform", "translate(300, 300)")
ellipseG.append("path")
    .attr("stroke", "blue")
    .attr("fill", "none")
    .attr("d", getD(0, 0, 30, 20, true))
