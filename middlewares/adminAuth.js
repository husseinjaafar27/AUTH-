import User from "../models/User.js";

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(401).json({
        message: "You should be admin to do this operation",
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err, message: "Error in admin middelware" });
  }
};

export default isAdmin;
