import express from "express";
const router = express.Router();

//adding Lead CRUD applications

//to create a new lead
router.post("/lead", async (request, response) => {
  const newLead = request.body;
  const data = await client.db("crm").collection("leads").insertMany(newLead);
  data
    ? response.send({ message: "New Lead created !!!" })
    : response.status(404).send({ message: "Failed to create Lead " });
});

//to get all leads
router.get("/lead", async (request, response) => {
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
    const data = await client.db("crm").collection("leads").find({}).toArray();
    data
      ? response.send(data)
      : response.status(404).send({ message: "Failed to get Leads !" });
  } else response.status(401).send({ message: "Unauthorized Access " });
});

router.get("/lead/:id", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: manager,
    employee: employee,
    admin: admin,
  };
  if (
    usertype == Role.admin ||
    usertype == Role.manager ||
    usertype == Role.employee
  ) {
    const { id } = request.params;
    const data = await client
      .db("crm")
      .collection("leads")
      .findOne({ _id: new ObjectId(id) });
    data
      ? response.send(data)
      : response.status(404).send({ message: "Failed to get Lead !" });
  } else response.status(401).send({ message: "Unauthorized Access " });
});

//to Update lead by id

router.put("/lead/:id", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: "manager",
    employee: "employee",
    admin: "admin",
  };
  if (usertype == Role.manager) {
    const updatedLead = request.body;
    const { id } = request.params;

    const data = await client
      .db("crm")
      .collection("leads")
      .updateMany({ _id: new ObjectId(id) }, { $set: updatedLead });
    data.modifiedCount == 1
      ? response.send({ message: "Updated Lead Successfully" })
      : response.status(404).send({ message: "Failed to Update Lead !!" });
  } else response.status(401).send({ message: "Unauthorized Access" });
});

//to delete a particular lead
router.delete("/lead/:id", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: "manager",
    employee: "employee",
    admin: "admin",
  };

  if (usertype !== Role.employee || usertype !== Role.manager) {
    const { id } = request.params;
    const data = await client
      .db("crm")
      .collection("leads")
      .deleteOne({ _id: new ObjectId(id) });
    data.deletedCount == 1
      ? response.send({ message: "Deleted Lead Successfully " })
      : response.status(404).send({ message: "Failed to Delete Lead" });
  } else response.status(401).send({ message: "Unauthorized Access" });
});

export default router;
