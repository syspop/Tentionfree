const express = require('express');
const router = express.Router();
const { writeLocalJSON: writeDB, readLocalJSON: readDB } = require('../data/db');
const { authenticateAdmin } = require('../middleware/auth');

// GET Tickets
router.get('/tickets', authenticateAdmin, async (req, res) => {
    try {
        const tickets = await readDB('tickets.json');
        res.json(tickets);
    } catch (err) {
        console.error("Error reading tickets:", err);
        res.status(500).json({ error: 'Failed to read tickets' });
    }
});

// POST Ticket
router.post('/tickets', async (req, res) => {
    console.log("POST /api/tickets received");
    const { userId, userName, email, subject, desc, image } = req.body;

    if (!userId || !desc) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newTicket = {
        id: Date.now(),
        userId, userName, email, subject, desc, image,
        date: new Date().toISOString()
    };

    try {
        const allTickets = await readDB('tickets.json');
        allTickets.push(newTicket);
        await writeDB('tickets.json', allTickets);

        console.log("Ticket saved successfully.");
        res.json({ success: true, message: 'Ticket submitted' });
    } catch (err) {
        console.error("Error saving ticket:", err);
        return res.status(500).json({ success: false });
    }
});

// DELETE Ticket
router.delete('/tickets/:id', authenticateAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        let allTickets = await readDB('tickets.json');
        allTickets = allTickets.filter(t => t.id !== id);
        await writeDB('tickets.json', allTickets);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;
