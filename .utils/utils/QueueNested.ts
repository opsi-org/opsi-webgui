export default class QueueNested {
  elements: Array<any>
  max_elements: number = -1
  first_page_number: number = 0
  last_page_number: number = 0
  totalPages: number = -1
  scrollDirection: 'none'|'up'|'down' = 'none'

  constructor(max) {
    console.log('Queue constructor')
    this.elements = []
    this.max_elements = max
    if (this.max_elements <= 0) {
      throw new Error('Queue max_elements must be > 0)');
    }
  }

  enqueueHead(pnr:number, element: Array<any>) {
    this.first_page_number = pnr
    let elements = [...this.elements]
    elements.unshift(element); // add to front
    if (elements.length > this.max_elements){
      elements.length = this.max_elements // cut tail
      this.last_page_number = this.last_page_number - 1
    }

    if (this.totalPages > 0 && this.last_page_number > this.totalPages)
      this.last_page_number = this.totalPages
    // console.log('Queue elements ', elements)

    console.log('pages in cache: ', this.first_page_number, this.last_page_number)
    this.elements = elements
  }
  enqueueTail(pnr: number, element: Array<any>) {
    let elements = [...this.elements]
    this.last_page_number = pnr

    elements.push(element)
    if (elements.length > this.max_elements) {
      elements.shift()
      // this.first_page_number = pnr - elements.length#
      this.first_page_number = this.first_page_number + 1
      if (this.first_page_number <= 0) this.first_page_number = 0
    }
    console.log('pages in cache: ', this.first_page_number, this.last_page_number)
    this.elements = elements
  }
  // enqueueTail(pnr: number, element: Array<any>) {
  //   let elements = [...this.elements]
  //   this.last_page_number = pnr
  //   if (elements.length >= this.max_elements) {
  //     elements.shift()
  //     console.log('Queue shift ', elements)
  //     this.first_page_number = pnr - elements.length
  //     if (this.first_page_number <= 0)
  //       this.first_page_number = 0
  //   }

  //   if (elements.length < this.max_elements) {
  //     console.log('Queue pushEnd ', element)
  //     elements.push(element)
  //   }
  //   this.elements = elements
  // }

  set(pnr:number, element: Array<any>) {
    console.log('Queue set ', element)
    if (!element) return
    this.first_page_number = pnr
    this.last_page_number = pnr
    this.elements = [element]
    // console.log('Queue elements ', this.elements)

    console.log('pages in cache: ', this.first_page_number, this.last_page_number)
  }
  setAuto (pnr:number, element: Array<any>) {
    console.log('Queue set ', element)
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
      console.log('Queue elements ', this.elements)
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
