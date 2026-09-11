import "server-only";

import { Pool, type QueryResultRow } from "@neondatabase/serverless";

type DbError = {
  code?: string;
  message: string;
};

type DbResponse = {
  data: any;
  error: DbError | null;
};

type Filter = {
  column: string;
  operator: "eq" | "gte";
  value: unknown;
};

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const quoteIdentifier = (value: string) => {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new Error(`Unsupported SQL identifier: ${value}`);
  }
  return `"${value}"`;
};

const normalizeError = (error: unknown): DbError => {
  if (error && typeof error === "object") {
    const candidate = error as { code?: unknown; message?: unknown };
    return {
      ...(typeof candidate.code === "string" ? { code: candidate.code } : {}),
      message:
        typeof candidate.message === "string"
          ? candidate.message
          : "Database request failed",
    };
  }

  return { message: String(error) };
};

const globalWithPool = globalThis as typeof globalThis & {
  __githubRpgNeonPool?: Pool;
};

const getPool = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!globalWithPool.__githubRpgNeonPool) {
    globalWithPool.__githubRpgNeonPool = new Pool({ connectionString });
  }

  return globalWithPool.__githubRpgNeonPool;
};

export async function query<TRow extends QueryResultRow = Record<string, unknown>>(
  text: string,
  values: unknown[] = []
): Promise<TRow[]> {
  const result = await getPool().query<TRow>(text, values);
  return result.rows;
}

const toDbValue = (column: string, value: unknown) => {
  // node-postgres serializes plain objects as JSON, but arrays are otherwise
  // treated as PostgreSQL arrays. This column is JSONB in the Neon schema.
  if (column === "unlockedAvatars" && Array.isArray(value)) {
    return JSON.stringify(value);
  }
  return value;
};

const parseSelection = (selection: string) => {
  if (!selection.trim() || selection.trim() === "*") {
    return "*";
  }

  return selection
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean)
    .map(quoteIdentifier)
    .join(", ");
};

class QueryBuilder {
  private operation: "select" | "insert" | "update" | "upsert" = "select";
  private selection = "*";
  private values: Record<string, unknown> | Record<string, unknown>[] = {};
  private filters: Filter[] = [];
  private orderBy?: { column: string; ascending: boolean };
  private maxRows?: number;
  private cardinality: "many" | "single" | "maybeSingle" = "many";
  private returning = false;
  private conflictColumn?: string;
  private ignoreDuplicates = false;

  constructor(private readonly table: string) {
    quoteIdentifier(table);
  }

