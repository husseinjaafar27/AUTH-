import { DataTypes } from "sequelize";
import sequelize from "../database.js";

const Code = sequelize.define("codes", {
  code: {
    type: DataTypes.STRING,
  },
  user: {
    type: DataTypes.STRING,
  },
});

export default Code;
