import { useState } from "react"
import { useNavigate } from "react-router-dom"

const steps = ["Instituição", "Endereço", "Responsável", "Acesso"]

export default function RegisterScreen() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    cidade: "",
    estado: "",
    responsavel: "",
    cargo: "",
    telefone: "",
    email: "",
    senha: "",
    confirmSenha: "",
  })

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const Input = ({ label, field, placeholder, type = "text" }: any) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={form[(field as keyof typeof form)]}
        onChange={(e) => update(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
      />
    </div>
  )

  const stepContent = [
    <div key="0" className="space-y-4">
      <Input
        label="Nome da instituição"
        field="nome"
        placeholder="Colégio Exemplo"
      />
      <Input label="CNPJ" field="cnpj" placeholder="00.000.000/0001-00" />
    </div>,
    <div key="1" className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="CEP" field="cep" placeholder="00000-000" />
        <Input label="Número" field="numero" placeholder="123" />
      </div>
      <Input
        label="Rua / Avenida"
        field="rua"
        placeholder="Rua das Palmeiras"
      />
      <Input
        label="Complemento (opcional)"
        field="complemento"
        placeholder="Bloco A, Sala 2"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Cidade" field="cidade" placeholder="São Paulo" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Estado
          </label>
          <select
            value={form.estado}
            onChange={(e) => update("estado", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          >
            <option value="">Selecione</option>
            {["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "GO"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </div>,
    <div key="2" className="space-y-4">
      <Input
        label="Nome do responsável"
        field="responsavel"
        placeholder="Mariana Costa"
      />
      <Input
        label="Cargo"
        field="cargo"
        placeholder="Coordenadora Pedagógica"
      />
      <Input label="Telefone" field="telefone" placeholder="(11) 99999-9999" />
    </div>,
    <div key="3" className="space-y-4">
      <Input
        label="E-mail institucional"
        field="email"
        placeholder="contato@escola.edu.br"
        type="email"
      />
      <Input
        label="Senha"
        field="senha"
        placeholder="Mínimo 8 caracteres"
        type="password"
      />
      <Input
        label="Confirmar senha"
        field="confirmSenha"
        placeholder="Repita a senha"
        type="password"
      />
      <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
        <input type="checkbox" className="mt-0.5 accent-blue-600" />
        <p className="text-xs text-slate-500">
          Concordo com os{" "}
          <span className="text-blue-600 font-medium cursor-pointer">
            Termos de Uso
          </span>{" "}
          e a{" "}
          <span className="text-blue-600 font-medium cursor-pointer">
            Política de Privacidade
          </span>{" "}
          da plataforma.
        </p>
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-slate-800">AulaSempre</span>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-1">
          Cadastrar instituição
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Preencha os dados abaixo para criar sua conta
        </p>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    i < step
                      ? "bg-green-500 text-white"
                      : i === step
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-12 sm:w-16 transition-all ${
                      i < step ? "bg-green-400" : "bg-slate-100"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {steps.map((s, i) => (
              <span
                key={s}
                className={`text-xs font-medium ${
                  i === step
                    ? "text-blue-600"
                    : i < step
                      ? "text-green-500"
                      : "text-slate-400"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-8">{stepContent[step]}</div>

        <div className="flex gap-3">
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
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              Criar conta
            </button>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Já tem conta?{" "}
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 font-medium hover:underline"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  )
}
