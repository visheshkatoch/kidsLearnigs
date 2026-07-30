// "united states" -> "u-n-i-t-e-d s-t-a-t-e-s"
export function hyphenate(name) {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.split('').join('-'))
    .join(' ')
}
