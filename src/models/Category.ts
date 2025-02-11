import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { Product } from "./Product";

@Table({ tableName: "categories" })
export class Category extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @HasMany(() => Product)
  products!: Product[];
}