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
  smDownPort: screen => ({ display: screen.isSmall && screen.orientation === "portrait" ? null : "none" })
}