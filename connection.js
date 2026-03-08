import mysql from 'mysql2';

// Create MySQL connection pool
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "CURIO",
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10,
});

db.connect(err => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("MySQL connected successfully 🔌");
});

export default db;