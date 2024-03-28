import * as d3 from 'd3';

export const scrollIntoViewWithOffset = (node, offset, settings={}) => {
  const { behaviour="smooth" } = settings;
  window.scrollTo({
    behaviour,
    top:
      node.getBoundingClientRect().top -
      document.body.getBoundingClientRect().top -
      offset,
  })
} 

export const styles = {
  smDown: screen => ({ display: screen.isSmall ? null : "none" }),
  mdDown: screen => ({ display: ["xs", "sm", "md"].includes(screen.size) ? null : "none" }),
  mdUp: screen => ({ display: screen.isSmall ? "none" : null }),
  lgUp:screen => ({ display: screen.isLarge ? null : "none" }),
  smDownLand: screen => ({ display: screen.isSmall && screen.orientation === "landscape" ? null : "none" }),
  smDownPort: screen => ({ display: screen.isSmall && screen.orientation === "portrait" ? null : "none" }),
  mdOnly: screen => ({ display: screen.size === "md" ? null : "none" })
}

export const showDemoForm = (hideNavBarFirst=false) => {
  console.log("show")
  return;
  d3.select("#request-demo-form")
  //d3.select(overlayRef.current)
    .style("opacity", 0)
    .style("display", null)
      .transition()
      .delay(hideNavBarFirst ? 600 : 0)
      .duration(500)
        .style("opacity", 1);

  /*d3.select("#navbar")
    .style("opacity", 1)
      .transition()
      .duration(hideNavBarFirst ? 500 : 100)
        .style("opacity", 0)
        .on("end", function(){
          d3.select(this).style("display","none")
        })*/
}

export const hideDemoForm = (shouldShowNavbar=true) => {
  console.log("hide")
  return;
  //d3.select(overlayRef.current)
  d3.select("#request-demo-form")
    .style("opacity", 1)
      .transition()
      .duration(500)
        .style("opacity", 0)
        .on("end", function(){
          d3.select(this).style("display","none")
        })

  //if(shouldShowNavbar){ showNavbar(500); }
    
};

export const showNavbar = (delay=0) => {
  d3.select("#navbar")
    .style("opacity", 0)
    .style("display", null)
      .transition()
      .delay(delay)
      .duration(500)
        .style("opacity", 1)
}