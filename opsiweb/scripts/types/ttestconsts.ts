// export function getStoryFrame (path: string) { return `http://localhost:3003/iframe.html?${path}` }
export const argTypeText = { defaultValue: '', control: { type: 'text' } }
export const argTypeTextTitle = { defaultValue: 'Title', control: { type: 'text' } }
export const argTypeTextContent = { defaultValue: 'Content', control: { type: 'text' } }
export const argTypeBoolTrue = { defaultValue: true, control: { type: 'boolean' } }
export const argTypeBoolFalse = { defaultValue: false, control: { type: 'boolean' } }
export const variants = ['primary', 'secondary', 'danger', 'warning', 'success', 'transparent']
export const argTypeVariants = {
  defaultValue: 'primary',
  control: {
    type: 'select',
    options: variants
  }
}
