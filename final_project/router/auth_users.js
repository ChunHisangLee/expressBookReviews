const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => { //returns boolean
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }
    if (!isValid(username) || !authenticatedUser(username, password)) {
        return res.status(401).json({message: "Invalid username or password"});
    }
    const token = jwt.sign({username}, 'your_jwt_secret', {expiresIn: '1h'});
    return res.json({message: "Logged in successfully", token});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const {review} = req.body;
    const {isbn} = req.params;
    const {username} = jwt.verify(req.headers.authorization.split(' ')[1], 'your_jwt_secret');

    if (!books[isbn]) {
        books[isbn] = {reviews: []};
    }

    const existingReviewIndex = books[isbn].reviews.findIndex(r => r.username === username);
    if (existingReviewIndex >= 0) {
        books[isbn].reviews[existingReviewIndex].review = review;
    } else {
        books[isbn].reviews.push({username, review});
    }

    return res.json({message: "Review added or updated successfully"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const {isbn} = req.params;
    const {username} = jwt.verify(req.headers.authorization.split(' ')[1], 'your_jwt_secret');

    if (!books[isbn] || !books[isbn].reviews) {
        return res.status(404).json({message: "No reviews found for this ISBN"});
    }

    const initialLength = books[isbn].reviews.length;
    books[isbn].reviews = books[isbn].reviews.filter(review => review.username !== username);

    if (books[isbn].reviews.length === initialLength) {
        return res.status(404).json({message: "No review found for this user"});
    }

    return res.json({message: "Review deleted successfully"});
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
