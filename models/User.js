import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const User = sequelize.define(
  "users",
  {
    fullName: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.ENUM(["Male", "Female"]),
    },
    year_of_birthday: {
      type: DataTypes.DATEONLY,
    },
    school: {
      type: DataTypes.STRING,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM(["admin", "user"]),
    },
  },
  { timestamps: true }
);

export default User;
