interface BookMetaData {

}

export default class Book {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly metadata: BookMetaData
  ) { }
}