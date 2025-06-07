const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db'); // PostgreSQL pool
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.listen(8081, () => {
    console.log('Server is running!');
});

// GET all users
app.get('/', (req, res) => {
    pool.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(results.rows);
        }
    });
});

// POST new user
app.post('/add', (req, res) => {
    const { first_name, last_name, email } = req.body;
    pool.query(
        'INSERT INTO users (first_name, last_name, email) VALUES ($1, $2, $3) RETURNING id',
        [first_name, last_name, email],
        (err, results) => {
            if (err) {
                console.error('Unable to add data!', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(201).json({
                message: 'User added successfully',
                insertedId: results.rows[0].id,
            });
        }
    );
});

// PUT update user
app.put('/update', (req, res) => {
    const { first_name, last_name, email, id } = req.body;
    pool.query(
        'UPDATE users SET first_name=$1, last_name=$2, email=$3 WHERE id=$4',
        [first_name, last_name, email, id],
        (err, results) => {
            if (err) {
                console.error('Unable to update data!', err);
                return res.status(500).send('Internal Server Error');
            }
            if (results.rowCount === 0) {
                return res.status(404).send('User not found');
            }
            res.json({ message: 'User updated successfully' });
        }
    );
});

// DELETE user
app.delete('/delete', (req, res) => {
    const { id } = req.query;
    pool.query('DELETE FROM users WHERE id=$1', [id], (err, results) => {
        if (err) {
            console.error('Unable to delete data!', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json({ message: 'User deleted successfully' });
    });
});
