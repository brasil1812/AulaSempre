import { useState } from "react";
import { useNavigate } from "react-router-dom";

const steps = ["Dados da aula", "Data e horário", "Requisitos", "Revisão"];

const disciplinas = ["Matemática", "Português", "Ciências", "Física", "Química", "Biologia", "História", "Geografia", "Inglês", "Educação Física", "Artes", "Filosofia", "Sociologia"];
const niveis = ["Educação Infantil", "Ensino Fundamental I", "Ensino Fundamental II", "Ensino Médio", "Ensino Superior"];
const formacoes = ["Licenciatura completa", "Bacharelado + Complementação pedagógica", "Pós-graduação na área", "Mestrado ou Doutorado"];
const experiencias = ["Qualquer experiência", "Pelo menos 1 ano", "Pelo menos 2 anos", "Pelo menos 5 anos"];

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-blue-600">Etapa {current + 1} de {total}</span>
        <span className="text-sm text-slate-400">— {steps[current]}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function CreateRequestScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    disciplina: "", nivel: "", turma: "", conteudo: "",
    data: "", horarioInicio: "", horarioFim: "", qtdAulas: "",
    formacao: "", experiencia: "", observacoes: "", valor: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const SelectField = ({ label, field, options, placeholder }: any) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <select
        value={form[field as keyof typeof form]}
        onChange={(e) => update(field, e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const InputField = ({ label, field, placeholder, type = "text", required = false }: any) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {!required && <span className="text-slate-400 font-normal">(opcional)</span>}
      </label>
      <input
        type={type}
        value={form[field as keyof typeof form]}
        onChange={(e) => update(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
      />
    </div>
  );

  const stepContent = [
    <div key="0" className="space-y-5">
      <SelectField label="Disciplina" field="disciplina" options={disciplinas} placeholder="Selecione a disciplina" />
      <SelectField label="Nível de ensino" field="nivel" options={niveis} placeholder="Selecione o nível" />
      <InputField label="Turma" field="turma" placeholder="Ex: 9º Ano A, 2º Médio B" required />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Conteúdo ou assunto da aula <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={form.conteudo}
          onChange={(e) => update("conteudo", e.target.value)}
          placeholder="Descreva o conteúdo que será abordado na aula..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
        />
      </div>
    </div>,

    <div key="1" className="space-y-5">
      <InputField label="Data da substituição" field="data" placeholder="" type="date" required />
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Horário de início" field="horarioInicio" placeholder="" type="time" required />
        <InputField label="Horário de término" field="horarioFim" placeholder="" type="time" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantidade de aulas</label>
        <div className="grid grid-cols-4 gap-3">
          {["1", "2", "3", "4"].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => update("qtdAulas", n)}
              className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                form.qtdAulas === n
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {n} {n === "1" ? "aula" : "aulas"}
            </button>
          ))}
        </div>
      </div>
    </div>,

    <div key="2" className="space-y-5">
      <SelectField label="Formação mínima exigida" field="formacao" options={formacoes} placeholder="Selecione a formação" />
      <SelectField label="Experiência desejada" field="experiencia" options={experiencias} placeholder="Selecione a experiência" />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Observações <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={form.observacoes}
          onChange={(e) => update("observacoes", e.target.value)}
          placeholder="Informações adicionais para o professor..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor da substituição (R$)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">R$</span>
          <input
            type="number"
            value={form.valor}
            onChange={(e) => update("valor", e.target.value)}
            placeholder="0,00"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>
      </div>
    </div>,

    <div key="3" className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span>📋</span> Resumo da solicitação
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Disciplina", form.disciplina || "—"],
            ["Nível", form.nivel || "—"],
            ["Turma", form.turma || "—"],
            ["Data", form.data || "—"],
            ["Horário", form.horarioInicio && form.horarioFim ? `${form.horarioInicio} – ${form.horarioFim}` : "—"],
            ["Quantidade de aulas", form.qtdAulas ? `${form.qtdAulas} aula(s)` : "—"],
            ["Formação exigida", form.formacao || "Não especificada"],
            ["Experiência", form.experiencia || "Qualquer"],
            ["Valor", form.valor ? `R$ ${form.valor}` : "A combinar"],
          ].map(([label, value]) => (
            <div key={label} className="bg-white rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-slate-800">{value}</p>
            </div>
          ))}
        </div>
        {form.conteudo && (
          <div className="mt-3 bg-white rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-0.5">Conteúdo</p>
            <p className="text-sm text-slate-700">{form.conteudo}</p>
          </div>
        )}
        {form.observacoes && (
          <div className="mt-3 bg-white rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-0.5">Observações</p>
            <p className="text-sm text-slate-700">{form.observacoes}</p>
          </div>
        )}
      </div>
      <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
        <span className="text-green-600 text-lg">✅</span>
        <div>
          <p className="text-sm font-semibold text-green-800">Tudo pronto!</p>
          <p className="text-xs text-green-600 mt-0.5">Ao publicar, notificaremos automaticamente professores compatíveis disponíveis no horário selecionado.</p>
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/dashboard")} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 4.293a1 1 0 010 1.414L7.414 8l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {step > 0 ? "Etapa anterior" : "Voltar ao Dashboard"}
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Nova solicitação</h1>
        <p className="text-slate-500 text-sm mt-1">Preencha os dados para encontrar o professor ideal</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <StepProgress current={step} total={steps.length} />

        <h2 className="text-lg font-semibold text-slate-800 mb-6">{steps[step]}</h2>

        {stepContent[step]}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-3 rounded-xl transition-all text-sm"
            >
              Voltar
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={() => navigate("/buscar")}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm hover:shadow-md text-sm flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Buscar professores disponíveis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
