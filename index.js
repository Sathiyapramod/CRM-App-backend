//start of code
import { auth } from "./middleware/auth.js";
import nodemailer from "nodemailer";
import rn from "random-number";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import contactRouter from "./router/contact.router.js";
import leadRouter from "./router/lead.router.js";
import userRouter from "./router/user.router.js";
import service from "./router/service.router.js";
import workflow from "./router/workflow.router.js";

dotenv.config();

const options = {
  min: 1000,
  max: 9999,
  integer: true,
};

const app = express();
app.use(cors());
app.use(express.json());
app.use("/contact", contactRouter);
app.use("/lead", leadRouter);
app.use("/user", userRouter);
app.use("/service", service);
app.use("/workflow", workflow);

const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;
export const client = new MongoClient(MONGO_URL); //dialing operation
await client.connect(); //calling operation

async function generateHashedPasswords(password) {
  const no_of_rounds = 10;
  const salt = await bcrypt.genSalt(no_of_rounds); //Salting process
  const hashedpassword = await bcrypt.hash(password, salt); //Hashing process
  return hashedpassword;
}

//Sample Welcome Page
app.get("/", (request, response) => {
  response.send({ Message: "Welcome to CRM app" });
});

//for signup
app.post("/signup", async (request, response) => {
  const { username, password, firstname, lastname, usertype, email } =
    request.body;
  const hashedpassword = await generateHashedPasswords(password);
  const userfromDB = await client
    .db("crm")
    .collection("signupusers")
    .insertOne({
      username: username,
      password: hashedpassword,
      firstname: firstname,
      lastname: lastname,
      email: email,
      usertype: usertype,
    });
  userfromDB
    ? response.send({ message: "Signup Successful" })
    : response.send({ message: "Failed to sign up" });
});

//for login
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const userfromDB = await client
    .db("crm")
    .collection("signupusers")
    .findOne({ username: username });

  if (!userfromDB) response.send({ message: "user not found" });
  else {
    const storedpassword = userfromDB.password;

    const isPasswordvalid = await bcrypt.compare(password, storedpassword);

    if (!isPasswordvalid) {
      response.status(404).send({ message: "Invalid Password" });
    }
    const token = jwt.sign({ id: userfromDB._id }, process.env.SECRET);
    response.send({
      message: "Success",
      token,
      usertype: userfromDB.usertype,
      firstname: userfromDB.firstname,
      lastname: userfromDB.lastname,
    });
  }
});

//For admin viewing the Userlists of CRM app
app.get("/members", auth, async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: "manager",
    employee: "employee",
    admin: "admin",
  };
  if (usertype == Role.admin) {
    const data = await client
      .db("crm")
      .collection("signupusers")
      .find({})
      .toArray();
    data
      ? response.send(data)
      : response
          .status(404)
          .send({ message: "Failed to Load CRM members !! " });
  } else response.status(401).send({ message: "Unauthorized Access" });
});

//Forgot password

//Conditions-1

//The user must click on the Forgot password link which should direct to forgot password page
//step2 : validate the email address and then allow user to click forgot password
//step3 : Once the system validates email address, system will send autogenerated token encoded URL for setting the new password and token is stored in Database for temporary use
//step4 : User should click the URL on his email
//step5 : Once the password is created, the randomly generated token URL should be nullified and password should be updated in the database.
//step6 : confirmation response to use

//forgot password
app.post("/mail", async (request, response) => {
  const mail = request.body;
  console.log(mail);
  const datafromDB = await client
    .db("crm")
    .collection("signupusers")
    .findOne({ email: mail.email });
  console.log(datafromDB);
  let randomNumber = rn(options);
  const data = await client
    .db("crm")
    .collection("signupusers")
    .updateOne({ email: mail.email }, { $set: { otp: randomNumber } });
  console.log(data);
  let sender = nodemailer.createTransport({
    server: "gmail.com",
    host: "smtp.gmail.com",
    auth: {
      user: "sathiyapramod22@gmail.com",
      pass: process.env.password,
    },
  });
  let composemail = {
    from: "",
    to: `${mail.email}`,
    subject: "send mail using node js",
    text: `${randomNumber}`,
  };
  sender.sendMail(composemail, function (error, info) {
    if (error) {
      console.log(error);
      response.json({
        message: "Error",
      });
    } else {
      console.log("Email sent: " + info.response);
      response.json({
        message: "Email sent",
      });
    }
  });
});
//verification
app.post("/verification/:id", async (request, response) => {
  const passcode = request.body;
  const { id } = request.params;
  const data = await client
    .db("crm")
    .collection("signupusers")
    .find({ _id: new ObjectId(id) });
  if (data.otp == passcode) response.send(data);
  else res.status(404).json({ message: "Invalid Verification Code" });
});

//updatepassword
app.post("updatepassword/:id", async (request, response) => {
  const { id } = request.params;
  const password = request.body;
  const data = await client
    .db("crm")
    .collection("signupusers")
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { password: password } }
    );
  await client
    .db("crm")
    .collection("signupusers")
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $unset: { otp: 1 } },
      false,
      true
    );
  data
    ? response.send({ message: "Password updated successfully !!" })
    : response.status(404).send({ message: "Failed to Update !!!" });
});

//Add user - access enabled for Manager/admin
app.post("/adduser", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: manager,
    employee: employee,
    admin: admin,
  };
  if (usertype == Role.admin || usertype == Role.manager) {
    const newUser = request.body;
    console.log(newUser);
    const insertUser = await client
      .db("crm")
      .collection("signupusers")
      .insertMany(newUser);
    insertUser
      ? response.send({ message: "User added Successfully" })
      : response.send({ message: "Failed to add user !!" });
  } else response.status(401).send({ message: "Unauthorized Access " });
});

app.listen(PORT, () =>
  console.log(`The Server is running on the port : ${PORT} !!!!`)
);

//end of code
