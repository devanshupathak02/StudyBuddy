const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

const usersFilePath = path.join(process.cwd(), 'data', 'users.json')

async function updatePasswords() {
  try {
    // Read existing users
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'))
    const { users } = usersData

    // Update each user's password
    for (let user of users) {
      if (!user.password.startsWith('$2')) { // Check if password is not already hashed
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
      }
    }

    // Write updated users back to file
    fs.writeFileSync(usersFilePath, JSON.stringify({ users }, null, 2))
    console.log('Successfully updated all passwords to use bcrypt hashing')
  } catch (error) {
    console.error('Error updating passwords:', error)
  }
}

updatePasswords() 