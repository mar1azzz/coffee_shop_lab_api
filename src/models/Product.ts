import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({ tableName: "products" })
export class Product extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.FLOAT, allowNull: false })
  price!: number;
}
