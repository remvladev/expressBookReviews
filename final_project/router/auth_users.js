const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = { accessToken, username }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Get current user logged in
    const user = req.session.authorization.username;
    // Get isbn and review by the logged-in user 
    const review = req.body.review;
    const isbn = req.params.isbn;
    if (!review){
        return res.status(400).send("Review is empty");
    } else {
        books[isbn].reviews[user] = review;
        return res.status(200).send("Review is updated by " + user);
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Get current user logged in
    const user = req.session.authorization.username;
    // Get isbn by the logged in user 
    const isbn = req.params.isbn;
    // Delete the review based on logged in user
    if (!books[isbn]){
        res.status(400).send("Book with ISBN " + isbn + " not found");
    } else {
        delete books[isbn].reviews[user];
        return res.status(200).send("Review by " + user +  " deleted");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
