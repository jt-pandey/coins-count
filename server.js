require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 10000;


app.use(bodyParser.json());

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const coinSchema = new mongoose.Schema({
    coins: { type: Number, required: true }, // Number of coins
});

const Coin = mongoose.model('Coin', coinSchema);

app.get('/coins', async (req, res) => {
    try {
        let record = await Coin.findOne();

        if (!record) {
            // If no record exists, create a default record with 0 coins
            record = new Coin({ coins: 0 });
            await record.save();
        }

        res.json({ coins: record.coins });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Set the number of coins
app.post('/coins', async (req, res) => {
    try {
        const { coins } = req.body;

        if (coins == null) {
            return res.status(400).json({ message: 'Coins value is required' });
        }

        // Clear any existing record and store the new value
        await Coin.deleteMany(); // Ensure only one record exists
        const record = new Coin({ coins });
        await record.save();

        res.json({ coins: record.coins });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Initialize the coins (if no record exists)
app.post('/coins/init', async (req, res) => {
    try {
        const { coins } = req.body;

        if (coins == null) {
            return res.status(400).json({ message: 'Coins value is required' });
        }

        // Check if a record already exists
        const existingRecord = await Coin.findOne();
        if (existingRecord) {
            return res.status(400).json({ message: 'Coins record already exists' });
        }

        const record = new Coin({ coins });
        await record.save();

        res.json({ message: 'Coins initialized', coins: record.coins });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
