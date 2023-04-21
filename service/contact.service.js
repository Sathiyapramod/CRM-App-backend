import { client } from "../index.js";
import { ObjectId } from "mongodb";

export async function createContact(newContact) {
  return await client.db("crm").collection("contact").insertMany(newContact);
}
export async function getContactbyId(id) {
  return await client
    .db("crm")
    .collection("contact")
    .findOne({ _id: new ObjectId(id) });
}
export async function getContact() {
  return await client.db("crm").collection("contact").find({}).toArray();
}
export async function updateContactbyId(id, contactDetails) {
  return await client
    .db("crm")
    .collection("contact")
    .updateOne({ _id: new ObjectId(id) }, { $set: contactDetails });
}
export async function deleteContactbyId(id) {
  return await client
    .db("crm")
    .collection("contact")
    .deleteOne({ _id: new ObjectId(id) });
}
