const User = require('../models/Users');
const express = require('express');
const router = express.Router();


const createUser = async (userData) => {
    const { username, password, rol, correo } = userData;
    console.log(userData);
    console.log('username',username)
    try {
        const newUser = new User({ username, password, rol, correo });
        await newUser.save();
        return { success: true, message: 'User created successfully', user: newUser };
    } catch (error) {
        return { success: false, message: 'Error creating user', error };
    }
};
const getUsers = async () => {
    try {
        const users = await User.find({}, { password: 0 }); // No incluir la contraseña en los resultados
        return { success: true, users };
    } catch (error) {
        return { success: false, message: 'Error fetching users', error };
    }
};
const getUserById = async (id) => {
    try {
        const user = await User.findById(id, { password: 0 });
        if (!user) return { success: false, message: 'User not found' };
        return { success: true, user };
    } catch (error) {
        return { success: false, message: 'Error fetching user', error };
    }
};
const updateUser = async (id, updates) => {
    try {
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }
        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!updatedUser) return { success: false, message: 'User not found' };
        return { success: true, message: 'User updated successfully', user: updatedUser };
    } catch (error) {
        return { success: false, message: 'Error updating user', error };
    }
};
const deleteUser = async (id) => {
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return { success: false, message: 'User not found' };
        return { success: true, message: 'User deleted successfully', user: deletedUser };
    } catch (error) {
        return { success: false, message: 'Error deleting user', error };
    }
};

router.post('/users', async (req, res) => {
    const result = await createUser(req.body);
    res.status(result.success ? 201 : 400).json(result);
});
router.get('/users', async (req, res) => {
    const result = await getUsers();
    res.status(result.success ? 200 : 400).json(result);
});
router.get('/users/:id', async (req, res) => {
    const result = await getUserById(req.params.id);
    res.status(result.success ? 200 : 404).json(result);
});
router.put('/users/:id', async (req, res) => {
    const result = await updateUser(req.params.id, req.body);
    res.status(result.success ? 200 : 400).json(result);
});
router.delete('/users/:id', async (req, res) => {
    const result = await deleteUser(req.params.id);
    res.status(result.success ? 200 : 400).json(result);
});

module.exports = router;