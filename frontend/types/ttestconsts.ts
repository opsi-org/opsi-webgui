/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
// export function getStoryFrame (path: string) { return `http://localhost:3003/iframe.html?${path}` }
export const argTypeText = { defaultValue: '', control: { type: 'text' } }
export const argTypeTextTitle = {
  defaultValue: 'Title',
  control: { type: 'text' },
}
export const argTypeTextContent = {
  defaultValue: 'Content',
  control: { type: 'text' },
}
export const argTypeBoolTrue = {
  defaultValue: true,
  control: { type: 'boolean' },
}
export const argTypeBoolFalse = {
  defaultValue: false,
  control: { type: 'boolean' },
}
export const variants = [
  'primary',
  'secondary',
  'danger',
  'warning',
  'success',
  'transparent',
]
export const argTypeVariants = {
  defaultValue: 'primary',
  control: {
    type: 'select',
    options: variants,
  },
}
export default {
  argTypeText,
  argTypeTextTitle,
  argTypeTextContent,
  argTypeBoolTrue,
  argTypeBoolFalse,
  variants,
  argTypeVariants,
}
