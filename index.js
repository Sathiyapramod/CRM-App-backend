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

dotenv.config();

const options = {
  min: 1000,
  max: 9999,
  integer: true,
};

const app = express();
app.use(express.json());
app.use(cors());
app.use("/contact", contactRouter);
app.use("/lead", leadRouter);

const PORT = 4000;

const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL); //dialing operation
await client.connect(); //calling operation

async function generateHashedPasswords(password) {
  const no_of_rounds = 10;
  const salt = await bcrypt.genSalt(no_of_rounds); //Salting process
  const hashedpassword = await bcrypt.hash(password, salt); //Hashing process
  return hashedpassword;
}

//Sample Welcome Page
app.get("/", (request, response) => {
  console.log("Hello World");
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
  console.log(userfromDB);
  if (!userfromDB) response.send({ message: "user not found" });
  else {
    const storedpassword = userfromDB.password;
    console.log(storedpassword);
    const isPasswordvalid = await bcrypt.compare(password, storedpassword);
    console.log(isPasswordvalid);
    if (!isPasswordvalid) {
      response.status(404).send({ message: "Invalid Password" });
    }
    const token = jwt.sign({ id: userfromDB._id }, process.env.SECRET);
    response.send({ message: "Success", token, usertype: userfromDB.usertype });
  }
});

//For admin viewing the Userlists of CRM app
app.get("/members", auth, async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: manager,
    employee: employee,
    admin: admin,
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
//to Get Userlists
app.get("/userlist", auth, async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: manager,
    employee: employee,
    admin: admin,
  };
  if (usertype == Role.admin) {
    const data = await client
      .db("crm")
      .collection("signupusers")
      .find({})
      .toArray();
    data
      ? response.send(data)
      : response.status(404).send({ message: "Failed to load users lists !!" });
  } else response.status(401).send({ message: "Unauthorized Access" });
});

app.get("/userlist/:id", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: manager,
    employee: employee,
    admin: admin,
  };
  if (
    usertype == Role.admin ||
    usertype == Role.employee ||
    usertype == Role.manager
  ) {
    const { id } = request.params;
    console.log(id);
    const data = await client
      .db("crm")
      .collection("signupusers")
      .findOne({ _id: new ObjectId(id) });
    data
      ? response.send(data)
      : response.status(404).send({ message: "Failed to Load user " });
  } else response.status(401).send({ message: "Unauthorized Access" });
});
//to edit particular user
app.put("/edituser/:id", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: manager,
    employee: employee,
    admin: admin,
  };

  if (usertype == Role.admin || usertype == Role.manager) {
    const updatedUser = request.body;
    console.log(updatedUser);
    const { id } = request.params;
    console.log(id);
    const updatedList = await client
      .db("crm")
      .collection("signupusers")
      .updateMany({ _id: new ObjectId(id) }, { $set: updatedUser });
    updatedList.modifiedCount == 1
      ? response.send({ message: "Updated User successfully " })
      : response.status(404).send({ message: "Failed to update user !! " });
  } else response.status(401).send({ message: "Unauthorized Access" });
});

//to delete a particular user
app.delete("/deleteuser/:id", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: manager,
    employee: employee,
    admin: admin,
  };

  if (usertype == Role.admin) {
    const { id } = request.params;
    const data = await client
      .db("crm")
      .collection("signupusers")
      .deleteOne({ _id: new ObjectId(id) });
    data
      ? response.send({ message: "User deleted Successfully " })
      : response.status(404).send({ message: "Failed to Delete the user !" });
  } else {
    response.status(401).send({ message: "Unauthorized Access !!" });
  }
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
      user: "",
      pass: "",
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

//Service Requests CRUD applications

//Create service request

app.post("/service", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: "manager",
    employee: "employee",
    admin: "admin",
  };

  if (usertype == Role.manager) {
    const newService = request.body;
    const data = await client
      .db("crm")
      .collection("services")
      .insertMany(newService);
    data
      ? response.send({ message: "Created Service Request Successfully !" })
      : response
          .status(404)
          .send({ message: "Failed to create Service Request" });
  } else response.status(401).send({ message: "Unauthorized Access" });
});

//GET all Service Requests
app.get("/service", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: "manager",
    employee: "employee",
    admin: "admin",
  };
  if (
    usertype == Role.admin ||
    usertype == Role.manager ||
    usertype == Role.employee
  ) {
    const data = await client
      .db("crm")
      .collection("services")
      .find({})
      .toArray();
    data
      ? response.send(data)
      : response
          .status(404)
          .send({ message: "Failed to get Service requests" });
  } else response.status(401).send({ message: "Unauthorized Access" });
});

app.get("/service/:id", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: "manager",
    employee: "employee",
    admin: "admin",
  };
  if (
    usertype == Role.employee ||
    usertype == Role.manager ||
    usertype == Role.admin
  ) {
    const { id } = request.params;
    const data = await client
      .db("crm")
      .collection("services")
      .findOne({ _id: new ObjectId(id) });
    data
      ? response.send(data)
      : response
          .status(404)
          .send({ message: "Failed to get Service requests" });
  } else response.status(401).send({ message: "Unauthorized Access" });
});

//UPDATE a Service Requests
app.put("/service/:id", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: "manager",
    employee: "employee",
    admin: "admin",
  };

  if (usertype != Role.employee || usertype != Role.admin) {
    const { id } = request.params;
    const updatedService = request.body;
    const servicefromDB = await client
      .db("crm")
      .collection("services")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedService });
    servicefromDB.modifiedCount == 1
      ? response.send({ message: "Updated Service Request Successfully " })
      : response.status(404).send({ message: "Failed to Update Request" });
  } else response.status(401).send({ message: "Unauthorized Access" });
});

//DELETE a particular Service Request by id

app.delete("/service/:id", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: "manager",
    employee: "employee",
    admin: "admin",
  };
  if (usertype != Role.employee || usertype != Role.admin) {
    const { id } = request.params;
    const data = await client
      .db("crm")
      .collection("services")
      .deleteOne({ _id: new ObjectId(id) });
    data.deletedCount == 1
      ? response.send({ message: "Deleted Successfully !!" })
      : response
          .status(404)
          .send({ message: "Faild to Delete Service Request" });
  } else response.status(401).send({ message: "Unauthorized Access" });
});

app.listen(PORT, () =>
  console.log(`The Server is running on the port : ${PORT} !!!!`)
);

//end of code
