import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../../core/services/app-state.service';
import { errorMessage } from '../../../core/services/api.service';
interface Availability { dia_semana: string; horario_inicio: string; horario_fim: string; }
interface Formation { curso: string; instituicao: string; tipo_formacao: string; ano_conclusao: number | null; status: string; }
@Component({
  selector: 'app-teacher-profile', standalone: true, imports: [CommonModule, FormsModule],
  template: `
  <div class="page-content page-enter">
    <h1 class="page-title">Meu perfil</h1>
    <p class="page-sub">Complete suas disciplinas, níveis de ensino e horários para receber convites compatíveis.</p>
    @if (message()) { <p class="notice" role="status">{{message()}}</p> }
    @if (error()) { <p class="form-error" role="alert">{{error()}}</p> }
    @if (state.demo()) { <p class="notice">Entre com uma conta para editar seu perfil profissional.</p> }
    @else if (ready()) {
    <form class="card profile-form" (ngSubmit)="save()" #form="ngForm">
      <label>Nome profissional<input name="nome_profissional" [(ngModel)]="name" class="form-input" maxlength="150" /></label>
      <label>Sobre você<textarea name="descricao" [(ngModel)]="description" class="form-input" rows="3"></textarea></label>
      <div class="field-row">
        <label>Cidade<input name="cidade" [(ngModel)]="city" class="form-input" required maxlength="100" /></label>
        <label>Estado (UF)<input name="estado" [(ngModel)]="region" class="form-input" required minlength="2" maxlength="2" /></label>
        <label>Anos de experiência<input name="experiencia" type="number" [(ngModel)]="experience" class="form-input" min="0" max="100" required /></label>
      </div>
      <label>Disponibilidade geral<select name="status" [(ngModel)]="status" class="form-input"><option value="DISPONIVEL">Disponível</option><option value="INDISPONIVEL">Indisponível</option></select></label>
      <fieldset><legend>Disciplinas</legend>
        <label class="check" *ngFor="let d of state.disciplines()"><input type="checkbox" [checked]="disciplineIds.includes(d.id_disciplina!)" (change)="toggle(d.id_disciplina!, 'discipline')" />{{d.nome}}</label>
      </fieldset>
      <fieldset><legend>Níveis de ensino</legend>
        <label class="check" *ngFor="let n of state.levels()"><input type="checkbox" [checked]="levelIds.includes(n.id_nivel_ensino!)" (change)="toggle(n.id_nivel_ensino!, 'level')" />{{n.nome}}</label>
      </fieldset>
      <fieldset><legend>Horários semanais</legend>
        <div class="field-row" *ngFor="let a of availability; let i=index">
          <label>Dia<select [name]="'dia'+i" [(ngModel)]="a.dia_semana" class="form-input"><option *ngFor="let d of days" [value]="d.id">{{d.label}}</option></select></label>
          <label>Início<input [name]="'inicio'+i" type="time" [(ngModel)]="a.horario_inicio" class="form-input" required /></label>
          <label>Término<input [name]="'fim'+i" type="time" [(ngModel)]="a.horario_fim" class="form-input" required /></label>
          <button type="button" class="btn btn--danger btn--sm" (click)="availability.splice(i,1)">Remover horário</button>
        </div>
        <button type="button" class="btn btn--secondary" (click)="addAvailability()">Adicionar horário</button>
      </fieldset>
      <fieldset><legend>Formações acadêmicas</legend>
        <div class="formation" *ngFor="let f of formations; let i=index">
          <div class="field-row">
            <label>Curso<input [name]="'curso'+i" [(ngModel)]="f.curso" class="form-input" required maxlength="150" /></label>
            <label>Instituição<input [name]="'instituicao'+i" [(ngModel)]="f.instituicao" class="form-input" required maxlength="150" /></label>
          </div>
          <div class="field-row">
            <label>Tipo<select [name]="'tipo'+i" [(ngModel)]="f.tipo_formacao" class="form-input"><option *ngFor="let t of formationTypes" [value]="t.id">{{t.label}}</option></select></label>
            <label>Ano de conclusão<input [name]="'ano'+i" type="number" [(ngModel)]="f.ano_conclusao" class="form-input" min="1950" max="2100" /></label>
            <label>Situação<select [name]="'situacao'+i" [(ngModel)]="f.status" class="form-input"><option value="CONCLUIDO">Concluída</option><option value="EM_ANDAMENTO">Em andamento</option><option value="INCOMPLETO">Incompleta</option></select></label>
          </div>
          <button type="button" class="btn btn--danger btn--sm" (click)="formations.splice(i,1)">Remover formação</button>
        </div>
        <button type="button" class="btn btn--secondary" (click)="addFormation()">Adicionar formação</button>
      </fieldset>
      <button class="btn btn--primary" type="submit" [disabled]="saving() || form.invalid">{{saving() ? 'Salvando…' : 'Salvar perfil'}}</button>
    </form>
    }
  </div>`,
  styles: [`.profile-form {padding:24px;display:grid;gap:20px;margin-top:20px}label {display:grid;gap:6px;font-size:14px}.field-row {display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px}.field-row label {flex:1;min-width:130px}fieldset {border:1px solid #E2E8F0;border-radius:12px;padding:16px}legend {font-weight:600}.check {display:inline-flex;align-items:center;margin:8px 16px 8px 0}.formation {padding:12px 0;border-bottom:1px solid #E2E8F0;margin-bottom:12px}.notice {padding:12px;background:#EFF6FF;color:#1E40AF;border-radius:8px;margin-top:16px}`],
})
export class TeacherProfileComponent implements OnInit {
  ready=signal(false); saving=signal(false); message=signal(''); error=signal('');
  name='';description='';city='';region='';experience=0;status='DISPONIVEL';
  disciplineIds:number[]=[];levelIds:number[]=[];availability:Availability[]=[];formations:Formation[]=[];
  days=[{id:'DOMINGO',label:'Domingo'},{id:'SEGUNDA',label:'Segunda-feira'},{id:'TERCA',label:'Terça-feira'},{id:'QUARTA',label:'Quarta-feira'},{id:'QUINTA',label:'Quinta-feira'},{id:'SEXTA',label:'Sexta-feira'},{id:'SABADO',label:'Sábado'}];
  formationTypes=[{id:'LICENCIATURA',label:'Licenciatura'},{id:'GRADUACAO',label:'Graduação'},{id:'BACHARELADO',label:'Bacharelado'},{id:'POS_GRADUACAO',label:'Pós-graduação'},{id:'MESTRADO',label:'Mestrado'},{id:'DOUTORADO',label:'Doutorado'}];
  constructor(public state:AppStateService){}
  async ngOnInit(){
    if(this.state.demo())return;
    try{
      await this.state.refreshFromApi(); const p=this.state.profile()!;
      this.name=String(p['nome_profissional']||'');this.description=String(p['descricao']||'');this.city=String(p['cidade']||'');this.region=String(p['estado']||'');this.experience=Number(p['anos_experiencia']||0);this.status=p['status']==='INDISPONIVEL'?'INDISPONIVEL':'DISPONIVEL';
      this.disciplineIds=[...(p['disciplina_ids'] as number[])];this.levelIds=[...(p['nivel_ids'] as number[])];
      this.availability=(p['disponibilidades'] as Availability[]).map(a=>({dia_semana:a.dia_semana,horario_inicio:a.horario_inicio.slice(0,5),horario_fim:a.horario_fim.slice(0,5)}));
      this.formations=structuredClone(p['formacoes'] as Formation[]);this.ready.set(true);
    }catch(e){this.error.set(errorMessage(e));}
  }
  toggle(id:number,type:string){const items=type==='discipline'?this.disciplineIds:this.levelIds;const index=items.indexOf(id);index<0?items.push(id):items.splice(index,1);}
  addAvailability(){this.availability.push({dia_semana:'SEGUNDA',horario_inicio:'07:00',horario_fim:'12:00'});}
  addFormation(){this.formations.push({curso:'',instituicao:'',tipo_formacao:'LICENCIATURA',ano_conclusao:null,status:'CONCLUIDO'});}
  async save(){
    if(this.saving())return;this.saving.set(true);this.message.set('');this.error.set('');
    try{await this.state.saveProfile({nome_profissional:this.name,descricao:this.description,cidade:this.city,estado:this.region.toUpperCase(),anos_experiencia:this.experience,status:this.status,disciplina_ids:this.disciplineIds,nivel_ids:this.levelIds,disponibilidades:this.availability,formacoes:this.formations});this.message.set('Perfil salvo.');}
    catch(e){this.error.set(errorMessage(e));}finally{this.saving.set(false);}
  }
}
