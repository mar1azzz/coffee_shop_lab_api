import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import { User } from "./User";
import { OrderItem } from "./OrderItem";

export enum OrderStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

@Table({ tableName: "orders" })
export class Order extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    userId!: number;

    @BelongsTo(() => User)
    user!: User;


  @Column({ type: DataType.ENUM(OrderStatus.PENDING, OrderStatus.COMPLETED, OrderStatus.CANCELLED), defaultValue: OrderStatus.PENDING })
  status!: OrderStatus;

  @HasMany(() => OrderItem, { onDelete: "CASCADE", hooks: true })
  items!: OrderItem[];

}
