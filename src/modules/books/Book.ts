interface BookMetaData {

}

export default class Book {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly author: string,
    readonly imageUrl: string,
    readonly publishedOn: string,
    readonly summary?: string
  ) { }
}