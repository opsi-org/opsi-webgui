export function assert(condition: any, message: string = 'Type error') {
  if (!condition) {
    console.error(message)
    throw new Error(message)
  }
}
