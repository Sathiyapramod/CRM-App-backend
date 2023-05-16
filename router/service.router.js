import express from "express";
import { client } from "../index.js";

const service = express.Router();

//Service Requests CRUD applications

//Create service request

service.post("/", async (req, res) => {
  const {
    isCreated,
    isReleased,
    isCompleted,
    isOpen,
    name,
    description,
    date,
  } = req.body;
  console.log(req.body);

  const insertNewService = await client
    .db("crm")
    .collection("services")
    .insertOne({
      isCreated,
      isReleased,
      isOpen,
      isCompleted,
      name,
      description,
      date: new Date(date),
    });
  insertNewService
    ? res.send({ message: "New Service created" })
    : res.status(401).send({ message: "Failed to create Service" });
});

//GET all Service Requests

service.get("/", async (request, response) => {
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

service.get("/:id", async (request, response) => {
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
service.put("/:id", async (request, response) => {
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

service.delete("/:id", async (request, response) => {
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

export default service;
