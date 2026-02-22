const OptionModel = require('../models/optionModel');

const getOptions = async (req, res) => {
    try {
        const options = await OptionModel.getAll();
        res.json(options);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error fetching options' });
    }
};

module.exports = {
    getOptions
};
