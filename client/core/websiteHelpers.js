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