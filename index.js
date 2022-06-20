const express = require("express")
const app = express()

app.get("/", function(req, res){
    resp.send("IT WORKS")
})

app.listen(process.env.PORT || 5000)

module.exports = app