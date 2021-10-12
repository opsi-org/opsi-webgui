// export function getStoryFrame (path: string) { return `http://localhost:3003/iframe.html?${path}` }
export const variants = ['primary', 'secondary', 'danger', 'warning', 'success']
export const argTypeVariants = {
  defaultValue: 'primary',
  control: {
    type: 'select',
    options: variants
  }
}
