const {Schema, model} = require('mongoose')

const contactSchema = new Schema({
  username: {type: String, required: true},
  email: {type: String, required: true},
  message: {type: String, required: true},
  createdAt: {type: Date, default: Date.now},
})

const contact = model("Contact", contactSchema);
module.exports = contact;