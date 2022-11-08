import mongoose from "mongoose";

async function main() {
  mongoose.connect("mongodb://127.0.0.1:27017/wetube");
  const db = mongoose.connection;
  db.on("error", (error) => {
    console.log("DB err", error);
  });
  db.once("open", () => {
    console.log("Connected to DB");
  });
}

main().catch((err) => console.log(err));
