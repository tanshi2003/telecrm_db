const db = require("../config/db");
const bcrypt = require("bcrypt");
const responseFormatter = require("../utils/responseFormatter");

// Get all employees
exports.getEmployees = (req, res) => {
    db.query("SELECT * FROM Employees", (err, results) => {
        if (err) {
            return res.status(500).json(responseFormatter(false, "Database error"));
        }

        res.json(responseFormatter(true, "Employees fetched successfully", results));
    });
};

// Create a new employee
exports.createEmployee = (req, res) => {
    const { name, email, phone_no, password, role } = req.body;

    if (!name || !email || !phone_no || !password || !role) {
        return res.status(400).json(responseFormatter(false, "All fields are required"));
    }

    // Check if the employee already exists
    db.query("SELECT * FROM Employees WHERE email = ?", [email], (err, results) => {
        if (err) {
            return res.status(500).json(responseFormatter(false, "Database error"));
        }

        if (results.length > 0) {
            return res.status(400).json(responseFormatter(false, "Employee already exists"));
        }

        // Hash the password
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json(responseFormatter(false, "Error hashing password"));
            }

            // Insert the new employee into the database
            db.query("INSERT INTO Employees (name, email, phone_no, password, role) VALUES (?, ?, ?, ?, ?)", [name, email, phone_no, hash, role], (err, results) => {
                if (err) {
                    return res.status(500).json(responseFormatter(false, "Database error"));
                }

                res.status(201).json(responseFormatter(true, "Employee created successfully"));
            });
        });
    });
};

// Update an employee
exports.updateEmployee = (req, res) => {
    const { id } = req.params;
    const { name, email, phone_no, role } = req.body;

    if (!name || !email || !phone_no || !role) {
        return res.status(400).json(responseFormatter(false, "All fields are required"));
    }

    db.query("UPDATE Employees SET name = ?, email = ?, phone_no = ?, role = ? WHERE id = ?", [name, email, phone_no, role, id], (err, results) => {
        if (err) {
            return res.status(500).json(responseFormatter(false, "Database error"));
        }

        res.json(responseFormatter(true, "Employee updated successfully"));
    });
};

// Delete an employee
exports.deleteEmployee = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM Employees WHERE id = ?", [id], (err, results) => {
        if (err) {
            return res.status(500).json(responseFormatter(false, "Database error"));
        }

        res.json(responseFormatter(true, "Employee deleted successfully"));
    });
};