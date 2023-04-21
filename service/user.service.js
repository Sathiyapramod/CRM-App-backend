import { client } from "../index.js";
import { ObjectId } from "mongodb";

export async function deleteUserbyId(id) {
  return await client
    .db("crm")
    .collection("signupusers")
    .deleteOne({ _id: new ObjectId(id) });
}
export async function updateUserbyId(id, updatedUser) {
  return await client
    .db("crm")
    .collection("signupusers")
    .updateMany({ _id: new ObjectId(id) }, { $set: updatedUser });
}
export async function getUserbyId(id) {
  return await client
    .db("crm")
    .collection("signupusers")
    .findOne({ _id: new ObjectId(id) });
}
export async function getUsers() {
  return await client.db("crm").collection("signupusers").find({}).toArray();
}
