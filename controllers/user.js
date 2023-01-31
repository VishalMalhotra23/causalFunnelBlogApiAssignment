const User = require("../models/user");

exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      //if (err) {
      console.log(err);
      return res.status(400).json({
        error: "No user was found in DB",
      });
    }
    req.profile = user;
    next();
  });
};

exports.getUser = (req, res) => {
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;
  req.profile.createdAt = undefined;
  req.profile.updatedAt = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true, useFindAndModify: false },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "Update failedl",
        });
      }
      user.salt = undefined;
      user.encry_password = undefined;
      res.json(user);
    }
  );
};

exports.updateUserPassword = (req, res) => {
  const { email } = req.profile;
  // console.log(req.body);
  const { oldpassword, newpassword } = req.body;
  // console.log(oldpassword);

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "USER does not exist",
      });
    }
    if (!user.authenticate(oldpassword)) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }

    user.password = newpassword;
    user.save((err, user) => {
      if (err) {
        return res.status(400).json({
          err: "NOT able to save user in DB",
        });
      }
      res.json({
        name: user.name,
        email: user.email,
        id: user._id,
      });
    });
  });
};
