const bcrypt = require('bcryptjs');
async function hashMyPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);
    return hashedPassword;
}
hashMyPassword('lelang18'); // Ganti 'password_admin_anda' dengan password yang Anda inginkan