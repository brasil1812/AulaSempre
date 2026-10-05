import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../store/AppContext";

const steps = ["Dados da aula", "Data e horário", "Requisitos", "Revisão"];
const disciplinas = ["Matemática", "Português", "Ciências", "Física", "Química", "Biologia", "História", "Geografia", "Inglês", "Educação Física", "Artes", "Filosofia", "Sociologia", "Outra"];
const niveis = ["Educação Infantil", "Ensino Fundamental I", "Ensino Fundamental II", "Ensino Médio", "Ensino Superior"];
const formacoes = ["Qualquer licenciatura", "Licenciatura completa na área", "Pós-graduação na área", "Mestrado ou Doutorado"];
const experiencias = ["Qualquer experiência", "Pelo menos 1 ano", "Pelo menos 2 anos", "Pelo menos 5 anos"];

type Form = {
  disciplina: string; nivel: string; turma: string; conteudo: string;
  data: string; horarioInicio: string; horarioFim: string;
  modalidade: "presencial" | "online"; cidade: string; endereco: string;
  formacao: string; experiencia: string; observacoes: string; valor: string;
};

type Errors = Partial<Record<keyof Form, string>>;

function validate(step: number, form: Form): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!form.disciplina) e.disciplina = "Selecione a disciplina";
    if (!form.nivel) e.nivel = "Selecione o nível de ensino";
  }
  if (step === 1) {
    if (!form.data) { e.data = "Informe a data"; }
    else {
      const d = new Date(form.data + "T00:00:00");
      const today = new Date(); today.setHours(0,0,0,0);
      if (d < today) e.data = "A data não pode ser no passado";
    }
    if (!form.horarioInicio) e.horarioInicio = "Informe o horário de início";
    if (!form.horarioFim) e.horarioFim = "Informe o horário de término";
    if (form.horarioInicio && form.horarioFim && form.horarioInicio >= form.horarioFim)
      e.horarioFim = "O término deve ser após o início";
    if (form.modalidade === "presencial" && !form.cidade) e.cidade = "Informe a cidade";
  }
  if (step === 2) {
    if (!form.valor) { e.valor = "Informe o valor"; }
    else if (parseFloat(form.valor) < 0) e.valor = "O valor não pode ser negativo";
  }
  return e;
}

