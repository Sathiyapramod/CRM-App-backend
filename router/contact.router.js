import express from "express";
import {auth} from '../middleware/auth.js';
const router = express.Router();

//DELETE a new Contact by id
router.delete("/contact/:id", async (request, response) => {
    const usertype = request.header("usertype");
    const Role = {
      manager: "manager",
      employee: "employee",
      admin: "admin",
    };
    if(usertype == Role.admin){
      const { id } = request.params;
    const data = await client
      .db("crm")
      .collection("contact")
      .deleteOne({ _id: new ObjectId(id) });
    data.deletedCount == 1
      ? response.send({ message: "Contact Deleted Successfully !!" })
      : response.status(404).send({ message: "Faild to Delete Contact " });
    }
    else response.status(401).send({ message: "Unauthorized Access" });
  });

//UPDATE a new Contact by id
  router.put("/contact/:id", async (request, response) => {
    const usertype = request.header("usertype");
    const Role = {
      manager: "manager",
      employee: "employee",
      admin: "admin",
    };
    if (usertype != Role.admin || usertype != Role.employee) {
      const contactDetails = request.body;
      const { id } = request.params;
      const data = await client
        .db("crm")
        .collection("contact")
        .updateOne({ _id: new ObjectId(id) }, { $set: contactDetails });
      data.modifiedCount == 1
        ? response.send({ message: "Updated Contact Request Successfully " })
        : response.status(404).send({ message: "Failed to Update Contact" });
    } else response.status(401).send({ message: "Unauthorized Access" });
  });

  //READ all Contacts
  router.get("/contact", async (request, response) => {
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
        .collection("contact")
        .find({})
        .toArray();
      data
        ? response.send(data)
        : response
            .status(404)
            .send({ message: "Failed to get Service requests" });
    } else response.status(401).send({ message: "Unauthorized Access" });
  });
  router.get("/contact/:id", async (request, response) => {
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
      const { id } = request.params;
      const data = await client
        .db("crm")
        .collection("contact")
        .findOne({ _id: new ObjectId(id) });
      data
        ? response.send(data)
        : response
            .status(404)
            .send({ message: "Failed to get Service requests" });
    } else response.status(401).send({ message: "Unauthorized Access" });
  });

//CREATE a new Contact
  router.post("/contact", async (request, response) => {
    const usertype = request.header("usertype");
    const Role = {
      manager: "manager",
      employee: "employee",
      admin: "admin",
    };
    if (usertype == Role.admin || usertype == Role.manager) {
      const newContact = request.body;
      const data = await client
        .db("crm")
        .collection("contact")
        .insertMany(newContact);
      data
        ? response.send({ message: "Created Contact Request Successfully !" })
        : response
            .status(404)
            .send({ message: "Failed to create Contact Request" });
    } else response.status(401).send({ message: "Unauthorized Access" });
  });
  


  export default router;