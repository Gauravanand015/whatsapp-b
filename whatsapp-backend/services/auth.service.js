import createHttpError from "http-errors";
import validator from "validator";
import { UserModel } from "../model/index.js";
import bcrypt from "bcrypt";

export const createUser = async (userData) => {
  const { name, email, password, picture, status } = userData;
  // console.log("picture", picture);
  // check if fields are empty
  if (!name || !email || !password) {
    throw createHttpError.BadRequest("Please fill all fields");
  }
  //check the name length
  if (
    !validator.isLength(name, {
      min: 3,
      max: 64,
    })
  ) {
    throw createHttpError.BadRequest(
      "Please make sure the length of the name is between 6 and 128"
    );
  }
  // status field
  if (status && status.length > 64) {
    throw createHttpError.BadRequest("The status is too long");
  }
  // check if the email is valid or not
  if (!validator.isEmail(email)) {
    throw createHttpError.BadRequest("Please enter a valid email address");
  }

  // check if the user is already exists
  const userEmail = await UserModel.findOne({ email: email });
  // console.log(userEmail);
  if (userEmail) {
    throw createHttpError.Conflict(
      "This email address already exists, try using different email"
    );
  }

  if (
    !validator.isLength(password, {
      min: 6,
      max: 128,
    })
  ) {
    throw createHttpError.BadRequest(
      "Password is too short, password is between 6 and 128 characters"
    );
  }

  const user = await new UserModel({
    name,
    email,
    password,
    picture: picture || process.env.DEFAULT_PICTURE_URL,
    status: status || process.env.DEFAULT_STATUS,
  }).save();

  return user;
};

export const signUser = async (email, password) => {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();

  //check if user exist
  if (!user) throw createHttpError.NotFound("User not found.");

  //compare passwords
  let passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches)
    throw createHttpError.NotFound("Password or email address is wrong.");

  return user;
};
