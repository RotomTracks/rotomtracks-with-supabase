/**
 * Mock Supabase client for development when Supabase is not available
 */

export interface MockSupabaseClient {
  from: (table: string) => MockQueryBuilder;
  auth: MockAuth;
}

interface MockQueryBuilder {
  select: (columns?: string) => MockQueryBuilder;
  insert: (data: unknown) => MockQueryBuilder;
  update: (data: unknown) => MockQueryBuilder;
  delete: () => MockQueryBuilder;
  eq: (column: string, value: unknown) => MockQueryBuilder;
  neq: (column: string, value: unknown) => MockQueryBuilder;
  gt: (column: string, value: unknown) => MockQueryBuilder;
  gte: (column: string, value: unknown) => MockQueryBuilder;
  lt: (column: string, value: unknown) => MockQueryBuilder;
  lte: (column: string, value: unknown) => MockQueryBuilder;
  like: (column: string, pattern: string) => MockQueryBuilder;
  ilike: (column: string, pattern: string) => MockQueryBuilder;
  in: (column: string, values: unknown[]) => MockQueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => MockQueryBuilder;
  limit: (count: number) => MockQueryBuilder;
  range: (from: number, to: number) => MockQueryBuilder;
  single: () => Promise<{ data: unknown | null; error: null }>;
  then: (callback: (result: { data: unknown[] | null; error: null; count?: number }) => void) => void;
}

interface MockAuth {
  getUser: () => Promise<{ data: { user: null }; error: null }>;
  signUp: (credentials: { email: string; password: string }) => Promise<{ data: { user: null }; error: { message: string } }>;
  signInWithPassword: (credentials: { email: string; password: string }) => Promise<{ data: { user: null }; error: { message: string } }>;
  signOut: () => Promise<{ error: null }>;
  resetPasswordForEmail: (email: string, options?: unknown) => Promise<{ error: { message: string } }>;
  updateUser: (attributes: { password?: string }) => Promise<{ error: { message: string } }>;
  getClaims: () => Promise<{ data: { claims: null }; error: null }>;
}

class MockQueryBuilderImpl implements MockQueryBuilder {
  private table: string;
  private operations: string[] = [];

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string): MockQueryBuilder {
    this.operations.push(`select(${columns || '*'})`);
    return this;
  }

  insert(data: unknown): MockQueryBuilder {
    this.operations.push(`insert(${JSON.stringify(data)})`);
    return this;
  }

  update(data: unknown): MockQueryBuilder {
    this.operations.push(`update(${JSON.stringify(data)})`);
    return this;
  }

  delete(): MockQueryBuilder {
    this.operations.push('delete()');
    return this;
  }

  eq(column: string, value: unknown): MockQueryBuilder {
    this.operations.push(`eq(${column}, ${value})`);
    return this;
  }

  neq(column: string, value: unknown): MockQueryBuilder {
    this.operations.push(`neq(${column}, ${value})`);
    return this;
  }

  gt(column: string, value: unknown): MockQueryBuilder {
    this.operations.push(`gt(${column}, ${value})`);
    return this;
  }

  gte(column: string, value: unknown): MockQueryBuilder {
    this.operations.push(`gte(${column}, ${value})`);
    return this;
  }

  lt(column: string, value: unknown): MockQueryBuilder {
    this.operations.push(`lt(${column}, ${value})`);
    return this;
  }

  lte(column: string, value: unknown): MockQueryBuilder {
    this.operations.push(`lte(${column}, ${value})`);
    return this;
  }

  like(column: string, pattern: string): MockQueryBuilder {
    this.operations.push(`like(${column}, ${pattern})`);
    return this;
  }

  ilike(column: string, pattern: string): MockQueryBuilder {
    this.operations.push(`ilike(${column}, ${pattern})`);
    return this;
  }

  in(column: string, values: unknown[]): MockQueryBuilder {
    this.operations.push(`in(${column}, [${values.join(', ')}])`);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): MockQueryBuilder {
    this.operations.push(`order(${column}, ${options?.ascending ? 'asc' : 'desc'})`);
    return this;
  }

  limit(count: number): MockQueryBuilder {
    this.operations.push(`limit(${count})`);
    return this;
  }

  range(from: number, to: number): MockQueryBuilder {
    this.operations.push(`range(${from}, ${to})`);
    return this;
  }

  async single(): Promise<{ data: unknown | null; error: null }> {
    console.log(`[MOCK SUPABASE] ${this.table}.${this.operations.join('.')}.single()`);
    return { data: null, error: null };
  }

  then(callback: (result: { data: unknown[] | null; error: null; count?: number }) => void): void {
    console.log(`[MOCK SUPABASE] ${this.table}.${this.operations.join('.')}`);
    callback({ data: [], error: null, count: 0 });
  }
}

class MockAuthImpl implements MockAuth {
  async getUser(): Promise<{ data: { user: null }; error: null }> {
    console.log('[MOCK SUPABASE] auth.getUser()');
    return { data: { user: null }, error: null };
  }

  async signUp(credentials: { email: string; password: string }): Promise<{ data: { user: null }; error: { message: string } }> {
    console.log(`[MOCK SUPABASE] auth.signUp(${credentials.email})`);
    return { 
      data: { user: null }, 
      error: { message: 'Mock mode: Sign up not available' } 
    };
  }

  async signInWithPassword(credentials: { email: string; password: string }): Promise<{ data: { user: null }; error: { message: string } }> {
    console.log(`[MOCK SUPABASE] auth.signInWithPassword(${credentials.email})`);
    return { 
      data: { user: null }, 
      error: { message: 'Mock mode: Sign in not available' } 
    };
  }

  async signOut(): Promise<{ error: null }> {
    console.log('[MOCK SUPABASE] auth.signOut()');
    return { error: null };
  }

  async resetPasswordForEmail(email: string, options?: unknown): Promise<{ error: { message: string } }> {
    console.log(`[MOCK SUPABASE] auth.resetPasswordForEmail(${email})`);
    return { error: { message: 'Mock mode: Password reset not available' } };
  }

  async updateUser(attributes: { password?: string }): Promise<{ error: { message: string } }> {
    console.log('[MOCK SUPABASE] auth.updateUser()');
    return { error: { message: 'Mock mode: User update not available' } };
  }

  async getClaims(): Promise<{ data: { claims: null }; error: null }> {
    console.log('[MOCK SUPABASE] auth.getClaims()');
    return { data: { claims: null }, error: null };
  }
}

export function createMockClient(): MockSupabaseClient {
  return {
    from: (table: string) => new MockQueryBuilderImpl(table),
    auth: new MockAuthImpl(),
  };
}