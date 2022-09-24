const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Note = require('../models/Note');

// @desc    Get all users
// @route   GET /users
// @access  Private

const getAllUsers = asyncHandler(async (req, res) => {
	const users = await User.find().select('-password').lean();
	if (!users?.length) {
		return res.status(404).json({ message: 'No users found!' });
	}
	res.json(users);
});

// @desc    Create a user
// @route   POST /users
// @access  Private

const createNewUser = asyncHandler(async (req, res) => {
	const { userName, password, roles } = req.body;

	// Confirm Data
	if (!userName || !password || !roles.length || !Array.isArray(roles)) {
		return res.status(400).json({ message: 'All Fields are Required!' });
	}

	const userExists = await User.findOne({ userName }).lean().exec();
	if (userExists) {
		return res.status(409).json({ message: 'User already exists!' });
	}

	// Hash Password
	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await User.create({
		userName,
		password: hashedPassword,
		roles,
	});

	if (user) {
		res.status(201).json({ message: `New User ${userName} Created!` });
	} else {
		res.status(400).json({ message: 'Invalid user data received!' });
	}
});

// @desc    Update a user
// @route   PATCH /users
// @access  Private

const updateUser = asyncHandler(async (req, res) => {
	const { id, userName, password, roles, active } = req.body;

	// Confirm Data
	if (
		!id ||
		!userName ||
		typeof active !== 'boolean' ||
		!roles.length ||
		!Array.isArray(roles)
	) {
		return res.status(400).json({ message: 'All Fields are Required!' });
	}

	const user = await User.findById(id).exec();

	if (!user) {
		return res.status(400).json({ message: 'User not found!' });
	}

	// Check For Duplicate
	const userExists = await User.findOne({ userName }).lean().exec();
	if (userExists && userExists?._id.toString() !== id) {
		return res
			.status(409)
			.json({ message: 'User already exists! Duplicate Username' });
	}

	user.userName = userName;
	user.roles = roles;
	user.active = active;

	// Hash Password
	if (password) {
		const hashedPassword = await bcrypt.hash(password, 10);
		user.password = hashedPassword;
	}

	const updatedUser = await user.save();

	res.json({ message: `User ${updatedUser.userName} Updated!` });
});

// @desc    Delete a user
// @route   Delete /users
// @access  Private

const deleteUser = asyncHandler(async (req, res) => {
	const { id } = req.body;

	if (!id) {
		return res.status(400).json({ message: 'User Id is Required!' });
	}

	const note = await Note.find({ user: id }).lean().exec();
	if (note) {
		return res.status(400).json({ message: 'User has notes! Cannot delete!' });
	}

	const user = await User.findById(id).exec();

	if (!user) {
		return res.status(400).json({ message: 'User not found!' });
	}

	const result = await user.deleteOne();
	const reply = `UserName ${result.userName} with ID ${result._id} Deleted!`;

	res.json({ message: reply });
});

module.exports = {
	getAllUsers,
	createNewUser,
	updateUser,
	deleteUser,
};
