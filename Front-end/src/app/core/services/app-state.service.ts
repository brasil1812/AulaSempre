import { Injectable, signal } from '@angular/core';
import { AppState, Role, SubRequest, Teacher, RequestStatus } from '../models/app.models';
import { ApiService, CatalogItem, errorMessage } from './api.service';
import { DEFAULT_REQUESTS, DEFAULT_TEACHERS } from './demo-data';
const DEMO_KEY = 'aulasempre_demo_state';
type RequestInput = Omit<SubRequest, 'id' | 'status' | 'professorConvidadoId' | 'professorConvidadoNome' | 'professorConfirmadoId' | 'professorConfirmadoNome' | 'criadaEm' | 'recusadoPorIds'>;
@Injectable({providedIn: 'root'})
export class AppStateService {
  private state = signal<AppState>({requests: [], teachers: []});
  private activeRole = signal<Role>('instituicao');
  readonly demo = signal(sessionStorage.getItem('aulasempre_demo') === 'true');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly disciplines = signal<CatalogItem[]>([]);
  readonly levels = signal<CatalogItem[]>([]);
  readonly profile = signal<Record<string, unknown> | null>(null);
  private schoolName = signal('');
  private revision = 0;
  constructor(public api: ApiService) {
    if (api.isAuthenticated) { this.demo.set(false); void this.refreshFromApi().catch(() => {}); }
    else if (this.demo()) { this.activeRole.set(sessionStorage.getItem('aulasempre_demo_role') === 'professor' ? 'professor' : 'instituicao'); this.loadDemo(); }
    window.addEventListener('aulasempre-session-expired', () => { this.logout(); this.error.set('Sua sessão expirou. Entre novamente.'); });
  }
  get role(): Role { return this.api.user ? (this.api.user.tipo_usuario === 'PROFESSOR' ? 'professor' : 'instituicao') : this.activeRole(); }
  get requests(): SubRequest[] { return this.state().requests; }
  get teachers(): Teacher[] { return this.state().teachers; }
  get currentTeacher(): Teacher {
    return this.teachers.find(t => this.demo() ? t.id === 'ana' : t.id === String(this.profile()?.['id_professor'])) || {
      id: '', nome: this.api.user?.nome || '', initials: this.initials(this.api.user?.nome || ''), disciplinas: [], formacao: '', experiencia: 0, nota: 0, subs: 0, distancia: '', cidade: '', disponivel: false, verificado: false, cor: 'blue', bio: '', niveis: [],
    };
  }
  get currentInstitution() { return {nome: this.demo() ? 'Colégio Horizonte' : this.schoolName() || this.api.user?.nome || ''}; }
  get userName() { return this.demo() ? (this.role === 'professor' ? 'Ana Figueiredo' : 'Mariana Costa') : this.api.user?.nome || ''; }
  async refreshFromApi(): Promise<void> {
    if (this.demo() || !this.api.isAuthenticated) return;
    const version = ++this.revision;
    this.loading.set(true); this.error.set('');
    try {
      const [user, disciplines, levels, teachers, invites] = await Promise.all([this.api.me(), this.api.disciplines(), this.api.levels(), this.api.professors(), this.api.invites()]);
      const [requests, profile, school] = user.tipo_usuario === 'ESCOLA'
        ? await Promise.all([this.api.requests(), Promise.resolve(null), this.api.school()])
        : [invites, await this.api.myProfile(), null];
      if (version !== this.revision) return;
      this.disciplines.set(disciplines); this.levels.set(levels); this.profile.set(profile);
      this.schoolName.set(String(school?.['nome'] || ''));
      this.state.set({teachers: teachers.map(row => this.fromTeacher(row)), requests: requests.map(row => user.tipo_usuario === 'ESCOLA' ? this.fromRequest(row, invites) : this.fromInvite(row))});
    } catch (error) { if (version === this.revision) this.error.set(errorMessage(error)); throw error; }
    finally { if (version === this.revision) this.loading.set(false); }
  }
  async retry(): Promise<void> { await this.refreshFromApi().catch(() => {}); }
  startDemo(role: Role): void {
    this.api.logout(); ++this.revision; this.demo.set(true); this.activeRole.set(role);
    sessionStorage.setItem('aulasempre_demo', 'true'); sessionStorage.setItem('aulasempre_demo_role', role);
    this.error.set(''); this.loading.set(false); this.loadDemo();
  }
  private loadDemo() {
    try { this.state.set(JSON.parse(sessionStorage.getItem(DEMO_KEY) || 'null') || structuredClone({requests: DEFAULT_REQUESTS, teachers: DEFAULT_TEACHERS})); }
    catch { this.state.set(structuredClone({requests: DEFAULT_REQUESTS, teachers: DEFAULT_TEACHERS})); }
    this.disciplines.set(['Matemática','Língua Portuguesa','Física','Química','Biologia','História','Geografia','Inglês'].map(nome => ({nome})));
    this.levels.set(['Educação Infantil','Ensino Fundamental I','Ensino Fundamental II','Ensino Médio'].map(nome => ({nome})));
  }
  private persistDemo(requests: SubRequest[]) { this.state.set({...this.state(), requests}); sessionStorage.setItem(DEMO_KEY, JSON.stringify(this.state())); }
  private async reloadAfterWrite(): Promise<void> { await this.refreshFromApi().catch(() => {}); }
  async createRequest(data: RequestInput): Promise<SubRequest> {
    const request: SubRequest = {...data, id: crypto.randomUUID(), status: 'aberta', professorConvidadoId: null, professorConvidadoNome: null, professorConfirmadoId: null, professorConfirmadoNome: null, criadaEm: new Date().toISOString(), recusadoPorIds: []};
    if (this.demo()) { this.persistDemo([request,...this.requests]); return request; }
    const discipline = this.disciplines().find(item => item.nome === data.disciplina)?.id_disciplina;
    const level = this.levels().find(item => item.nome === data.nivel)?.id_nivel_ensino;
    if (!discipline || !level) throw new Error('Selecione uma disciplina e um nível do catálogo.');
    const result = await this.api.createRequest({id_disciplina: discipline, id_nivel_ensino: level, data_aula: data.data, horario_inicio: data.horarioInicio, horario_fim: data.horarioFim, turma: data.turma || data.nivel, observacoes: data.observacoes, modalidade: data.modalidade.toUpperCase(), cidade: data.cidade, endereco: data.endereco, valor: data.valor, conteudo: data.conteudo, formacao_minima: data.formacaoMinima, experiencia_minima: data.experienciaMinima || 0});
    request.id = String(result.id_solicitacao); await this.reloadAfterWrite(); return this.requests.find(item => item.id === request.id) || request;
  }
  async inviteTeacher(requestId: string, teacherId: string, teacherNome: string): Promise<void> {
    if (this.demo()) { this.persistDemo(this.requests.map(r => r.id === requestId ? {...r, status: 'aguardando', professorConvidadoId: teacherId, professorConvidadoNome: teacherNome} : r)); return; }
    await this.api.sendInvite(requestId, teacherId); await this.reloadAfterWrite();
  }
  async acceptInvite(requestId: string): Promise<void> { await this.answer(requestId, 'ACEITO'); }
  async declineInvite(requestId: string): Promise<void> { await this.answer(requestId, 'RECUSADO'); }
  private async answer(requestId: string, status: 'ACEITO' | 'RECUSADO') {
    const request = this.requests.find(r => r.id === requestId);
    if (!request) throw new Error('Convite não encontrado. Atualize os dados.');
    if (this.demo()) { this.persistDemo(this.requests.map(r => r.id === requestId ? {...r, status: status === 'ACEITO' ? 'confirmada' : 'recusada', professorConfirmadoId: status === 'ACEITO' ? r.professorConvidadoId : null, professorConfirmadoNome: status === 'ACEITO' ? r.professorConvidadoNome : null} : r)); return; }
    if (!request.inviteId) throw new Error('Convite não encontrado.');
    await this.api.answerInvite(request.inviteId, status); await this.reloadAfterWrite();
  }
  async cancelRequest(requestId: string): Promise<void> {
    if (this.demo()) { this.persistDemo(this.requests.map(r => r.id === requestId ? {...r, status: 'cancelada'} : r)); return; }
    await this.api.updateRequestStatus(requestId,'CANCELADA'); await this.reloadAfterWrite();
  }
  async completeRequest(request: SubRequest): Promise<void> {
    if (this.demo()) { this.persistDemo(this.requests.map(r => r.id === request.id ? {...r,status:'concluida',substitutionStatus:'REALIZADA'} : r)); return; }
    if (!request.substitutionId) throw new Error('Substituição não encontrada.');
    await this.api.updateSubstitution(request.substitutionId,'REALIZADA'); await this.reloadAfterWrite();
  }
  async evaluateRequest(request: SubRequest, nota: number, comentario: string): Promise<void> {
    if (this.demo()) { this.persistDemo(this.requests.map(r => r.id === request.id ? {...r,notaAvaliacao: nota} : r)); return; }
    if (!request.substitutionId) throw new Error('Substituição não encontrada.');
    await this.api.evaluate(request.substitutionId,nota,comentario); await this.reloadAfterWrite();
  }
  async compatibleTeachers(id: string): Promise<string[]> {
    if (this.demo()) { const r=this.requests.find(item=>item.id===id); return this.teachers.filter(t=>t.disponivel && (!r || t.disciplinas.includes(r.disciplina))).map(t=>t.id); }
    return (await this.api.requestMatches(id)).map(row=>String(row['id_professor']));
  }
  async login(email: string, senha: string, remember = false): Promise<Role> {
    await this.api.login(email, senha, remember); this.demo.set(false); sessionStorage.removeItem('aulasempre_demo'); this.state.set({requests:[],teachers:[]}); await this.refreshFromApi(); return this.role;
  }
  register(data: Parameters<ApiService['register']>[0]): Promise<void> { return this.api.register(data); }
  async saveProfile(payload: Record<string, unknown>): Promise<void> {
    if (this.demo()) throw new Error('Entre com uma conta para editar um perfil real.');
    await this.api.updateProfile(this.currentTeacher.id,payload); await this.reloadAfterWrite();
  }
  logout(): void { ++this.revision; this.api.logout(); this.demo.set(false); sessionStorage.removeItem('aulasempre_demo'); this.state.set({requests:[],teachers:[]}); this.profile.set(null); this.disciplines.set([]); this.levels.set([]); this.schoolName.set(''); this.loading.set(false); this.error.set(''); }
  private fromRequest(row: Record<string, unknown>, invites: Record<string, unknown>[]): SubRequest {
    const request = this.baseRequest(row);
    const related=invites.filter(c=>String(c['id_solicitacao'])===request.id);
    const invite=related.find(c=>c['status']==='ACEITO') || related.find(c=>c['status']==='PENDENTE');
    request.professorConvidadoId=invite?String(invite['id_professor']):null;
    request.professorConvidadoNome=invite?String(invite['professor_nome']):null;
    request.professorConfirmadoId=row['professor_confirmado_id']?String(row['professor_confirmado_id']):null;
    request.professorConfirmadoNome=row['professor_confirmado_nome']?String(row['professor_confirmado_nome']):null;
    request.recusadoPorIds=related.filter(c=>c['status']==='RECUSADO').map(c=>String(c['id_professor']));
    request.invitedTeacherIds=related.filter(c=>['PENDENTE','ACEITO'].includes(String(c['status']))).map(c=>String(c['id_professor']));
    request.notaAvaliacao=row['nota_avaliacao']==null?undefined:Number(row['nota_avaliacao']);
    return request;
  }
  private fromInvite(row: Record<string, unknown>): SubRequest {
    const r=this.baseRequest(row); r.inviteId=String(row['id_convite']);
    r.professorConvidadoId=String(row['id_professor']); r.professorConvidadoNome=String(row['professor_nome']);
    r.status=row['status']==='PENDENTE'?'aguardando':row['status']==='RECUSADO'?'recusada':row['status']==='ACEITO'?(row['status_substituicao']==='REALIZADA'?'concluida':row['status_substituicao']==='CANCELADA'?'cancelada':'confirmada'):'cancelada';
    if(row['status']==='ACEITO'){r.professorConfirmadoId=r.professorConvidadoId;r.professorConfirmadoNome=r.professorConvidadoNome;}
    return r;
  }
  private baseRequest(row: Record<string, unknown>): SubRequest {
    const statuses: Record<string, RequestStatus>={ABERTA:'aberta',EM_PROCESSO:'aguardando',PREENCHIDA:'confirmada',CONCLUIDA:'concluida',CANCELADA:'cancelada'};
    return {id:String(row['id_solicitacao']), disciplina:String(row['disciplina']||''),nivel:String(row['nivel_ensino']||''),turma:String(row['turma']||''),data:String(row['data_aula']||''),horarioInicio:String(row['horario_inicio']||'').slice(0,5),horarioFim:String(row['horario_fim']||'').slice(0,5),modalidade:row['modalidade']==='ONLINE'?'online':'presencial',cidade:String(row['cidade_escola']||''),endereco:String(row['endereco_aula']||''),valor:row['valor']==null?'':String(row['valor']),observacoes:[row['conteudo'],row['observacoes']].filter(Boolean).join('\n'),status:statuses[String(row['status'])]||'aberta',professorConvidadoId:null,professorConvidadoNome:null,professorConfirmadoId:null,professorConfirmadoNome:null,criadaEm:String(row['data_criacao']||row['data_envio']||''),instituicaoNome:String(row['escola']||''),recusadoPorIds:[],substitutionId:row['id_substituicao']?String(row['id_substituicao']):undefined,substitutionStatus:row['status_substituicao']?String(row['status_substituicao']):undefined};
  }
  fromTeacher(row: Record<string, unknown>): Teacher {
    const nome=String(row['nome']||'');
    return {id:String(row['id_professor']),nome,disciplinas:Array.isArray(row['disciplinas'])?row['disciplinas']:[],formacao:String(row['formacao']||'Formação não informada'),experiencia:Number(row['anos_experiencia']||0),nota:Number(row['media_avaliacoes']||0),subs:Number(row['total_substituicoes']||0),distancia:'',cidade:String(row['cidade']||''),disponivel:row['status']!=='INDISPONIVEL',verificado:false,initials:this.initials(nome),cor:'blue',bio:String(row['descricao']||''),niveis:Array.isArray(row['niveis_ensino'])?row['niveis_ensino']:[]};
  }
  private initials(nome: string) { return nome.split(' ').filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase(); }
}
