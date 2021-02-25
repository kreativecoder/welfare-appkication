import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

import { user} from "../models";

import {
  isNameValid,
  isEmpty,
  isEmailValid,
  isPhoneNumberValid,
  isPasswordValid,
  isNumberValid
} from "../middleware/validate";


const addUser = async (req, res, next) => {
  // get all variables from request body
  
  const {
    firstname,
    lastname,
    email,
    password,
    confirm_password,
    phone_number
  } = req.body;

  // check for any empty field before adding user
  if (
    isEmpty(firstname) ||
    isEmpty(lastname) ||
    isEmpty(email) ||
    isEmpty(password) ||
    isEmpty(confirm_password) ||
    isEmpty(phone_number)
  ) {
    return res.status(401).json({
      status: 401,
      error: "All fields are required"
    });
  }

  // check if there is an unwanted variable in name
  if (!isNameValid(firstname) || !isNameValid(lastname)) {
    return res.status(401).json({
      status: 401,
      error: "firstname and lastname must  be alphabets"
    });
  }
  // email format

  if (!isEmailValid(email)) {
    return res.status(401).json({
      status: 401,
      error: "Email do not match correct format"
    });
  }

  // check if the phone number is 11 values

  if (!isPhoneNumberValid(phone_number)) {
    return res.status(401).json({
      status: 401,
      error: "Phone number must be 11 numbers"
    });
  }

  // check if password length is greater than 6
  if (!isPasswordValid(password)) {
    return res.status(401).json({
      status: 401,
      error: "password must be greater than 6 characters"
    });
  }

  // cross cehck confirm password
  if (password !== confirm_password) {
    return res.status(409).json({
      status: 409,
      error: "password and confirm password must match"
    });
  }

  //Deal with db when after validations
  try {
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // check if either the name or the password exist in the db
    const checkUser = await user.findAll({
      where: {
        email,
        phone_number
      }
    });

    // check if the result of check is not empty
    if (checkUser.length) {
      return res.status(409).json({
        status: 409,
        success: false,
        message:
          "User with this email and phone number already exist please provide another email and phone number to add user"
      });
    }

    // store the user in the db if all went well
    const createdUser = await user.create({
      firstname,
      lastname,
      password: hashedPassword,
      email,
      phone_number
    });
    // if created user returns a result then let user know record has been created
    if (createdUser) {
      return res.status(201).json({
        status: 201,
        success: true,
        message: "You have successfully added a user"
      });
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
  return res.status(503).json({
    status: 503,
    message: "Unable to complete your request at this time please try later"
  });
};

// the function below takes care of the login
const userLogin = async (req, res, next) => {
  const { email, password } = req.body;

  if (isEmpty(email) || isEmpty(password)) {
    return res.status(400).json({
      status: 400,
      error: "email and password is required"
    });
  }
  if (!isEmailValid(email)) {
    return res.status(401).json({
      status: 401,
      error: "Invalid email field"
    });
  }
  try {
    const checkUser = await user.findOne({
      where: {
        email
      }
    });

    if (!checkUser) {
      return res.status(401).json({
        status: 401,
        error: "User with this credentials does not exist"
      });
    }
    // check if user account is not deactivated

    if (checkUser.dataValues.status === "deactivated") {
      return res.status(403).json({
        status: 403,
        success: false,
        message: "Your account has been deactivated contact the management"
      });
    }

    const passwordMatch = await bcrypt.compare(password, checkUser.password);
    
    
    if (passwordMatch) {
      const { id, role } = checkUser.dataValues;
      const payload = {
        id,
        role
      };

      // sign jwt with the details
      jwt.sign(
        payload,
        process.env.secretOrkey,
        { expiresIn: 10800000 },
        (error, token) => {
          if (error) throw error;

          return res.status(200).json({
            status: 200,
            message: "You have successfully logged in",
            token: `Bearer ${token}`
          });
        }
      );
    } else
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Incorrect Password"
      });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};


// admin user view all user in the db
const adminViewAll = async (req, res, next) => {
  try {
    const allUser = await user.findAll({
      attributes: [
        "id",
        "firstname",
        "lastname",
        "email",
        "dob",
        "phone_number",
        "address",
        "img_url",
        "employed_as",
        "branch",
        "monthly_savings",
        "account_number",
        "bank_name",
        "status"
      ],
      where: { role: "user" }
    });

    return res.status(200).json({
      status: 200,
      count: allUser.length,
      data: allUser
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const adminViewOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const foundUser = await user.findOne({
      attributes: [
        "id",
        "firstname",
        "lastname",
        "email",
        "dob",
        "phone_number",
        "address",
        "img_url",
        "employed_as",
        "branch",
        "monthly_savings",
        "account_number",
        "bank_name",
        "status"
      ],
      where: { id, role: "user" }
    });

    return res.status(200).json({
      status: 200,
      data: foundUser
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const adminViewBranch = async (req, res, next) => {
  const { branch } = req.body;
  if (isEmpty(branch)) {
    return res
      .status(400)
      .json({ status: 400, error: "Please select a branch" });
  }
  try {
    const allUser = await user.findAll({
      attributes: [
        "id",
        "firstname",
        "lastname",
        "email",
        "dob",
        "phone_number",
        "address",
        "img_url",
        "employed_as",
        "branch",
        "monthly_savings",
        "account_number",
        "bank_name",
        "status"
      ],
      where: { role: "user", branch }
    });

    return res.status(200).json({
      status: 200,
      count: allUser.length,
      data: allUser
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const userProfile = async (req, res, next) => {

  if(req.params.id === undefined){
    return res.status(403).json({
      status: 403,
      error: "You cannot view this resource"
    });
  }
  const userId = req.user.id;


  const { id } = req.params;
  try {
    if (userId != id) {
      return res.status(403).json({
        status: 403,
        error: "You cannot view this resource"
      });
    }

    const profile = await user.findOne({
      attributes: [
        "id",
        "firstname",
        "lastname",
        "email",
        "dob",
        "phone_number",
        "address",
        "img_url",
        "employed_as",
        "monthly_savings",
        "account_number",
        "bank_name"
      ],
      where: { id: userId }
    });

    return res.status(200).json({
      status: 200,
      user: profile
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};

const userUpdateProfile = async (req, res, next) => {
  let image = req.file;
  const userId = req.user.id;
  const { id } = req.params;

  let {
    firstname: first_name,
    lastname: last_name,
    dob: d_o_b,
    phone_number: phoneNumber,
    address: homeAddress,
    branch: campus,
    employed_as: employedAs,
    monthly_savings: savings,
    account_number: accountNumber,
    bank_name: bankName
  } = req.body;

  if (userId != id) {
    return res.status(403).json({
      status: 403,
      error: "You cannot view this resource"
    });
  }
  if (image !== undefined && allowedTypes.indexOf(image.mimetype) === -1) {
    return res.status(400).json({
      status: 400,
      message: "Ensure your image is of type png or jpg"
    });
  }
  if (
    (!isEmpty(first_name) && !isNameValid(first_name)) ||
    (!isEmpty(last_name) && !isNameValid(last_name))
  ) {
    return res.status(400).json({
      error: "Make sure all names are in alphabets",
      status: 400
    });
  }
  if (!isEmpty(phoneNumber) && !isPhoneNumberValid(phoneNumber)) {
    return res.status(400).json({
      error: "Make sure phone number is 11 digit number",
      status: 400
    });
  }
  if (!isNumberValid(savings)) {
    return res.status(400).json({
      error: "Make sure monthly savings is digits only",
      status: 400
    });
  }

  try {
    const findUser = await user.findByPk(id);
    let {
      lastname,
      firstname,
      dob,
      phone_number,
      address,
      employed_as,
      monthly_savings,
      account_number,
      bank_name,
      img_url,
      branch
    } = findUser.dataValues;

    firstname = first_name ? first_name : firstname;
    lastname = last_name ? last_name : lastname;
    dob = d_o_b ? d_o_b : dob;
    phone_number = phoneNumber ? phoneNumber : phone_number;
    address = homeAddress ? homeAddress : address;
    image = image ? image.path : img_url;
    employed_as = employedAs ? employedAs : employed_as;
    branch = campus ? campus : branch;
    monthly_savings = savings ? savings : monthly_savings;
    account_number = accountNumber ? accountNumber : account_number;
    bank_name = bankName ? bankName : bank_name;

    const saveChanges = await findUser.update({
      firstname,
      lastname,
      dob,
      phone_number,
      address,
      img_url: image,
      employed_as,
      branch,
      monthly_savings,
      account_number,
      bank_name
    });

    if (saveChanges) {
      return res.status(201).json({
        status: 201,
        message: "You have successfully updated your profile"
      });
    }
    return res.status(500).json({
      status: 500,
      message: "Something went wrong try again later"
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};
export {
  addUser,
  userLogin,
  adminViewAll,
  adminViewOne,
  adminViewBranch,
  userProfile,
  userUpdateProfile
};