  select(columns = "*") {
    this.selection = columns;
    this.returning = true;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, operator: "eq", value });
    return this;
  }

  gte(column: string, value: unknown) {
    this.filters.push({ column, operator: "gte", value });
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.orderBy = { column, ascending: options.ascending !== false };
    return this;
  }

  limit(value: number) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error("Invalid query limit");
    }
    this.maxRows = value;
    return this;
  }

  single() {
    this.cardinality = "single";
    return this;
  }

  maybeSingle() {
    this.cardinality = "maybeSingle";
    return this;
  }

  insert(values: Record<string, unknown> | Record<string, unknown>[]) {
    this.operation = "insert";
    this.values = values;
    return this;
  }

  update(values: Record<string, unknown>) {
    this.operation = "update";
    this.values = values;
    return this;
  }

  upsert(
    values: Record<string, unknown> | Record<string, unknown>[],
    options: { onConflict?: string; ignoreDuplicates?: boolean } = {}
  ) {
    this.operation = "upsert";
    this.values = values;
    this.conflictColumn = options.onConflict;
    this.ignoreDuplicates = options.ignoreDuplicates === true;
    return this;
  }

  then<TResult1 = DbResponse, TResult2 = never>(
    onfulfilled?:
      | ((value: DbResponse) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled ?? undefined, onrejected ?? undefined);
  }

  private buildWhere(values: unknown[]) {
    if (this.filters.length === 0) {
      return "";
    }

    const clauses = this.filters.map((filter) => {
      const column = quoteIdentifier(filter.column);
      if (filter.operator === "eq" && filter.value === null) {
        return `${column} is null`;
      }
      values.push(toDbValue(filter.column, filter.value));
      return `${column} ${filter.operator === "eq" ? "=" : ">="} $${values.length}`;
    });

    return ` where ${clauses.join(" and ")}`;
  }

  private formatRows(rows: any[]): DbResponse {
    if (this.cardinality === "many") {
      return { data: rows, error: null };
    }

    if (rows.length !== 1) {
      if (rows.length === 0 && this.cardinality === "maybeSingle") {
        return { data: null, error: null };
      }
      return {
        data: null,
        error: {
          code: "PGRST116",
          message:
            rows.length === 0
              ? "JSON object requested, multiple (or no) rows returned"
              : "JSON object requested, multiple (or no) rows returned",
        },
      };
    }

    return { data: rows[0], error: null };
  }

  private async executeSelect(): Promise<DbResponse> {
    // This is the one relational projection that the former API client
    // supported. Keep its response shape so the home action remains stable.
    if (this.table === "Users" && this.selection.includes("status:UserStatus")) {
      return this.executeHomeProjection();
    }

    const values: unknown[] = [];
    const where = this.buildWhere(values);
    const order = this.orderBy
      ? ` order by ${quoteIdentifier(this.orderBy.column)} ${
          this.orderBy.ascending ? "asc" : "desc"
        }`
      : "";
    const limit = this.maxRows === undefined ? "" : ` limit ${this.maxRows}`;
    const text = `select ${parseSelection(this.selection)} from public.${quoteIdentifier(
      this.table
    )}${where}${order}${limit}`;
    const rows = await query(text, values);
    return this.formatRows(rows);
  }

  private async executeHomeProjection(): Promise<DbResponse> {
    const idFilter = this.filters.find((filter) => filter.column === "id");
    if (!idFilter || idFilter.operator !== "eq") {
      return { data: null, error: { code: "PGRST116", message: "User not found" } };
    }

    const users = await query(
      `select "id", "name", "image", "createdAt", "updatedAt"
       from public."Users" where "id" = $1`,
      [idFilter.value]
    );
    if (users.length !== 1) {
      return this.formatRows(users);
    }

    const [statuses, items, avatars] = await Promise.all([
      query(
        `select "id", "userId", "level", "commit", "coin", "hp", "attack", "defense",
                "selectedAvatar", "unlockedAvatars", "lastSyncAt", "syncStartedAt",
                "syncStatus", "syncError", "createdAt", "updatedAt"
           from public."UserStatus" where "userId" = $1`,
        [idFilter.value]
      ),
      query(
        `select "id", "name", "image", "type", "attack", "defense", "equipped", "userId"
           from public."Items" where "userId" = $1 and "equipped" = true`,
        [idFilter.value]
      ),
      query(
        `select "id", "name", "image", "type", "hp", "attack", "defense", "equipped", "userId"
           from public."Avatar" where "userId" = $1 and "equipped" = true`,
        [idFilter.value]
      ),
    ]);

    if (statuses.length !== 1) {
      return {
        data: null,
        error: { code: "PGRST116", message: "User status not found" },
      };
    }

    return {
      data: {
        ...users[0],
        status: [statuses[0]],
        items,
        avatar: avatars,
      },
      error: null,
    };
  }

  private async executeMutation(): Promise<DbResponse> {
    const records = Array.isArray(this.values) ? this.values : [this.values];
    if (records.length === 0) {
      return { data: null, error: { message: "Mutation requires values" } };
    }

    const columns = Object.keys(records[0]);
    if (columns.length === 0) {
      return { data: null, error: { message: "Mutation requires columns" } };
    }

    const values: unknown[] = [];
    const rowPlaceholders = records.map((record) => {
      const placeholders = columns.map((column) => {
        values.push(toDbValue(column, record[column]));
        return `$${values.length}`;
      });
      return `(${placeholders.join(", ")})`;
    });
    const columnSql = columns.map(quoteIdentifier).join(", ");
    let text = `insert into public.${quoteIdentifier(this.table)} (${columnSql}) values ${rowPlaceholders.join(", ")}`;

    if (this.operation === "upsert") {
      const conflictColumn = this.conflictColumn || "id";
      quoteIdentifier(conflictColumn);
      if (this.ignoreDuplicates) {
        text += ` on conflict (${quoteIdentifier(conflictColumn)}) do nothing`;
      } else {
        const updates = columns
          .filter((column) => column !== conflictColumn)
          .map((column) => `${quoteIdentifier(column)} = excluded.${quoteIdentifier(column)}`);
        text += updates.length
          ? ` on conflict (${quoteIdentifier(conflictColumn)}) do update set ${updates.join(", ")}`
          : ` on conflict (${quoteIdentifier(conflictColumn)}) do nothing`;
      }
    }

    if (this.operation === "update") {
      const updateValues: unknown[] = [];
      const setSql = columns.map((column) => {
        updateValues.push(toDbValue(column, records[0][column]));
        return `${quoteIdentifier(column)} = $${updateValues.length}`;
      });
      const where = this.buildWhere(updateValues);
      text = `update public.${quoteIdentifier(this.table)} set ${setSql.join(", ")}${where}`;
      values.splice(0, values.length, ...updateValues);
    }

    if (this.returning) {
      text += ` returning ${parseSelection(this.selection)}`;
    }

    const rows = await query(text, values);
    return this.returning ? this.formatRows(rows) : { data: null, error: null };
  }

  private async execute(): Promise<DbResponse> {
    try {
      if (this.operation === "select") {
        return await this.executeSelect();
      }
      return await this.executeMutation();
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  }
}

