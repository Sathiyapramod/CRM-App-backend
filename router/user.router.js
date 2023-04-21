import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getUsers,
  getUserbyId,
  updateUserbyId,
  deleteUserbyId,
} from "../service/user.service.js";
const router = express.Router();

//READ Userlists

router.get("/", auth, async (request, response) => {
  const data = await getUsers();
  data
    ? response.send(data)
    : response.status(404).send({ message: "Failed to load users lists !!" });
});

router.get("/userlist/:id", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: "manager",
    employee: "employee",
    admin: "admin",
  };
  if (
    usertype == Role.admin ||
    usertype == Role.employee ||
    usertype == Role.manager
  ) {
    const { id } = request.params;
    console.log(id);
    const data = await getUserbyId(id);
    data
      ? response.send(data)
      : response.status(404).send({ message: "Failed to Load user " });
  } else response.status(401).send({ message: "Unauthorized Access" });
});

//to edit particular user

router.put("/edituser/:id", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: "manager",
    employee: "employee",
    admin: "admin",
  };

  if (usertype == Role.admin || usertype == Role.manager) {
    const updatedUser = request.body;
    console.log(updatedUser);
    const { id } = request.params;
    console.log(id);
    const updatedList = await updateUserbyId(id, updatedUser);
    updatedList.modifiedCount == 1
      ? response.send({ message: "Updated User successfully " })
      : response.status(404).send({ message: "Failed to update user !! " });
  } else response.status(401).send({ message: "Unauthorized Access" });
});

//to delete a particular user
router.delete("/deleteuser/:id", async (request, response) => {
  const usertype = request.header("usertype");
  const Role = {
    manager: "manager",
    employee: "employee",
    admin: "admin",
  };

  if (usertype == Role.admin) {
    const { id } = request.params;
    const data = await deleteUserbyId(id);
    data
      ? response.send({ message: "User deleted Successfully " })
      : response.status(404).send({ message: "Failed to Delete the user !" });
  } else {
    response.status(401).send({ message: "Unauthorized Access !!" });
  }
});

export default router;
