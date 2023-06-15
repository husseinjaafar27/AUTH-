import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import validate from "validator";
import Code from "../models/Code.js";
import { sendMailPassword } from "../helpers/email.js";
import { generateCode } from "../helpers/generateCode.js";

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.expiresIn,
  });
  return token;
};

export const register = async (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    gender,
    year_of_birthday,
    school,
    role,
  } = req.body;
  try {
    if (
      !fullName ||
      !email ||
      !password ||
      !phone ||
      !gender ||
      !year_of_birthday ||
      !school ||
      !role
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const checkEmail = await User.findOne({ where: { email: email } });
    if (checkEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (!validate.isEmail(email)) {
      return res.status(400).json({ message: "The email is not valid" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be greater than or equal to 6" });
    }
    if (phone.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be greater than or equal to 6" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      gender,
      year_of_birthday,
      school,
      role,
    });
    const token = signToken(newUser.id);
    const code = generateCode(5);
    await new Code({
      code,
      user: newUser.id,
    }).save();
    sendMailPassword(newUser.email, newUser.fullName, code);
    return res.status(200).json({
      message:
        "User created successfully! Your verified code is sent to your email address",
      data: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
      token,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const activateUser = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({
        message: "invalid email address",
      });
    }
    const Dbcode = await Code.findOne({ where: { user: user.id } });
    if (!Dbcode) {
      return res.status(404).json({ message: "Code not found" });
    }
    if (Dbcode.code !== code) {
      return res.status(400).json({
        message: "Verification code is wrong..",
      });
    }
    if (user.verified === true) {
      return res.status(401).json({
        message: "Your account is already verified",
      });
    }
    user.isVerified = true;
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "Your account has been verified" });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err.message);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(400).json({ message: "Email is not exists" });
    }
    if (user.isVerified == 0) {
      return res.status(400).json({ message: "User is not verified" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    const token = signToken(user.id);
    return res.status(200).json({
      message: "login successfully",
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const updateUser = async (req, res) => {
  const { fullName, phone, gender, year_of_birthday, school } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    user.fullName = fullName ? fullName : user.fullName;
    user.phone = phone ? phone : user.phone;
    user.gender = gender ? gender : user.gender;
    user.year_of_birthday = year_of_birthday
      ? year_of_birthday
      : user.year_of_birthday;
    user.school = school ? school : user.school;
    await user.save();
    user.password = null;

    return res.status(200).json({
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.destroy({ where: { id: user.id } });
    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({
        message: "invalid email address",
      });
    }
    await Code.destroy({ where: { user: user.id } });
    const code = generateCode(5);
    await new Code({
      code,
      user: user.id,
    }).save();
    sendMailPassword(user.email, user.fullName, code);
    return res.status(200).json({
      status: "success",
      message: "Email reset code has been sent to your email",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

export const validateResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({
        message: "Invalid email address",
      });
    }
    const Dbcode = await Code.findOne({ where: { user: user.id } });
    if (Dbcode.code !== code) {
      return res.status(400).json({
        message: "Verification code is wrong..",
      });
    }
    return res
      .status(200)
      .json({ message: "You can now change your password" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { email, password, passwordConfirm } = req.body;

    if (!email || !password || !passwordConfirm) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ where: { email: email } });
    if (password.length <= 6) {
      return res
        .status(404)
        .json({ message: "Password must be greater than or equal to 6" });
    }
    if (password !== passwordConfirm) {
      return res
        .status(404)
        .json({ message: "Password and passwword confrim must be the same" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();
    return res
      .status(200)
      .json({ status: "success", message: "Password changed successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};
