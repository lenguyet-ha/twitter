import { ObjectId } from 'mongodb'

interface FollowerType {
  _id?: ObjectId
  user_id: ObjectId
  followed_id: ObjectId
  created_at?: Date
  updated_at?: Date
}
export default class Follower {
  _id?: ObjectId
  user_id: ObjectId
  followed_id: ObjectId
  created_at?: Date
  updated_at?: Date
  constructor({ _id, user_id, followed_id, created_at, updated_at }: FollowerType) {
    this._id = _id
    this.user_id = user_id
    this.followed_id = followed_id
    this.created_at = created_at || new Date()
    this.updated_at = updated_at || new Date()
  }
}
