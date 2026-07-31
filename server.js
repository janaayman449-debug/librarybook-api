import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "books.json");

function readBooks() {
  try {
    const data = fs.readFileSync(filePath, "utf8");

    if (!data) return [];

    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveBooks(books) {
  fs.writeFileSync(filePath, JSON.stringify(books, null, 2));
}

const server = http.createServer((req, res) => {

  res.setHeader("Content-Type", "application/json");

  // ================= GET =================

  if (req.method === "GET" && req.url === "/books") {

    const books = readBooks();

    res.writeHead(200);

    return res.end(JSON.stringify(books));
  }

  // ================= POST =================

  if (req.method === "POST" && req.url === "/books") {

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {

      try {

        const books = readBooks();

        const newBook = JSON.parse(body);

        newBook.id =
          books.length > 0
            ? books[books.length - 1].id + 1
            : 1;

        books.push(newBook);

        saveBooks(books);

        res.writeHead(201);

        res.end(JSON.stringify(newBook));

      } catch {

        res.writeHead(400);

        res.end(
          JSON.stringify({
            message: "Invalid JSON"
          })
        );
      }

    });

    return;
  }

  // ================= DELETE =================

  if (req.method === "DELETE" && req.url.startsWith("/books/")) {

    const id = Number(req.url.split("/")[2]);

    const books = readBooks();

    const index = books.findIndex(book => book.id === id);

    if (index === -1) {

      res.writeHead(404);

      return res.end(
        JSON.stringify({
          message: "Book not found"
        })
      );
    }

    const deletedBook = books.splice(index, 1);

    saveBooks(books);

    res.writeHead(200);

    return res.end(JSON.stringify(deletedBook[0]));
  }

  // ================= Invalid Route =================

  res.writeHead(404);

  res.end(
    JSON.stringify({
      message: "Route not found"
    })
  );

});

server.listen(3000, () => {

  console.log("Server Running...");
  console.log("http://localhost:3000");

});