const mongoose = require("mongoose");
const passwordResteTokenSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 21700
  }
});

module.exports = mongoose.model("passwordresettoken", passwordResteTokenSchema);
