const r = require('rethinkdbdash')
require('dotenv').config()

const databaseSetup = {
  host: process.env.DB_URL,
  port: process.env.DB_PORT,
  // user: process.env.DB_USER_FULL,
  // password: process.env.DB_PASSWORD_FULL,
  db: process.env.DB_NAME
}
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
      console.log(alreadyExits)
      if (!alreadyExits) {
        let newUser = await this.fullUser.table('clients').insert(data)
        if (newUser.inserted === 1) {
          return this.getUserProfile(data.email)
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
  async getServicesByArrayIds (ids) {
    try {
      let services = await this.userRead.table('services').getAll(this.userRead.args(ids))
      return services
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'GET_SERVICES_BY_IDS', message: e.message } }
    }
  }
  async getEmployes (filter = {}, skip = 0) {
    try {
      let employes = await this.userRead.table('employes').filter(filter).without('password', 'salt').skip(skip).limit(25)
      return employes
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'GET_EMPLOYES', message: e.message } }
    }
  }
  async validEmployed (id) {
    try {
      let employed = await this.userRead.table('employes').get(id).without('password', 'salt', 'email')
      if (employed) return true
      return false
    } catch (e) {
      console.log({ error: { code: 'DATABASE_ERROR', action: 'VALIDATE_EMPLOYED', message: e.message } })
      return false
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
      let notification = await this.fullUser.table('notifications').get(id).update({ state: 'read' })
      return notification
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'GET_SINGLE_NOTIFICATION', message: e.message } }
    }
  }
  async professionalsAvailables (distance = 5, unit = 'km', userCordinates, limit = 25, skip = 0, startDate, endDate) {
    try {
      let professionals = await this.userRead.table('employes')
        .getNearest(this.userRead.point(userCordinates.lat, userCordinates.long),
          { index: 'geo_position', maxDist: distance, unit })
        .map(doc => {
          return {
            distance: doc('dist'),
            comuna: doc('doc')('comuna'),
            firstName: doc('doc')('firstName'),
            lastName: doc('doc')('lastName'),
            id: doc('doc')('id'),
            geo_position: doc('doc')('geo_position'),
            available: this.userRead.table('reservations').between([doc('doc')('id'), this.userRead.epochTime(startDate)], [doc('doc')('id'), this.userRead.epochTime(endDate)], { index: 'employedDate' }).isEmpty()
          }
        }).filter({ available: true }).limit(limit).skip(skip)
      return professionals
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'GET_AVIABLABLES_PROFESSIONALS', message: e.message } }
    }
  }
  async reservationCreate (data) {
    try {
      let reservation = await this.fullUser.table('reservations').insert({ ...data, date: this.fullUser.epochTime(data.date), createdAt: this.fullUser.now() })
      return reservation
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'GET_SINGLE_NOTIFICATION', message: e.message } }
    }
  }
  async reservationList (userId, state = 'pending', skip = 0, limit = 25) {
    try {
      let reservations = await this.userRead.table('reservations').getAll([userId, state], { index: 'userState' }).orderBy('date')
        .merge(doc => {
          return {
            employed: this.userRead.table('employes').get(doc('employedId')).pluck('id', 'firstName', 'lastName'),
            address: this.userRead.table('clients').get(doc('userId')).bracket('address').filter({ id: doc('address') }),
            services: doc('services').map(ser => {
              return {
                cant: ser('cant'),
                service: this.userRead.table('services').get(ser('id'))
              }
            })
          }
        }).without('employedId')
      return reservations
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'GETING_LIST_RESERVATIONS_STATE_PENDING', message: e.message } }
    }
  }
  async cancelReservations (userId, skip, limit) {
    try {
      let reservations = await this.userRead.table('reservations').getAll([userId, 'cancel'], { index: 'userState' })
      return reservations
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'GETING_LIST_RESERVATIONS_STATE_CANCEL', message: e.message } }
    }
  }
  async listDecorations (skip, limit) {
    try {
      let reservation = await this.userRead.table('decorations').skip(skip).limit(limit)
      return reservation
    } catch (e) {
      return { error: { code: 'DATABASE_ERROR', action: 'GETING_LIST_DECORATIONS', message: e.message } }
    }
  }
}
module.exports = new Datasource()
