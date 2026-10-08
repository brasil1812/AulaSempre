import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
export interface ApiUser { id_usuario: number; id_escola: number | null; nome: string; email: string; tipo_usuario: 'ESCOLA' | 'PROFESSOR'; }
export interface CatalogItem { id_disciplina?: number; id_nivel_ensino?: number; nome: string; descricao?: string; }
export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) return error.error?.erro || (error.status === 0 ? 'Não foi possível conectar ao servidor. Tente novamente.' : 'Não foi possível concluir a operação.');
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
}
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = '/api';
  private readonly tokenKey = 'aulasempre_token';
  private readonly userKey = 'aulasempre_user';
  constructor(private http: HttpClient) {}
  get token(): string | null { return sessionStorage.getItem(this.tokenKey) || localStorage.getItem(this.tokenKey); }
  get isAuthenticated(): boolean { return !!this.token && !!this.user; }
  get user(): ApiUser | null {
    const raw = sessionStorage.getItem(this.userKey) || localStorage.getItem(this.userKey);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  private headers(): HttpHeaders { return this.token ? new HttpHeaders({ Authorization: `Bearer ${this.token}` }) : new HttpHeaders(); }
  private async resolve<T>(source: Observable<T>): Promise<T> {
    const session = this.token;
    try { return await firstValueFrom(source); }
    catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401 && session === this.token) { this.logout(); window.dispatchEvent(new Event('aulasempre-session-expired')); }
      throw error;
    }
  }
  async login(email: string, senha: string, remember = false): Promise<ApiUser> {
    const result = await firstValueFrom(this.http.post<{token: string; usuario: ApiUser}>(`${this.baseUrl}/auth/login`, {email, senha}));
    this.logout();
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(this.tokenKey, result.token); storage.setItem(this.userKey, JSON.stringify(result.usuario));
    return result.usuario;
  }
  async register(data: {nome: string; email: string; senha: string; tipo_usuario: 'ESCOLA' | 'PROFESSOR'; telefone?: string; cidade?: string; estado?: string; endereco?: string}): Promise<void> {
    await firstValueFrom(this.http.post(`${this.baseUrl}/auth/cadastro`, data));
  }
  logout(): void { for (const storage of [localStorage, sessionStorage]) { storage.removeItem(this.tokenKey); storage.removeItem(this.userKey); } }
  private get<T>(path: string): Promise<T> { return this.resolve(this.http.get<T>(this.baseUrl + path, {headers: this.headers()})); }
  private post<T>(path: string, data: unknown): Promise<T> { return this.resolve(this.http.post<T>(this.baseUrl + path, data, {headers: this.headers()})); }
  private patch(path: string, data: unknown): Promise<unknown> { return this.resolve(this.http.patch(this.baseUrl + path, data, {headers: this.headers()})); }
  me(): Promise<ApiUser> { return this.get('/auth/me'); }
  disciplines(): Promise<CatalogItem[]> { return this.get('/catalogos/disciplinas'); }
  levels(): Promise<CatalogItem[]> { return this.get('/catalogos/niveis-ensino'); }
  school(): Promise<Record<string, unknown>> { return this.get('/escolas/me'); }
  requests(): Promise<Record<string, unknown>[]> { return this.get('/solicitacoes'); }
  createRequest(data: Record<string, unknown>): Promise<{id_solicitacao: number}> { return this.post('/solicitacoes', data); }
  requestMatches(id: string): Promise<Record<string, unknown>[]> { return this.get(`/solicitacoes/${id}/matches`); }
  async updateRequestStatus(id: string, status: string): Promise<void> { await this.patch(`/solicitacoes/${id}/status`, {status}); }
  professors(): Promise<Record<string, unknown>[]> { return this.get('/professores'); }
  myProfile(): Promise<Record<string, unknown>> { return this.get('/professores/me'); }
  professor(id: string): Promise<Record<string, unknown>> { return this.get(`/professores/${id}`); }
  professorSubstitutions(id: string): Promise<Record<string, unknown>[]> { return this.get(`/professores/${id}/substituicoes`); }
  async updateProfile(id: string, payload: Record<string, unknown>): Promise<void> { await this.resolve(this.http.put(`${this.baseUrl}/professores/${id}`, payload, {headers: this.headers()})); }
  async sendInvite(requestId: string, professorId: string): Promise<void> { await this.post('/convites', {id_solicitacao: Number(requestId), id_professor: Number(professorId)}); }
  invites(): Promise<Record<string, unknown>[]> { return this.get('/convites'); }
  async answerInvite(id: string, status: 'ACEITO' | 'RECUSADO'): Promise<void> { await this.patch(`/convites/${id}/resposta`, {status}); }
  substitutions(): Promise<Record<string, unknown>[]> { return this.get('/substituicoes'); }
  async updateSubstitution(id: string, status: string): Promise<void> { await this.patch(`/substituicoes/${id}/status`, {status}); }
  async evaluate(id: string, nota: number, comentario: string): Promise<void> { await this.post(`/substituicoes/${id}/avaliacao`, {nota, comentario}); }
}
