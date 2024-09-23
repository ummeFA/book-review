// Getting the book list available in the shop
app.get('/books', async (req,res)=>{
    try{
        const books = await Book.find();
        res.json(books);
    }catch(err){
        res.status(500).send(err.message);
    }
});

// Add an endpoint that retrives book details by ISBN
app.get('/books/isbn/:isbn', async (req, res)=>{
    try{
        const book = await Book.findOne({isbn: req.params.isbn});
        res.json(book);
    }catch(err){
        res.status(500).send(err.message);
    }
});

// An endpoint to retrieve  all books written by a specific author
app.get('/books/author/:author', async(req,res)=>{
    try{
        const books= await Book.find({author:  req.params.author});
        res.json(books);
    }catch(err){
        res.status(500).send(err.message);
    }
});

// An endpoint to get the books based on their title
app.get('/books/title/:title', async(req,res)=>{
    try{
        const books= await Book.find({title:  req.params.title});
        res.json(books);
    }catch(err){
        res.status(500).send(err.message);
    }
});

// An endpoint to retrieve reviews or comments for a specific book
app.get('/books/:id/reviews', async(req,res)=>{
    try{
        const books= await Review.find({bookId:  req.params.id});
        res.json(reviews);
    }catch(err){
        res.status(500).send(err.message);
    }
});

/* Authentication */
// Register a new user

// Register a new user
app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
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

// Login as a registered user
const jwt = require('jsonwebtoken');

app.post('/login', async(req,res)=>{
    const{username, password} = req.body;
    try{
        const user =await User.findOne({username});
        if(!user) return res.status(400).json({message: "Invalid credentials"
        });

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({message: "Invalid credentials"});
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET,{expiresIn: '1h'});
        res.json({token});
    }catch(err){
        res.status(500).send(err.message);
    }
});

// Add/ modify a book review- only for logged in users
app.post('/books/:id/reviews', authenticateJwt, async(req, res)=>{
    const {review}= req.body;
    const userId = req.user.userId;

    try{
        const newReview = new Review({userId, bookId: req.params.id,review});
        await newReview.save();
        res.status(201).json(newReview);
    }catch(err){
        res.status(500).send(err.message);
    }
});

// Modify a review-only the user's own review
app.put('/books/:id/reviews/reviewId', authenticateJwt, async(req, res)=>{
    const {review}= req.body;
    const userId= req.user.userId;

    try{
        const existingReview = await Review.findOne({_id: req.params.reviewId, usedId});
        if(!existingReview) return res.status(403).json({message: "Not authorized"});

        existingReview.review = review;
        await existingReview.save();
        res.json(existingReview);
    }catch(err){
        res.status(500).send(err.message);
    }
});

// Delete a book review
app.delete('/books/:id/reviews/:reviewId', authenticateJwt, async(req, res)=>{
    const userId = req.user.usedId;

    try{
        const review = await Review.findOne({_id: req.params.reviewId, userId});
        if(!review) return res.status(403).json({message: 'Not authorized'});
        await review.remove();
        res.json({message: 'Review deleted'});
    }catch(err){
        res.status(500).send(err.message);
    }
});

// Get all the books using async callback function

app.get('/async/books', (req, res)=>{
    Book.find((err,books)=>{
        if(err) return res.status(500).send(err.message);
        res.json(books);
    });
});

// Search by ISBN using Promises
app.get('/promise/books/isbn/:isbn', (req, res)=>{
    new Promise((resolve, reject)=>{
        Book.findOne({isbn: req.params.isbn},(err, book)=>{
            if(err){
                return reject(err);
            }resolve(book);
        });
    
    })
    .then(book=>{
        res.json(book);
    })
    .catch(err=>{
        res.status(500).send(err.message);
    });
});

// Search by author using async/await
app.get('/asyncawait/books/author/:author', async (req, res)=>{
    try{
        const books =await Book.find({author : req.params.author});
        res.json(books);
    }catch(err){
        res.status(500).send(err.message);
    }
});

// Search by title using promises
app.get('/promise/books/title/:title', (req,res)=>{
    Book.find({title: req.params.title}). then(books=>{
        res.json(books);
    })
    .catch(err=>{
        res.status(500).send(err.message);
    });
});