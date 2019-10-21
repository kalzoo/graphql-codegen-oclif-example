import { ApolloServer, gql } from "apollo-server";

const typeDefs = gql`
  type Author {
    name: String!
    books: [Book!]
  }

  input AuthorInput {
    name: String!
  }

  type Book {
    author: Author!
    rating: Float
    title: String!
  }

  input BookInput {
    author: AuthorInput
    title: String!
  }

  type Publisher {
    name: String!
    authors: [Author!]
    books: [Book!]
  }

  type Query {
    authors: [Author!]
    books: [Book!]
    publisher(name: String!): Publisher
  }

  type Mutation {
    createAuthor(input: AuthorInput!): Author!
    contractBook(bookInput: BookInput!, publisherName: String!): Boolean!
    """
    Set the 0-5 star rating for a book
    """
    rateBook(title: String!, rating: Float!): Book
    writeBook(input: BookInput!): Book!
  }
`;

interface AuthorRecord {
  name: string;
}

interface BookRecord {
  title: string;
  authorName: string;
  rating?: number;
}

interface PublisherRecord {
  name: string;
  bookTitles: string[];
}

const authors: AuthorRecord[] = [
  {
    name: "JK Rowling"
  }
];

const books: BookRecord[] = [
  {
    title: "Harry Potter & the Lucrative Franchise",
    authorName: "JK Rowling",
    rating: 3.5
  }
];

const publishers: PublisherRecord[] = [
  {
    name: "Random House",
    bookTitles: []
  },
  {
    name: "Prestigious University Press",
    bookTitles: []
  }
];

const resolvers = {
  Query: {
    authors: () => authors,
    books: () => books,
    publisher: (_: any, { name }: { name: string }) =>
      publishers.find(p => p.name === name)
  },
  Mutation: {
    createAuthor: (
      _: any,
      { input: { name } }: { input: { name: string } }
    ) => {
      authors.push({ name });
      return { name };
    },
    contractBook: (
      _: any,
      {
        bookInput,
        publisherName
      }: {
        bookInput: { title: string };
        publisherName: string;
      }
    ) => {
      const publisher = publishers.find(p => p.name === publisherName);
      if (publisher) {
        publisher.bookTitles.push(bookInput.title);
        return true;
      }
      return false;
    },
    rateBook: (
      _: any,
      {
        title,
        rating
      }: {
        title: string;
        rating: number;
      }
    ) => {
      const book = books.find(book => book.title === title);
      if (book) {
        book.rating = rating;
      }
      return book;
    },
    writeBook: (
      _: any,
      {
        input: {
          title,
          author: { name: authorName }
        }
      }: {
        input: {
          title: string;
          author: { name: string };
        };
      }
    ) => {
      const newBookRecord = { title, authorName };
      books.push(newBookRecord);
      return newBookRecord;
    }
  },
  Author: {
    books: (author: AuthorRecord) =>
      books.filter(b => b.authorName === author.name)
  },
  Book: {
    author: (book: BookRecord) => authors.find(a => a.name === book.authorName)
  },
  Publisher: {
    books: (publisher: PublisherRecord) =>
      publisher.bookTitles.map((title: string) =>
        books.find(b => b.title === title)
      )
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
