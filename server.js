const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./jobtrack.db");

db.run(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    status TEXT NOT NULL,
    date TEXT NOT NULL
  )
`);

app.get("/api/jobs", (req, res) => {
  db.all("SELECT * FROM jobs ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        error: "Error al obtener candidaturas"
      });
    }

    res.json(rows);
  });
});

app.post("/api/jobs", (req, res) => {
  const { company, position, status, date } = req.body;

  if (!company || !position || !status || !date) {
    return res.status(400).json({
      error: "Todos los campos son obligatorios"
    });
  }

  const sql = `
    INSERT INTO jobs (company, position, status, date)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    sql,
    [company, position, status, date],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: "Error al guardar candidatura"
        });
      }

      res.status(201).json({
        id: this.lastID,
        company,
        position,
        status,
        date
      });
    }
  );
});

app.put("/api/jobs/:id", (req, res) => {
  const { company, position, status, date } = req.body;
  const { id } = req.params;

  const sql = `
    UPDATE jobs
    SET company = ?, position = ?, status = ?, date = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [company, position, status, date, id],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: "Error al actualizar candidatura"
        });
      }

      res.json({
        id: Number(id),
        company,
        position,
        status,
        date
      });
    }
  );
});

app.delete("/api/jobs/:id", (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM jobs WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: "Error al eliminar candidatura"
        });
      }

      res.json({
        message: "Candidatura eliminada"
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`JobTrack funcionando en http://localhost:${PORT}`);
});