export default function CreateRequest() {
  const navigate = useNavigate();
  const { createRequest, currentInstitution } = useApp();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<Form>({
    disciplina: "", nivel: "", turma: "", conteudo: "",
    data: "", horarioInicio: "", horarioFim: "",
    modalidade: "presencial", cidade: "São Paulo", endereco: "",
    formacao: "", experiencia: "", observacoes: "", valor: "",
  });

  const set = (k: keyof Form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const next = () => {
    const errs = validate(step, form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const submit = () => {
    const errs = validate(2, form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    createRequest({ ...form, instituicaoNome: currentInstitution.nome });
    setSubmitted(true);
  };

  const Field = ({ label, id, error, required = false, children }: any) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {!required && <span className="text-slate-400 font-normal text-xs">(opcional)</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );

  const inputCls = (err?: string) =>
    `w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${err ? "border-red-400 bg-red-50" : "border-slate-200"}`;

  if (submitted) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">✅</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Solicitação criada!</h2>
          <p className="text-slate-500 text-sm mb-8">
            Sua solicitação foi publicada. Agora você pode buscar professores compatíveis e enviar convites.
          </p>
          <div className="space-y-3">
            <button onClick={() => navigate("/instituicao/professores")} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-all">
              Buscar professores agora
            </button>
            <button onClick={() => navigate("/instituicao/solicitacoes")} className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-3 rounded-xl text-sm transition-all">
              Ver minhas solicitações
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fmt = (data: string) => data ? new Date(data + "T00:00:00").toLocaleDateString("pt-BR") : "—";

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/instituicao")} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M9.707 4.293a1 1 0 010 1.414L7.414 8l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          {step > 0 ? "Etapa anterior" : "Voltar"}
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Solicitar substituição</h1>
        <p className="text-slate-500 text-sm mt-1">Etapa {step + 1} de {steps.length} — {steps[step]}</p>
      </div>

      <div className="mb-5">
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((s, i) => (
            <span key={s} className={`text-xs font-medium ${i === step ? "text-blue-600" : i < step ? "text-green-500" : "text-slate-400"}`}>{s}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        {step === 0 && (
          <div className="space-y-5">
            <Field label="Disciplina" id="disciplina" error={errors.disciplina} required>
              <select id="disciplina" value={form.disciplina} onChange={(e) => set("disciplina", e.target.value)} className={inputCls(errors.disciplina)}>
                <option value="">Selecione a disciplina</option>
                {disciplinas.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Nível de ensino ou curso" id="nivel" error={errors.nivel} required>
              <select id="nivel" value={form.nivel} onChange={(e) => set("nivel", e.target.value)} className={inputCls(errors.nivel)}>
                <option value="">Selecione o nível</option>
                {niveis.map((n) => <option key={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Turma" id="turma" error={errors.turma}>
              <input id="turma" value={form.turma} onChange={(e) => set("turma", e.target.value)} placeholder="Ex: 9º Ano A, 2º Médio B, Turma 301" className={inputCls()} />
            </Field>
            <Field label="Conteúdo ou assunto da aula" id="conteudo" error={errors.conteudo}>
              <textarea id="conteudo" value={form.conteudo} onChange={(e) => set("conteudo", e.target.value)} placeholder="Descreva o conteúdo que será abordado..." rows={3} className={inputCls() + " resize-none"} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <Field label="Data" id="data" error={errors.data} required>
              <input id="data" type="date" value={form.data} onChange={(e) => set("data", e.target.value)} className={inputCls(errors.data)} min={new Date().toISOString().split("T")[0]} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Horário de início" id="horarioInicio" error={errors.horarioInicio} required>
                <input id="horarioInicio" type="time" value={form.horarioInicio} onChange={(e) => set("horarioInicio", e.target.value)} className={inputCls(errors.horarioInicio)} />
              </Field>
              <Field label="Horário de término" id="horarioFim" error={errors.horarioFim} required>
                <input id="horarioFim" type="time" value={form.horarioFim} onChange={(e) => set("horarioFim", e.target.value)} className={inputCls(errors.horarioFim)} />
              </Field>
            </div>
            <Field label="Modalidade" id="modalidade" error={errors.modalidade} required>
              <div className="grid grid-cols-2 gap-3">
                {(["presencial", "online"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => set("modalidade", m)}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${form.modalidade === m ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                    {m === "presencial" ? "🏫 Presencial" : "💻 Online"}
                  </button>
                ))}
              </div>
            </Field>
            {form.modalidade === "presencial" && (
              <>
                <Field label="Cidade" id="cidade" error={errors.cidade} required>
                  <input id="cidade" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} placeholder="Ex: São Paulo" className={inputCls(errors.cidade)} />
                </Field>
                <Field label="Endereço" id="endereco" error={errors.endereco}>
                  <input id="endereco" value={form.endereco} onChange={(e) => set("endereco", e.target.value)} placeholder="Rua, número – bairro" className={inputCls()} />
                </Field>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="Valor oferecido (R$)" id="valor" error={errors.valor} required>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">R$</span>
                <input id="valor" type="number" min="0" step="10" value={form.valor} onChange={(e) => set("valor", e.target.value)} placeholder="0,00" className={inputCls(errors.valor) + " pl-10"} />
              </div>
            </Field>
            <Field label="Formação mínima" id="formacao" error={errors.formacao}>
              <select id="formacao" value={form.formacao} onChange={(e) => set("formacao", e.target.value)} className={inputCls()}>
                <option value="">Selecione (opcional)</option>
                {formacoes.map((f) => <option key={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Experiência desejada" id="experiencia" error={errors.experiencia}>
              <select id="experiencia" value={form.experiencia} onChange={(e) => set("experiencia", e.target.value)} className={inputCls()}>
                <option value="">Selecione (opcional)</option>
                {experiencias.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Observações" id="observacoes" error={errors.observacoes}>
              <textarea id="observacoes" value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Informações adicionais para o professor..." rows={3} className={inputCls() + " resize-none"} />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h3 className="font-semibold text-slate-800 mb-4">📋 Revisão da solicitação</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Disciplina", form.disciplina || "—"],
                  ["Nível", form.nivel || "—"],
                  ["Turma", form.turma || "Não informada"],
                  ["Data", fmt(form.data)],
                  ["Horário", form.horarioInicio && form.horarioFim ? `${form.horarioInicio} – ${form.horarioFim}` : "—"],
                  ["Modalidade", form.modalidade],
                  ...(form.modalidade === "presencial" ? [["Cidade", form.cidade || "—"], ["Endereço", form.endereco || "Não informado"]] as [string,string][] : []),
                  ["Valor", form.valor ? `R$ ${form.valor}` : "A combinar"],
                  ["Formação exigida", form.formacao || "Qualquer"],
                  ["Experiência", form.experiencia || "Qualquer"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-slate-800 capitalize">{value}</p>
                  </div>
                ))}
              </div>
              {form.observacoes && (
                <div className="mt-3 bg-white rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">Observações</p>
                  <p className="text-sm text-slate-700">{form.observacoes}</p>
                </div>
              )}
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3">
              <span className="text-green-600 text-lg">✅</span>
              <div>
                <p className="text-sm font-semibold text-green-800">Tudo certo!</p>
                <p className="text-xs text-green-600 mt-0.5">Ao publicar, você poderá buscar professores e enviar convites.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-3 rounded-xl transition-all text-sm">
              Voltar
            </button>
          )}
          {step < 3 ? (
            <button onClick={next} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all text-sm">
              Continuar
            </button>
          ) : (
            <button onClick={submit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm text-sm">
              Publicar solicitação
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
