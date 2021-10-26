export interface ChangeObj {
  user: string,
  depotId: string,
  clientId: string,
  productId: string,
  property: string,
  propertyValue: Array<boolean|string>
  type: string,
  actionRequest: string
}
