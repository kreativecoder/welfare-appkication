import jwt from "jsonwebtoken";

import { user } from "../models";

// Proteect admin route
export const adminProtect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(403).json({
      status: 403,
      success: false,
      error: "Not authorized to view this resource"
    });
  }

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.secretOrkey);
    if (decoded.role === "admin") {
      req.user = await user.findByPk(decoded.id);
    } else {
      return res.status(403).json({
        status: 403,
        success: false,
        error: "Not authorized to view this resource"
      });
    }

    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: err
    });
  }
};

export const userProtect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(403).json({
      status: 403,
      success: false,
      error: "Not authorized to view this resource"
    });
  }

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.secretOrkey);
    if (decoded.role === "admin" || decoded.role ==="user") {
      req.user = await user.findByPk(decoded.id);
    } else {
      return res.status(403).json({
        status: 403,
        success: false,
        error: "Not authorized to view this resource"
      });
    }

    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: err
    });
  }
};
