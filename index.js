const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const schema = require("./Schemas");
const isAuth = require("./middleware/auth");

const app = express();
const PORT = 8000;

mongoose.connect("mongodb://localhost/graphql")
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.error("Couldn't connect to MongoDB..."));

app.use(isAuth);
app.use("/graphql", graphqlHTTP({
    schema,
    graphiql: true
}))

app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});