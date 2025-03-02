/*!
 * Authentication Repository
 */
'use strict';

/**
 * Module dependencies.
 * @private
 */
const { StatusCodes } = require('http-status-codes');
const { User } = require('../services/user.service');
const Utils = require('../utils/utils');
const config = require('../config/config.js');

const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function AuthRepository() { }

AuthRepository.prototype.signup = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const userId = uuidv4();

    const response = await User.add({
      userId,
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });

    if (response) {
      return res.status(StatusCodes.CREATED).json({
        error: false,
        msg: 'Signup successful.',
      });
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      error: true,
      msg: 'Error signing up new user.',
    });

  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: true, msg: 'Server error' });
  }
};

AuthRepository.prototype.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.get({ email });

    if (!Utils.isValid(user)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: true,
        msg: 'Incorrect login details!',
      });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: true,
        accessToken: null,
        msg: 'Incorrect login details!',
      });
    }

    user.last_login_date = Utils.getDate();
    await user.save();

    const token = jwt.sign({ id: user.userId }, config.secret, { expiresIn: 86400 });

    return res.status(StatusCodes.OK).json({
      error: false,
      accessToken: token,
    });

  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: true, msg: 'Server error' });
  }
};

AuthRepository.prototype.forgotPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    const response = await User.update({ password: hashedPassword }, { email });

    if (response) {
      return res.status(StatusCodes.OK).json({
        error: false,
        msg: 'A mail containing your new password has been sent.',
      });
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      error: true,
      msg: 'Error updating new password.',
    });

  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: true, msg: 'Server error' });
  }
};

AuthRepository.prototype.changePassword = async (req, res) => {
  try {
    const { password, new_password } = req.body;
    const userId = req.userId;

    const user = await User.get({ userId }, ['id', 'password']);

    if (!Utils.isValid(user)) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: true,
        msg: 'User not found.',
      });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: true,
        msg: 'Incorrect old password',
      });
    }

    user.password = bcrypt.hashSync(new_password, 8);
    await user.save();

    return res.status(StatusCodes.OK).json({
      error: false,
      msg: 'Password updated successfully.',
    });

  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: true, msg: 'Server error' });
  }
};

AuthRepository.prototype.delete = async (req, res) => {
  try {
    const userId = req.params.user;
    const response = await User.delete({ userId });

    if (response) {
      return res.status(StatusCodes.OK).json({
        error: false,
        msg: 'User deleted successfully.',
      });
    }

    return res.status(StatusCodes.NOT_FOUND).json({
      error: true,
      msg: 'Error deleting user.',
    });

  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: true, msg: 'Server error' });
  }
};

AuthRepository.prototype.accountExists = async (email) => {
  try {
    const user = await User.get({ email });
    return !!Utils.isValid(user);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

AuthRepository.prototype.isActive = async (email) => {
  try {
    const user = await User.get({ email });
    return user?.active || false;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = new AuthRepository();
