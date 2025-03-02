/*!
 * User Repository
 */
'use strict';

/**
 * Module dependencies.
 * @private
 */

const { StatusCodes } = require('http-status-codes'); // Import thư viện
const { User } = require('../services/user.service');
const Utils = require('../utils/utils');

function UserRepository() { }

UserRepository.prototype.getAllUsers = async (req, res) => {
  try {
    let users = await User.getAllWithOrdered([['createdAt', 'DESC']]);
    let response = Object.assign({}, users);
    if (Utils.isValid(response)) {
      return res.status(StatusCodes.OK).send(users);
    }
    return res.status(StatusCodes.OK).json([]);
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: true, msg: 'Server error' });
  }
};

UserRepository.prototype.getProfile = async (req, res) => {
  let userId = req.userId;

  try {
    const user = await User.get(
      { userId: userId },
      ['userId', 'first_name', 'last_name', 'email', 'interests']
    );

    if (Utils.isValid(user)) {
      return res.status(StatusCodes.OK).send(user);
    }

    return res.status(StatusCodes.NOT_FOUND).json({
      error: true,
      msg: 'User not found.',
    });

  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: true, msg: 'Server error' });
  }
};

UserRepository.prototype.updateProfile = async (req, res) => {
  let userId = req.userId;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;

  try {
    const user = await User.get(
      { userId: userId },
      ['id', 'userId', 'first_name', 'last_name', 'email', 'interests']
    );

    if (Utils.isValid(user)) {
      user.first_name = first_name;
      user.last_name = last_name;
      user.updatedAt = Utils.getDate();
      await user.save();

      return res.status(StatusCodes.OK).send({
        error: false,
        user: user,
      });
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      error: true,
      msg: 'An error occurred while updating profile. Please try again.',
    });

  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: true, msg: 'Server error' });
  }
};

module.exports = new UserRepository();
