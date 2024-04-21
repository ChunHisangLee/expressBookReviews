const express = require('express');
let books = require("./booksdb.js");
let users = {};
const public_users = express.Router();


function fetchBooks() {
    return new Promise((resolve) => {
        setTimeout(() => resolve(books), 100); // Simulate network delay
    });
}

function fetchBookByIsbn(isbn) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject('Book not found');
            }
        }, 100);
    });
}

function fetchBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const result = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
            if (result.length) {
                resolve(result);
            } else {
                reject('No books found for this author');
            }
        }, 100);
    });
}

function fetchBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const result = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
            if (result.length) {
                resolve(result);
            } else {
                reject('No books found with this title');
            }
        }, 100);
    });
}

public_users.post("/register", (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({error: "Username and password are required"});
    }
    if (users[username]) {
        return res.status(409).json({error: "Username already exists"});
    }
    users[username] = {username, password}; // Simplified user creation
    return res.status(201).json({message: "User registered successfully"});
});


// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        const books = await fetchBooks();
        return res.json(books);
    } catch (error) {
        return res.status(500).json({error: 'Failed to fetch books'});
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const {isbn} = req.params;
    try {
        const book = await fetchBookByIsbn(isbn);
        return res.json(book);
    } catch (error) {
        return res.status(404).send({error});
    }
});


// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const {author} = req.params;
    try {
        const books = await fetchBooksByAuthor(author);
        return res.json(books);
    } catch (error) {
        return res.status(404).send({error});
    }
});


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const {title} = req.params;
    try {
        const books = await fetchBooksByTitle(title);
        return res.json(books);
    } catch (error) {
        return res.status(404).send({error});
    }
});


//  Get book review
public_users.get('/isbn/:isbn', async (req, res) => {
    const {isbn} = req.params;
    try {
        const book = await fetchBookByIsbn(isbn);
        return res.json(book);
    } catch (error) {
        return res.status(404).send({error});
    }
});

module.exports.general = public_users;
