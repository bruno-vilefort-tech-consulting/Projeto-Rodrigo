import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType,
  HasMany,
  AfterCreate
} from "sequelize-typescript";
import Contact from "./Contact";
import Message from "./Message";

import Plan from "./Plan";
import Queue from "./Queue";
import Setting from "./Setting";
import Ticket from "./Ticket";
import TicketTraking from "./TicketTraking";
import User from "./User";
import UserRating from "./UserRating";
import Whatsapp from "./Whatsapp";
import CompaniesSettings from "./CompaniesSettings";
import Invoices from "./Invoices";
import logger from "../utils/logger";

@Table
class Company extends Model<Company> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  phone: string;

  @Column
  email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    defaultValue: null
  })
  document: string | null;

  @Column({ defaultValue: "" })
  paymentMethod: string;

  @Column
  lastLogin: Date;

  @Column
  status: boolean;

  @Column
  dueDate: string;

  @Column
  recurrence: string;

  @Column({
    type: DataType.JSONB
  })
  schedules: [];

  @Column({
    allowNull: true,
    comment: "Company specific timezone (e.g., America/Sao_Paulo, America/New_York)"
  })
  timezone: string;

  @ForeignKey(() => Plan)
  @Column
  planId: number;

  @BelongsTo(() => Plan)
  plan: Plan;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  folderSize: string;

  @Column
  numberFileFolder: string;

  @Column
  updatedAtFolder: string;

  @HasMany(() => User, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  users: User[];

  @HasMany(() => UserRating, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  userRatings: UserRating[];

  @HasMany(() => Queue, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  queues: Queue[];

  @HasMany(() => Whatsapp, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  whatsapps: Whatsapp[];

  @HasMany(() => Message, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  messages: Message[];

  @HasMany(() => Contact, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  contacts: Contact[];

  @HasMany(() => Setting, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  settings: Setting[];

  @HasMany (() => CompaniesSettings, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  companieSettings: CompaniesSettings;

  @HasMany(() => Ticket, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  tickets: Ticket[];

  @HasMany(() => TicketTraking, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  ticketTrankins: TicketTraking[];

  @HasMany(() => Invoices, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  invoices: Invoices[];

  @AfterCreate
  static async createDemoUser(company: Company) {
    try {
      // 1. Buscar setting de demo user
      const setting = await CompaniesSettings.findOne({
        where: {
          companyId: company.id
        }
      });

      // 2. Se habilitado, criar usuário demo
      if (setting?.createDemoUser === 'enabled') {
        // Gerar email único baseado no nome da empresa
        const companySlug = company.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        const demoEmail = `demo@${companySlug}.local`;

        await User.create({
          name: 'Usuário Demo',
          email: demoEmail,
          password: 'demo123', // Será hasheado pelo hook BeforeCreate do User
          profile: 'user',
          companyId: company.id
        });

        logger.info({
          message: 'Demo user created successfully',
          companyId: company.id,
          companyName: company.name,
          demoEmail
        });
      }
    } catch (err: any) {
      logger.error({
        message: 'Error creating demo user',
        error: err.message,
        companyId: company.id,
        stack: err.stack
      });
      // Não lançar erro para não quebrar criação da empresa
    }
  }
}

export default Company;
