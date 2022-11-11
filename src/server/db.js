import mongoose from "mongoose";

async function main() {
  mongoose.connect(process.env.DB_URL);
  const db = mongoose.connection;
  db.on("error", (error) => {
    console.log("DB err", error);
  });
  db.once("open", () => {
    console.log("Connected to DB");
  });
}

main().catch((err) => console.log(err));
