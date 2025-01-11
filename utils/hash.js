const bcrypt = require("bcryptjs")

const verifyPassword = async(password, hashedPassword) =>{
    return await bcrypt.compare(password, hashedPassword);
}

module.exports = { verifyPassword };
