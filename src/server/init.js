import "dotenv/config";
import "./db.js";
import "./models/videoModel.js";
import "./models/User.js";
import "./models/Comment.js";

import server from "./server.js";

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`listening localhost:${PORT}`);
});
