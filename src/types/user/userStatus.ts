export type UserStatuses = {
  id: string;
  name: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  status: {
    userId: string;
    commit: number;
    level: number;
    coin: number;
    createdAt: Date;
    updatedAt: Date;
  };
};
