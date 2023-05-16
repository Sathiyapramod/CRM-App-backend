import express from "express";
import { client } from "../index.js";
import { ObjectId } from "mongodb";

const workflow = express.Router();

//get All workflows

workflow.get("/get/", async (req, res) => {
  const getWorkflowdata = await client
    .db("crm")
    .collection("workflow")
    .find({})
    .toArray();
  getWorkflowdata
    ? res.send(getWorkflowdata)
    : res.status(401).send({ message: "Failed to load workflow data" });
});

//get workflow by ID

workflow.get("/get/:id", async (req, res) => {
  const { id } = req.params;
  const checkUserinDB = await client
    .db("crm")
    .collection("workflow")
    .findOne({ _id: new ObjectId(id) });
  if (!checkUserinDB) res.status(401).send({ message: "Invalid user ID" });
  else {
    const getWorkflowdata = await client
      .db("crm")
      .collection("workflow")
      .findOne({ _id: new ObjectId(id) });
    getWorkflowdata
      ? res.send(getWorkflowdata)
      : res.status(401).send({ message: "failed to load the Workflow" });
  }
});

//workflow creation

workflow.post("/", async (req, res) => {
  //input provided as employee Name
  //Only Admin can initiate workflow for all Staffs/manager

  const { empName } = req.body;

  const checkUserinDB = await client
    .db("crm")
    .collection("signupusers")
    .findOne({ username: empName });
  if (!checkUserinDB)
    res.status(401).send({ message: "Invalid user. Check again" });
  else {
    const userRole = checkUserinDB.usertype;
    if (userRole == "employee") {
      const newWorkflow = await client
        .db("crm")
        .collection("workflow")
        .insertOne({
          empName,
          userRole,
          cadreID: 1,
          workflow: { message: "Creation Access Enabled for the User" },
        });
      newWorkflow
        ? res.send({ message: "Creation Access Enabled for User" })
        : res.status(401).send({ message: "Please check again " });
    } else if (userRole == "manager" || userRole == "admin") {
      const newWorkflow = await client
        .db("crm")
        .collection("workflow")
        .insertOne({
          empName,
          userRole,
          cadreID: 1,
          workflow: new Array(),
        });
      newWorkflow
        ? res.send({ message: "Authorization Access Enabled for User" })
        : res.status(401).send({ message: "please check again" });
    }
  }
});

//updation in a particular workflow

//addition in receivers' workflow

workflow.put("/addition/:id", async (req, res) => {
  const { id } = req.params; //Concerned Username will be used to send approval
  console.log(id);

  const { isCreated, isReleased, isCompleted, isOpen, name, description } =
    req.body;

  const checkUserinDB = await client
    .db("crm")
    .collection("workflow")
    .findOne({ _id: new ObjectId(id) });

  if (!checkUserinDB) res.status(401).send({ message: "Invalid User ID" });
  else {
    if (isCreated != 1 || isReleased != 1 || isCompleted != 1 || isOpen != 1) {
      const updatedWorkflow = await client
        .db("crm")
        .collection("signupusers")
        .updateOne(
          { _id: new ObjectId(id) },
          {
            $push: { workflow: req.body },
          }
        );
      const ServiceRequestUpdation = await client
        .db("crm")
        .collection("services")
        .updateOne(
          { description },
          {
            $set: {
              isCreated,
              isReleased,
              isCompleted,
              isOpen,
              name,
              description,
            },
          }
        );
      updatedWorkflow
        ? res.send({ message: "Service Request sent for updation" })
        : res.status(401).send({ message: "Please try again" });
    } else res.status(401).send({ message: "Invalid workflow Action !!" });
  }
});

//deletion in senders' workflow
workflow.put("/deletion/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const checkUserinDB = await client
    .db("crm")
    .collection("workflow")
    .findOne({ _id: new ObjectId(id) });
  if (!checkUserinDB) res.status(401).send({ message: "Invalid user ID" });
  else {
    const updateWorkflow = await client
      .db("crm")
      .collection("workflow")
      .updateOne(
        { _id: new ObjectId(id) },
        {
          $pull: {
            workflow: { name, description },
          },
        }
      );
    updateWorkflow
      ? res.send({ message: "Updated in Senders' workflow" })
      : res
          .status(401)
          .send({ message: "Failed to update in Senders' workflow" });
  }
});

export default workflow;
