import express from "express";
import {
  createNewLead,
  getLeads,
  getLeadbyId,
  updateLeadbyId,
  deleteLeadbyId,
} from "../service/lead.service.js";
const router = express.Router();

//adding Lead CRUD applications

//to create a new lead
router.post("/lead", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: "manager",
    employee: "employee",
    admin: "admin",
  };

  if (usertype != Role.employee) {
    const { leadname, company, email, phone, leadsource } = request.body;

    const data = await createNewLead(
      leadname,
      company,
      email,
      phone,
      leadsource
    );

    data
      ? response.send({ message: "New Lead created !!!" })
      : response.status(404).send({ message: "Failed to create Lead " });
  } else response.status(401).send({ message: "Unauthorized Access !!!" });
});

//READ all leads
router.get("/", async (request, response) => {
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
    const data = await getLeads();
    data
      ? response.send(data)
      : response.status(404).send({ message: "Failed to get Leads !" });
  } else response.status(401).send({ message: "Unauthorized Access " });
});

//READ Lead by id
router.get("/:id", async (request, response) => {
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
    const data = await getLeadbyId(id);
    data
      ? response.send(data)
      : response.status(404).send({ message: "Failed to get Lead !" });
  } else response.status(401).send({ message: "Unauthorized Access " });
});

//UPDATE lead by id

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

    const data = await updateLeadbyId(id, updatedLead);
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
    const data = await deleteLeadbyId(id);
    data.deletedCount == 1
      ? response.send({ message: "Deleted Lead Successfully " })
      : response.status(404).send({ message: "Failed to Delete Lead" });
  } else response.status(401).send({ message: "Unauthorized Access" });
});

export default router;
