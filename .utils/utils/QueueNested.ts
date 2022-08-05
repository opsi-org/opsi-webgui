export default class QueueNested {
  elements: Array<any>
  max_elements: number = -1
  first_page_number: number = 0
  last_page_number: number = 0
  totalPages: number = -1
  title: string = 'DefaultQueue'
  scrollDirection: 'none'|'up'|'down' = 'none'

  constructor(max, title='DefaultQueue') {
    console.log(this.title, 'Queue constructor')
    this.elements = []
    this.max_elements = max
    this.title = title
    if (this.max_elements <= 0) {
      throw new Error('Queue max_elements must be > 0)');
    }
  }

  enqueueHead(pnr:number, element: Array<any>) {
    this.first_page_number = pnr
    let elements = [...this.elements]
    elements.unshift(element); // add new page to front
    if (elements.length > this.max_elements){
      elements.length = this.max_elements // cut tail if more pages as capacity
      this.last_page_number = this.last_page_number - 1
    }

    if (this.totalPages > 0 && this.last_page_number > this.totalPages) {
      this.last_page_number = this.totalPages
    }

    this.elements = elements
    console.debug(this.title, 'Queue enqueueHead page_numbers', this.first_page_number, this.last_page_number)
  }
  enqueueTail(pnr: number, element: Array<any>) {
    let elements = [...this.elements]
    this.last_page_number = pnr

    elements.push(element)
    if (elements.length > this.max_elements) {
      elements.shift()
      this.first_page_number = this.first_page_number + 1
      if (this.first_page_number <= 0) this.first_page_number = 0
    }
    this.elements = elements

    console.debug(this.title, 'Queue enqueueTail page_numbers', this.first_page_number, this.last_page_number)
  }

  set(pnr:number, element: Array<any>) {
    if (!element) return
    this.first_page_number = pnr
    this.last_page_number = pnr
    this.elements = [element]
    console.debug(this.title, 'Queue set page_numbers', this.first_page_number, this.last_page_number)
  }
  setAuto (pnr:number, element: Array<any>) {
    if (!element) return
    if (pnr == this.first_page_number-1) {
      this.enqueueHead(pnr, element)
    } else if (pnr == this.last_page_number+1) {
      this.enqueueTail(pnr, element)
    } else {
      this.first_page_number = pnr
      this.last_page_number = pnr
      this.elements.length = 0
      this.elements.push(element)
      console.debug(this.title, 'Queue setAuto page_numbers', this.first_page_number, this.last_page_number)
    }
  }

  flat() {
    this.elements.filter(e => e)
    return this.elements.flat();
  }
  setTotalPages (totalPages:number) {
    this.totalPages = totalPages
  }
  get length() {
    return this.elements.length;
  }
  get elementLength() {
    let l = 0
    for (let i = 0; i < this.elements.length; i++) {
      l += this.elements[i].length;
    }
    return l;
  }
  get isEmpty() {
    return this.elements.length === 0;
  }

}


// export default {
//   Queue
// }
