export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type Author = {
  __typename?: 'Author';
  name: Scalars['String'];
  books?: Maybe<Array<Book>>;
};

export type AuthorInput = {
  name: Scalars['String'];
};

export type Book = {
  __typename?: 'Book';
  author: Author;
  rating?: Maybe<Scalars['Float']>;
  title: Scalars['String'];
};

export type BookInput = {
  author?: Maybe<AuthorInput>;
  title: Scalars['String'];
};

export type Publisher = {
  __typename?: 'Publisher';
  name: Scalars['String'];
  authors?: Maybe<Array<Author>>;
  books?: Maybe<Array<Book>>;
};

export type Query = {
  __typename?: 'Query';
  authors?: Maybe<Array<Author>>;
  books?: Maybe<Array<Book>>;
  publisher?: Maybe<Publisher>;
};


export type QueryPublisherArgs = {
  name: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createAuthor: Author;
  contractBook: Scalars['Boolean'];
  /** Set the 0-5 star rating for a book */
  rateBook?: Maybe<Book>;
  writeBook: Book;
};


export type MutationCreateAuthorArgs = {
  input: AuthorInput;
};


export type MutationContractBookArgs = {
  bookInput: BookInput;
  publisherName: Scalars['String'];
};


export type MutationRateBookArgs = {
  title: Scalars['String'];
  rating: Scalars['Float'];
};


export type MutationWriteBookArgs = {
  input: BookInput;
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

