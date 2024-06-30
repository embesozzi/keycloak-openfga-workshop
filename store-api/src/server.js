const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 7091;
    
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const routes = require('./routes/index.route');
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});