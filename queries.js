// find book by genre
db.books.find({ genre: 'Fiction' });

// find books published in specific year
db.books.find({ published_year: { $gt: 1950 } });

// find book by author
db.books.find({ author: 'George Orwell' });

// Update 
db.books.updateOne(
  { title: 'The Hobbit' },
  { $set: { price: 15.99 } }
);

// delete specific book
db.books.deleteOne({ title: 'Moby Dick' });

// Task 3 Advanced queries

// Find books that are both in stock and published after 2010
db.books.find({
    $and: [
        { in_stock: true },
        { published_year: { $gt: 2010 } }
    ]
})

// Use projection to return only the title, author, and price fields
db.books.find(
    { genre: "Fantasy" }, 
    { title: 1, author: 1, price: 1, _id: 0 } 
)

// Implement sorting to display books by price (ascending)
db.books.find().sort({ price: 1 }) 

// Implement sorting to display books by price (descending)
db.books.find().sort({ price: -1 }) 

// Use limit and skip methods to implement pagination (5 books per page)

// Page 1 (first 5 books)
db.books.find().limit(5).skip(0)

// Page 2 (next 5 books)
db.books.find().limit(5).skip(5)

// Page 3 (next 5 books, if any)
db.books.find().limit(5).skip(10)

// Task 4: Aggretion pipelines
db.books.aggregate([
    {
        $group: {
            _id: "$genre", 
            average_price: { $avg: "$price" },
            count: { $sum: 1 }
        }
    },
    {
        $sort: { average_price: -1 } // Sort by average price descending
    }
])

// Find the author with the most books in the collection
db.books.aggregate([
    {
        $group: {
            _id: "$author", 
            book_count: { $sum: 1 } 
        }
    },
    {
        $sort: { book_count: -1 } 
    },
    {
        $limit: 1 
    }
])

// Implement a pipeline that groups books by publication decade and counts them
db.books.aggregate([
    {
        $project: {
            _id: 0, 
            title: 1,
            published_year: 1,
            // Calculate the decade: (year - year % 10)
            publication_decade: {
                $subtract: [
                    "$published_year",
                    { $mod: ["$published_year", 10] }
                ]
            }
        }
    },
    {
        $group: {
            _id: "$publication_decade", 
            book_count: { $sum: 1 } 
        }
    },
    {
        $sort: { _id: 1 } 
    }
])


// task 5 Create Indexes
// Create an index on the 'title' field for faster searches
db.books.createIndex({ title: 1 }) 

// Create a compound index on 'author' and 'published_year'
db.books.createIndex({ author: 1, published_year: -1 }) 

// Verify indexes
db.books.getIndexes()

// Demonstrate Performance Improvement with explain()

// Query without index (or before creating index)
print("--- Explaining query without using indexes (force scan) ---")
db.books.find({ title: "The Hobbit" }).explain("executionStats")
// Look for "COLLSCAN" in the "winningPlan" -> "stage" field, indicating a collection scan.

// Query with single index on 'title'
print("\n--- Explaining query using 'title' index ---")
db.books.find({ title: "The Hobbit" }).explain("executionStats")
// Look for "IXSCAN" (Index Scan) in the "winningPlan" -> "stage" field.
// This indicates that the index was used.

// Query with compound index on 'author' and 'published_year'
print("\n--- Explaining query using 'author' and 'published_year' compound index ---")
db.books.find({ author: "J.R.R. Tolkien", published_year: { $gt: 1900 } }).explain("executionStats")
// Look for "IXSCAN" in the "winningPlan" -> "stage" field.
// The compound index should be used for queries that filter on 'author' or on both 'author' and 'published_year'.

// Example where only part of compound index is used (prefix)
print("\n--- Explaining query using only 'author' part of compound index ---")
db.books.find({ author: "Jane Austen" }).explain("executionStats")
// This should also use the compound index, as 'author' is the prefix.