import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppStateService } from '../../../core/services/app-state.service';
import { errorMessage } from '../../../core/services/api.service';

const STEPS = ['Dados da aula', 'Data e horário', 'Requisitos', 'Revisão'];
const FORMACOES = ['Qualquer licenciatura','Licenciatura completa na área','Pós-graduação na área','Mestrado ou Doutorado'];
const EXPERIENCIAS = ['Qualquer experiência','Pelo menos 1 ano','Pelo menos 2 anos','Pelo menos 5 anos'];

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="page-content page-enter">

  @if (submitted()) {
    <!-- Success state -->
    <div class="success-wrap">
      <div class="success-card">
        <div class="success-icon">✅</div>
        <h2 class="success-title">Solicitação criada!</h2>
        <p class="success-desc">Sua solicitação foi publicada. Agora você pode buscar professores compatíveis e enviar convites.</p>
        <div class="success-actions">
          <button class="btn btn--primary btn--block" (click)="go('/instituicao/professores')">Buscar professores agora</button>
          <button class="btn btn--secondary btn--block" (click)="go('/instituicao/solicitacoes')">Ver minhas solicitações</button>
        </div>
      </div>
    </div>
  } @else {

    <!-- Header -->
    <div class="wizard-header">
      <button class="back-btn" (click)="stepBack()">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M9.707 4.293a1 1 0 010 1.414L7.414 8l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
        {{step() > 0 ? 'Etapa anterior' : 'Voltar'}}
      </button>
      <h1 class="wizard-title">Solicitar substituição</h1>
      <p class="wizard-sub">Etapa {{step()+1}} de {{steps.length}} — {{steps[step()]}}</p>
    </div>

    <!-- Progress -->
    <div class="progress-wrap">
      <div class="progress-bar">
        <div class="progress-bar__fill" [style.width.%]="((step()+1)/steps.length)*100"></div>
      </div>
      <div class="progress-labels">
        <span *ngFor="let s of steps; let i=index"
          [class.active]="i===step()"
          [class.done]="i<step()">{{s}}</span>
      </div>
    </div>

    <!-- Form card -->
    <div class="card form-card">

      <!-- Step 0: Dados da aula -->
      @if (step() === 0) {
        <form [formGroup]="step0Form" class="form-fields">
          <div class="field">
            <label class="form-label">Disciplina *</label>
            <select formControlName="disciplina" class="form-input" [class.is-error]="err0('disciplina')">
              <option value="">Selecione a disciplina</option>
              <option *ngFor="let d of disciplinas">{{d}}</option>
            </select>
            @if (err0('disciplina')) { <p class="form-error">Selecione a disciplina</p> }
          </div>
          <div class="field">
            <label class="form-label">Nível de ensino *</label>
            <select formControlName="nivel" class="form-input" [class.is-error]="err0('nivel')">
              <option value="">Selecione o nível</option>
              <option *ngFor="let n of niveis">{{n}}</option>
            </select>
            @if (err0('nivel')) { <p class="form-error">Selecione o nível de ensino</p> }
          </div>
          <div class="field">
            <label class="form-label">Turma <span class="opt">(opcional)</span></label>
            <input formControlName="turma" class="form-input" placeholder="Ex: 9º Ano A, 2º Médio B" />
          </div>
          <div class="field">
            <label class="form-label">Conteúdo da aula <span class="opt">(opcional)</span></label>
            <textarea formControlName="conteudo" class="form-input" rows="3" placeholder="Descreva o conteúdo que será abordado..."></textarea>
          </div>
        </form>
      }

      <!-- Step 1: Data e horário -->
      @if (step() === 1) {
        <form [formGroup]="step1Form" class="form-fields">
          <div class="field">
            <label class="form-label">Data *</label>
            <input formControlName="data" type="date" class="form-input" [class.is-error]="err1('data')" [min]="today" />
            @if (err1('data')) { <p class="form-error">Informe uma data futura</p> }
          </div>
          <div class="field-row">
            <div class="field">
              <label class="form-label">Início *</label>
              <input formControlName="horarioInicio" type="time" class="form-input" [class.is-error]="err1('horarioInicio')" />
            </div>
            <div class="field">
              <label class="form-label">Término *</label>
              <input formControlName="horarioFim" type="time" class="form-input" [class.is-error]="err1('horarioFim')" />
            </div>
          </div>
          <div class="field">
            <label class="form-label">Modalidade *</label>
            <div class="toggle-group">
              <button type="button" class="toggle-btn" [class.active]="step1Form.get('modalidade')?.value==='presencial'" (click)="step1Form.get('modalidade')?.setValue('presencial')">🏫 Presencial</button>
              <button type="button" class="toggle-btn" [class.active]="step1Form.get('modalidade')?.value==='online'" (click)="step1Form.get('modalidade')?.setValue('online')">💻 Online</button>
            </div>
          </div>
          @if (step1Form.get('modalidade')?.value === 'presencial') {
            <div class="field">
              <label class="form-label">Cidade *</label>
              <input formControlName="cidade" class="form-input" [class.is-error]="err1('cidade')" placeholder="Ex: São Paulo" />
            </div>
            <div class="field">
              <label class="form-label">Endereço <span class="opt">(opcional)</span></label>
              <input formControlName="endereco" class="form-input" placeholder="Rua, número – bairro" />
            </div>
          }
        </form>
      }

      <!-- Step 2: Requisitos -->
      @if (step() === 2) {
        <form [formGroup]="step2Form" class="form-fields">
          <div class="field">
            <label class="form-label">Valor oferecido (R$) *</label>
            <div class="input-prefix">
              <span>R$</span>
              <input formControlName="valor" type="number" min="0" step="10" class="form-input" [class.is-error]="err2('valor')" placeholder="0,00" />
            </div>
            @if (err2('valor')) { <p class="form-error">Informe o valor oferecido</p> }
          </div>
          <div class="field">
            <label class="form-label">Formação mínima <span class="opt">(opcional)</span></label>
            <select formControlName="formacao" class="form-input">
              <option value="">Selecione (opcional)</option>
              <option *ngFor="let f of formacoes">{{f}}</option>
            </select>
          </div>
          <div class="field">
            <label class="form-label">Experiência desejada <span class="opt">(opcional)</span></label>
            <select formControlName="experiencia" class="form-input">
              <option value="">Selecione (opcional)</option>
              <option *ngFor="let e of experiencias">{{e}}</option>
            </select>
          </div>
          <div class="field">
            <label class="form-label">Observações <span class="opt">(opcional)</span></label>
            <textarea formControlName="observacoes" class="form-input" rows="3" placeholder="Informações adicionais para o professor..."></textarea>
          </div>
        </form>
      }

      <!-- Step 3: Revisão -->
      @if (step() === 3) {
        <div class="review">
          <div class="review__header">📋 Revisão da solicitação</div>
          <div class="review__grid">
            <div class="review__item" *ngFor="let item of reviewItems">
              <p class="review__key">{{item[0]}}</p>
              <p class="review__val">{{item[1]}}</p>
            </div>
          </div>
          @if (step2Form.get('observacoes')?.value) {
            <div class="review__obs">
              <p class="review__key">Observações</p>
              <p class="review__val">{{step2Form.get('observacoes')?.value}}</p>
            </div>
          }
          <div class="review__ok">
            <span>✅</span>
            <div>
              <p style="font-size:14px;font-weight:600;color:#065F46">Tudo certo!</p>
              <p style="font-size:12px;color:#16A34A;margin-top:2px">Ao publicar, você poderá buscar professores e enviar convites.</p>
            </div>
          </div>
        </div>
      }

      <!-- Navigation buttons -->
      @if (error()) { <p class="form-error" role="alert">{{error()}}</p> }
      <div class="wizard-btns">
        @if (step() > 0) {
          <button class="btn btn--secondary" (click)="prev()">Voltar</button>
        }
        @if (step() < 3) {
          <button class="btn btn--primary" style="flex:1" (click)="next()">Continuar</button>
        } @else {
          <button class="btn btn--primary" style="flex:1" [disabled]="saving()" (click)="submit()">{{saving() ? 'Publicando…' : 'Publicar solicitação'}}</button>
        }
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    .success-wrap { display: flex; justify-content: center; padding: 40px 0; }
    .success-card { background:#fff; border:1px solid #E2E8F0; border-radius:20px; padding:48px 40px; text-align:center; max-width:440px; width:100%; box-shadow:0 4px 16px rgba(0,0,0,.07); }
    .success-icon { font-size:52px; margin-bottom:16px; }
    .success-title { font-size:22px; font-weight:700; color:#0F172A; margin-bottom:8px; }
    .success-desc { font-size:14px; color:#64748B; margin-bottom:28px; line-height:1.6; }
    .success-actions { display:flex; flex-direction:column; gap:10px; }
    .wizard-header { margin-bottom:20px; }
    .back-btn { display:flex; align-items:center; gap:6px; font-size:13px; color:#64748B; margin-bottom:10px; &:hover{color:#334155;} }
    .wizard-title { font-size:22px; font-weight:700; color:#0F172A; }
    .wizard-sub { font-size:13px; color:#94A3B8; margin-top:2px; }
    .progress-wrap { margin-bottom:24px; }
    .progress-bar { height:6px; background:#E2E8F0; border-radius:9999px; overflow:hidden; margin-bottom:8px; }
    .progress-bar__fill { height:100%; background:#2563EB; border-radius:9999px; transition:width .4s ease; }
    .progress-labels { display:flex; justify-content:space-between;
      span { font-size:11px; font-weight:500; color:#CBD5E1;
        &.active { color:#2563EB; }
        &.done { color:#22C55E; }
      }
    }
    .form-card { padding:32px; }
    .form-fields { display:flex; flex-direction:column; gap:20px; }
    .field { display:flex; flex-direction:column; }
    .field-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .opt { color:#94A3B8; font-size:12px; font-weight:400; }
    .toggle-group { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .toggle-btn {
      padding:11px; border-radius:12px; border:2px solid #E2E8F0;
      font-size:14px; font-weight:600; color:#64748B; transition:all .15s;
      &:hover { border-color:#93C5FD; }
      &.active { border-color:#2563EB; background:#EFF6FF; color:#1D4ED8; }
    }
    .input-prefix { position:relative;
      span { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:14px; color:#64748B; font-weight:500; }
      input { padding-left:36px; }
    }
    .wizard-btns { display:flex; gap:12px; margin-top:28px; }
    .review { }
    .review__header { font-size:15px; font-weight:700; color:#0F172A; margin-bottom:16px; }
    .review__grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
    .review__item, .review__obs { background:#F8FAFC; border-radius:10px; padding:12px; }
    .review__obs { margin-bottom:12px; }
    .review__key { font-size:11px; color:#94A3B8; margin-bottom:2px; }
    .review__val { font-size:13px; font-weight:600; color:#0F172A; text-transform:capitalize; }
    .review__ok { background:#F0FDF4; border:1px solid #BBF7D0; border-radius:12px; padding:14px 16px; display:flex; gap:12px; align-items:flex-start; }
  `],
})
export class CreateRequestComponent {
  steps = STEPS;
  get disciplinas() { return this.appState.disciplines().map(item => item.nome); }
  get niveis() { return this.appState.levels().map(item => item.nome); }
  formacoes = FORMACOES;
  experiencias = EXPERIENCIAS;

  step = signal(0);
  submitted = signal(false);
  saving = signal(false);
  error = signal('');
  touched0 = signal(false);
  touched1 = signal(false);
  touched2 = signal(false);

  step0Form: FormGroup;
  step1Form: FormGroup;
  step2Form: FormGroup;

  get today() { return new Intl.DateTimeFormat('en-CA', {timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }

  constructor(private fb: FormBuilder, private router: Router, private appState: AppStateService) {
    this.step0Form = this.fb.group({
      disciplina: ['', Validators.required],
      nivel: ['', Validators.required],
      turma: [''],
      conteudo: [''],
    });
    this.step1Form = this.fb.group({
      data: ['', Validators.required],
      horarioInicio: ['', Validators.required],
      horarioFim: ['', Validators.required],
      modalidade: ['presencial'],
      cidade: ['São Paulo'],
      endereco: [''],
    });
    this.step2Form = this.fb.group({
      valor: ['', [Validators.required, Validators.min(0), Validators.max(99999999.99)]],
      formacao: [''],
      experiencia: [''],
      observacoes: [''],
    });
  }

  err0(f: string) { return this.touched0() && this.step0Form.get(f)?.invalid; }
  err1(f: string) { return this.touched1() && this.step1Form.get(f)?.invalid; }
  err2(f: string) { return this.touched2() && this.step2Form.get(f)?.invalid; }

  next() {
    this.error.set('');
    if (this.step() === 0) {
      this.touched0.set(true);
      if (this.step0Form.invalid) return;
    } else if (this.step() === 1) {
      this.touched1.set(true);
      if (this.step1Form.invalid) return;
      if (!this.validSchedule()) return;
    } else if (this.step() === 2) {
      this.touched2.set(true);
      if (this.step2Form.invalid) return;
    }
    this.step.update(s => s + 1);
  }

  prev() { this.step.update(s => s - 1); }
  stepBack() { this.step() > 0 ? this.prev() : this.go('/instituicao'); }

  private validSchedule(): boolean {
    const value = this.step1Form.value;
    if (value.data < this.today) { this.error.set('A data não pode estar no passado.'); return false; }
    if (value.horarioFim <= value.horarioInicio) { this.error.set('O término deve ser posterior ao início.'); return false; }
    if (value.modalidade === 'presencial' && !value.cidade?.trim()) { this.error.set('Informe a cidade da aula.'); return false; }
    return true;
  }

  async submit() {
    if (this.saving()) return;
    this.touched2.set(true);
    if (this.step0Form.invalid || this.step1Form.invalid || this.step2Form.invalid || !this.validSchedule()) return;
    this.saving.set(true); this.error.set('');
    const s0 = this.step0Form.value;
    const s1 = this.step1Form.value;
    const s2 = this.step2Form.value;
    try {
    await this.appState.createRequest({
      disciplina: s0.disciplina, nivel: s0.nivel, turma: s0.turma, observacoes: s2.observacoes, conteudo: s0.conteudo,
      data: s1.data, horarioInicio: s1.horarioInicio, horarioFim: s1.horarioFim,
      modalidade: s1.modalidade, cidade: s1.cidade, endereco: s1.endereco,
      valor: s2.valor, instituicaoNome: this.appState.currentInstitution.nome,
      formacaoMinima: s2.formacao,
      experienciaMinima: s2.experiencia.includes('5 anos') ? 5 : s2.experiencia.includes('2 anos') ? 2 : s2.experiencia.includes('1 ano') ? 1 : 0,
    });
    this.submitted.set(true);
    } catch (error) { this.error.set(errorMessage(error)); }
    finally { this.saving.set(false); }
  }

  get reviewItems(): [string, string][] {
    const s0 = this.step0Form.value;
    const s1 = this.step1Form.value;
    const s2 = this.step2Form.value;
    const fmtDate = (d: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
    return [
      ['Disciplina', s0.disciplina || '—'],
      ['Nível', s0.nivel || '—'],
      ['Turma', s0.turma || 'Não informada'],
      ['Data', fmtDate(s1.data)],
      ['Horário', s1.horarioInicio && s1.horarioFim ? `${s1.horarioInicio} – ${s1.horarioFim}` : '—'],
      ['Modalidade', s1.modalidade],
      ...(s1.modalidade === 'presencial' ? [['Cidade', s1.cidade || '—'] as [string,string]] : []),
      ['Valor', s2.valor ? `R$ ${s2.valor}` : 'A combinar'],
      ['Formação exigida', s2.formacao || 'Qualquer'],
      ['Experiência', s2.experiencia || 'Qualquer'],
    ];
  }

  go(path: string) { this.router.navigateByUrl(path); }
}
