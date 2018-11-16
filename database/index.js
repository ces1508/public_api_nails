const r = require('rethinkdbdash')
require('dotenv').config()

const databaseSetup = {
  host: process.env.DB_URL,
  port: process.env.DB_PORT,
  // user: process.env.DB_USER_FULL,
  // password: process.env.DB_PASSWORD_FULL,
  db: process.env.DB_NAME
}

console.log(databaseSetup)
class Datasource {
  constructor () {
    /** @private connection with full permission to databse */
    this.fullUser = r(databaseSetup)
    /** @private connection with only permission to read */
    this.userRead = r({
      ...databaseSetup
      // user: process.env.DB_USER_READ,
      // password: process.env.DB_PASSWORD_READ
    })
  }
  /**
   * you need send a data previews validate
   * method only validate if email already in use
   * error send a objet with a code [UNKNOW_ERROR, USER_ALREADY_EXITS, DATABASE_ERROR]
   * method success return a object with data of the user
   * */
  async registerUser (data) {
    try {
      let alreadyExits = await this.alreadyExits(data.email)
      if (!alreadyExits) {
        let newUser = await this.fullUser.table('clients').insert(data)
        if (newUser.inserted === 1) {
          return this.getUserProfile(newUser.generated_keys[0])
        } else {
          return { error: { code: 'UNKNOW_ERROR', action: 'CREATE USER', message: 'cant create user' } }
        }
      }
      return { error: { code: 'USER_ALREADY_EXITS', message: 'user already exits' } }
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'CREATE USER', message: e.message } }
    }
  }
  async getUserProfile (email) {
    try {
      let user = await this.userRead.table('clients').getAll(email, { index: 'email' }).without(['salt', 'password'])
      if (!user) return { error: { code: 'ERROR_NOT_FOUND', message: 'we sorry, we cant find the resource' } }
      return user[0]
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'get user profile', message: e.message } }
    }
  }
  async updateProfile (id, data) {
    try {
      let profile = await this.fullUser.table('clients').get(id).update(data)
      return profile
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'UPADATE_USER_PROFILE', message: e.message } }
    }
  }
  async alreadyExits (email) {
    try {
      let user = await this.userRead.table('clients').getAll(email, { index: 'email' })
      return user.length > 0
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'validate exits user', message: e.message } }
    }
  }
  /** this method return email, encode password, and salt or return null */
  async sendCrendentialsToLogin (email) {
    try {
      let user = await this.userRead.table('clients').getAll(email, { index: 'email' }).withFields('email', 'password', 'salt')
      return user[0]
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'validate credentials', message: e.message } }
    }
  }
  async getAllServices () {
    try {
      let services = await this.userRead.table('services')
      return services
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'GET_SERVICES', message: e.message } }
    }
  }
  async getEmployes (filter = {}, skip = 0) {
    try {
      let employes = await this.userRead.table('employes').filter(filter).without('password', 'salt').skip(skip).limit(25)
      return employes
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'GET_SERVICES', message: e.message } }
    }
  }
  async getAllNotfications (userId, skip) {
    try {
      let notifications = await this.userRead.table('notifications').getAll(userId, { index: 'userId' }).skip(skip).limit(25)
      return notifications
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'GET_ALL_NOTIFICATIONS', message: e.message } }
    }
  }
  async getSingleNotifcation (id) {
    try {
      let notification = await this.userRead.table('notifications').get(id)
      return notification
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'GET_SINGLE_NOTIFICATION', message: e.message } }
    }
  }
  async changeStateNotification (id) {
    try {
      let notification = await await this.fullUser.table('notifications').get(id).update({ state: 'read' })
      return notification
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'GET_SINGLE_NOTIFICATION', message: e.message } }
    }
  }
}
module.exports = new Datasource()
