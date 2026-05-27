const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* Test API */

app.get("/", (req, res) => {
  res.send("Construction CRM Backend Running");
});

/* Add Expense */

app.post("/add-expense", (req, res) => {

  const {
    site,
    type,
    amount,
    supervisor,
    date,
  } = req.body;

  const sql = `
    INSERT INTO expenses
    (site, type, amount, supervisor, date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [site, type, amount, supervisor, date],
    (err, result) => {

      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Database Error",
        });
      }

      res.json({
        message: "Expense Added Successfully",
      });

    }
  );
});

/* Get Expenses */

app.get("/expenses", (req, res) => {

  const sql = "SELECT * FROM expenses ORDER BY id DESC";

  db.query(sql, (err, result) => {

    if (err) {
      return res.status(500).json({
        message: "Error Fetching Expenses",
      });
    }

    res.json(result);

  });
});

app.listen(5000, () => {
  console.log("Server Running on Port 5000");
});