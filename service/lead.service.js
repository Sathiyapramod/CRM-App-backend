import { client } from "../index.js";
import { ObjectId } from "mongodb";

export async function deleteLeadbyId(id) {
  return await client
    .db("crm")
    .collection("leads")
    .deleteOne({ _id: new ObjectId(id) });
}
export async function updateLeadbyId(id, updatedLead) {
  return await client
    .db("crm")
    .collection("leads")
    .updateMany({ _id: new ObjectId(id) }, { $set: updatedLead });
}
export async function getLeadbyId(id) {
  return await client
    .db("crm")
    .collection("leads")
    .findOne({ _id: new ObjectId(id) });
}
export async function getLeads() {
  return await client.db("crm").collection("leads").find({}).toArray();
}
export async function createNewLead(newLead) {
  return await client.db("crm").collection("leads").insertMany(newLead);
}
