const userNotification = require('../../models/notification'); // Replace with your actual model

// List all items
const listItems = async (req, res) => {
    try {
        const items = await userNotification.find();
        res.json(items);
    } catch (error) {
        console.error('Error listing items:', error);
        res.status(500).send('Error retrieving items');
    }
};

// View a specific item by ID
const viewItem = async (req, res) => {
    try {
        const item = await userNotification.findById(req.params.id);
        if (!item) return res.status(404).send('Item not found');
        res.json(item);
    } catch (error) {
        console.error('Error viewing item:', error);
        res.status(500).send('Error retrieving item');
    }
};

// Create a new item
const createItem = async (req, res) => {
    try {
        // Create a new item from the request body
        const newItem = new userNotification(req.body);

        // Save the item to the database
        await newItem.save();

        res.status(201).json({ message: 'Item created successfully', newItem });
    } catch (error) {
        console.error('Error creating item:', error);

        // Send a detailed error message for debugging
        res.status(500).json({ message: 'Error creating item', error: error.message });
    }
};


// Update an existing item
const updateItem = async (req, res) => {
    try {
        const updatedItem = await userNotification.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) return res.status(404).send('Item not found');
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).send('Error updating item');
    }
};

// Delete an item
const deleteItem = async (req, res) => {
    try {
        const deletedItem = await userNotification.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).send('Item not found');
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).send('Error deleting item');
    }
};

module.exports = {
    listItems,
    viewItem,
    createItem,
    updateItem,
    deleteItem,
};