const RPC_ARGUMENT_ORDER: Record<string, string[]> = {
  purchase_item: [
    "p_user_id",
    "p_equipment_id",
    "p_name",
    "p_image",
    "p_description",
    "p_type",
    "p_attack",
    "p_defense",
    "p_price",
  ],
  purchase_avatar: [
    "p_user_id",
    "p_avatar_id",
    "p_name",
    "p_image",
    "p_description",
    "p_type",
    "p_hp",
    "p_attack",
    "p_defense",
    "p_price",
  ],
  unlock_avatar: [
    "p_user_id",
    "p_avatar_id",
    "p_name",
    "p_image",
    "p_description",
    "p_type",
    "p_hp",
    "p_attack",
    "p_defense",
    "p_price",
    "p_unlock_level",
  ],
  equip_item: ["p_user_id", "p_item_id"],
  equip_avatar: ["p_user_id", "p_avatar_id"],
  start_battle: [
    "p_user_id",
    "p_player_max_hp",
    "p_player_attack",
    "p_player_defense",
  ],
  attack_battle: ["p_user_id", "p_battle_id"],
};

class RpcCall {
  constructor(
    private readonly functionName: string,
    private readonly args: Record<string, unknown>
  ) {}

  then<TResult1 = DbResponse, TResult2 = never>(
    onfulfilled?:
      | ((value: DbResponse) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled ?? undefined, onrejected ?? undefined);
  }

  private async execute(): Promise<DbResponse> {
    try {
      const argumentNames = RPC_ARGUMENT_ORDER[this.functionName];
      if (!argumentNames) {
        throw new Error(`Unsupported database function: ${this.functionName}`);
      }

      const values = argumentNames.map((name) => this.args[name]);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
      const rows = await query<{ result: unknown }>(
        `select public.${quoteIdentifier(this.functionName)}(${placeholders}) as "result"`,
        values
      );
      return { data: rows[0]?.result ?? null, error: null };
    } catch (error) {
      return { data: null, error: normalizeError(error) };
    }
  }
}

export const db = {
  from(table: string) {
    return new QueryBuilder(table);
  },
  rpc(functionName: string, args: Record<string, unknown>) {
    return new RpcCall(functionName, args);
  },
};
