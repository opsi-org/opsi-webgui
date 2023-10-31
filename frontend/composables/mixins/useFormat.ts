
export const useFormat = () => {
// @Component export class Format extends Vue {
  function date (value:any) {
    if (typeof value === 'object') {
      return value
    } else if (value !== '' || value !== undefined || value !== null) {
      return new Date(value).toString()
    } else { return '' }
  }
  return { date }
}
