const express = require('express');
const axios = require('axios').default;
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!isValid(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    // Simulate an asynchronous operation
    const getBooks = async () => {
      return new Promise((resolve) => {
        resolve(JSON.stringify(books, null, 4));
      });
    };
  
    try {
      const booksData = await getBooks();
      res.send(booksData);
    } catch (error) {
      res.status(500).send({ error: 'An error occurred while fetching books data' });
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const getBookByISBN = async (isbn) => {
      return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
          resolve(book);
        } else {
          reject('Book not found');
        }
      });
    };
  
    try {
      const isbn = req.params.isbn;
      const bookDetails = await getBookByISBN(isbn);
      res.send(bookDetails);
    } catch (error) {
      res.status(404).send({ error: error });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        const bookByAuthor = await Object.values(books).filter(book => book.author === author);
        res.send(bookByAuthor);
    } catch (error) {
        res.status(500).send({ error: 'An error occurred while fetching the books.' });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;
        const getBooksByTitle = async (title) => {
            return new Promise((resolve) => {
                const bookByTitle = Object.values(books).filter(book => book.title === title);
                resolve(bookByTitle);
            });
        };
        const bookByTitle = await getBooksByTitle(title);
        res.send(bookByTitle);
    } catch (error) {
        res.status(500).send({ error: 'An error occurred while fetching the book by title.' });
    }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  res.send(books[isbn].review);
});

module.exports.general = public_users;
