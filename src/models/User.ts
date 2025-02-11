import { Table, Column, Model, DataType } from "sequelize-typescript";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

@Table({ tableName: "users" })
export class User extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  username!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  email!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password!: string;

  @Column({ type: DataType.ENUM("USER", "ADMIN"), defaultValue: "USER" })
  role!: string;
}

