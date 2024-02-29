export const scrollIntoViewWithOffset = (node, offset) => {
    window.scrollTo({
      behavior: 'smooth',
      top:
        node.getBoundingClientRect().top -
        document.body.getBoundingClientRect().top -
        offset,
    })
} 