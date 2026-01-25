"use client"

import React from "react"
import { useState, useRef } from "react"
import { FileJson, Download, Printer, RotateCcw, Upload, CheckCircle2, FileText, Users, Building2, Euro, Calendar, Scale, FileCheck } from "lucide-react"

interface FormData {
  contract_type: string
  datum_contract: string
  verhuurder_naam: string
  verhuurder_adres: string
  verhuurder_telefoon: string
  verhuurder_email: string
  huurder_naam: string
  huurder_adres: string
  huurder_telefoon: string
  huurder_email: string
  pand_adres: string
  pand_type: string
  pand_oppervlakte: string
  pand_kamers: string
  pand_verdieping: string
  pand_epc: string
  pand_epc_nummer: string
  kadaster_afdeling: string
  kadaster_sectie: string
  kadaster_nummer: string
  kadaster_inkomen: string
  huurprijs: string
  waarborg_bedrag: string
  waarborg_locatie: string
  kosten: string
  indexatie: string
  ingangsdatum: string
  einddatum: string
  duur: string
  opzegtermijn: string
  huisdieren: string
  onderverhuur: string
  werken: string
  toepasselijk_recht: string
  bevoegde_rechtbank: string
  summary: string
}

const initialFormData: FormData = {
  contract_type: "",
  datum_contract: "",
  verhuurder_naam: "",
  verhuurder_adres: "",
  verhuurder_telefoon: "",
  verhuurder_email: "",
  huurder_naam: "",
  huurder_adres: "",
  huurder_telefoon: "",
  huurder_email: "",
  pand_adres: "",
  pand_type: "",
  pand_oppervlakte: "",
  pand_kamers: "",
  pand_verdieping: "",
  pand_epc: "",
  pand_epc_nummer: "",
  kadaster_afdeling: "",
  kadaster_sectie: "",
  kadaster_nummer: "",
  kadaster_inkomen: "",
  huurprijs: "",
  waarborg_bedrag: "",
  waarborg_locatie: "",
  kosten: "",
  indexatie: "",
  ingangsdatum: "",
  einddatum: "",
  duur: "",
  opzegtermijn: "",
  huisdieren: "",
  onderverhuur: "",
  werken: "",
  toepasselijk_recht: "",
  bevoegde_rechtbank: "",
  summary: "",
}

function get(obj: Record<string, unknown> | undefined | null, path: string, defaultValue = ""): string {
  if (!obj) return defaultValue
  const keys = path.split(".")
  let result: unknown = obj
  for (const key of keys) {
    if (result === undefined || result === null) return defaultValue
    result = (result as Record<string, unknown>)[key]
  }
  return result === undefined || result === null ? defaultValue : String(result)
}

export default function ContractDataViewer() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [status, setStatus] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [validation, setValidation] = useState<{ is_valid: boolean; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const loadData = (json: Record<string, unknown>) => {
    const data = (json.contract_data || json.data || json.extracted_data || json) as Record<string, unknown>

    if (json.validation) {
      setValidation(json.validation as { is_valid: boolean; message: string })
    } else {
      setValidation(null)
    }

    const partijen = (data.partijen || {}) as Record<string, unknown>
    const verhuurder = (partijen.verhuurder || {}) as Record<string, unknown>
    const huurder = (partijen.huurder || {}) as Record<string, unknown>
    const pand = (data.pand || {}) as Record<string, unknown>
    const epc = pand.epc as Record<string, unknown> | string | undefined
    const kadaster = (pand.kadaster || {}) as Record<string, unknown>
    const financieel = (data.financieel || {}) as Record<string, unknown>
    const waarborg = financieel.waarborg as Record<string, unknown> | string | undefined
    const periodes = (data.periodes || {}) as Record<string, unknown>
    const voorwaarden = (data.voorwaarden || {}) as Record<string, unknown>
    const juridisch = (data.juridisch || {}) as Record<string, unknown>

    const indexatieValue = financieel.indexatie
    let indexatieStr = ""
    if (indexatieValue === true) indexatieStr = "Ja"
    else if (indexatieValue === false) indexatieStr = "Nee"
    else indexatieStr = get(financieel, "indexatie")

    const huisdierenValue = voorwaarden.huisdieren
    let huisdierenStr = ""
    if (huisdierenValue === true) huisdierenStr = "Toegestaan"
    else if (huisdierenValue === false) huisdierenStr = "Niet toegestaan"
    else huisdierenStr = get(voorwaarden, "huisdieren")

    const onderverhuurValue = voorwaarden.onderverhuur
    let onderverhuurStr = ""
    if (onderverhuurValue === true) onderverhuurStr = "Toegestaan"
    else if (onderverhuurValue === false) onderverhuurStr = "Niet toegestaan"
    else onderverhuurStr = get(voorwaarden, "onderverhuur")

    setFormData({
      contract_type: get(data, "contract_type"),
      datum_contract: get(data, "datum_contract"),
      verhuurder_naam: get(verhuurder, "naam"),
      verhuurder_adres: get(verhuurder, "adres"),
      verhuurder_telefoon: get(verhuurder, "telefoon"),
      verhuurder_email: get(verhuurder, "email"),
      huurder_naam: get(huurder, "naam"),
      huurder_adres: get(huurder, "adres"),
      huurder_telefoon: get(huurder, "telefoon"),
      huurder_email: get(huurder, "email"),
      pand_adres: get(pand, "adres"),
      pand_type: get(pand, "type"),
      pand_oppervlakte: get(pand, "oppervlakte"),
      pand_kamers: get(pand, "aantal_kamers"),
      pand_verdieping: get(pand, "verdieping"),
      pand_epc: typeof epc === "object" ? get(epc, "energielabel") : String(epc || ""),
      pand_epc_nummer: typeof epc === "object" ? get(epc, "certificaatnummer") : "",
      kadaster_afdeling: get(kadaster, "afdeling"),
      kadaster_sectie: get(kadaster, "sectie"),
      kadaster_nummer: get(kadaster, "nummer"),
      kadaster_inkomen: get(kadaster, "kadastraal_inkomen"),
      huurprijs: get(financieel, "huurprijs"),
      waarborg_bedrag: typeof waarborg === "object" ? get(waarborg, "bedrag") : String(waarborg || ""),
      waarborg_locatie: typeof waarborg === "object" ? get(waarborg, "waar_gedeponeerd") : "",
      kosten: get(financieel, "kosten"),
      indexatie: indexatieStr,
      ingangsdatum: get(periodes, "ingangsdatum"),
      einddatum: get(periodes, "einddatum") || "Onbepaalde duur",
      duur: get(periodes, "duur"),
      opzegtermijn: get(periodes, "opzegtermijn"),
      huisdieren: huisdierenStr,
      onderverhuur: onderverhuurStr,
      werken: get(voorwaarden, "werken"),
      toepasselijk_recht: get(juridisch, "toepasselijk_recht"),
      bevoegde_rechtbank: get(juridisch, "bevoegde_rechtbank"),
      summary: get(json, "summary"),
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".json")) {
      setStatus({ message: "Selecteer een geldig JSON bestand", type: "error" })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        loadData(json)
        setStatus({ message: "Bestand succesvol geladen", type: "success" })
        setFileName(file.name)
      } catch (error) {
        setStatus({ message: "Fout bij laden JSON: " + (error as Error).message, type: "error" })
      }
    }
    reader.readAsText(file)
  }

  const handleLoadFile = () => {
    fileInputRef.current?.click()
  }

  const handleClearForm = () => {
    if (!confirm("Weet je zeker dat je alle velden wilt legen?")) return
    setFormData(initialFormData)
    setStatus(null)
    setFileName(null)
    setValidation(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleExport = () => {
    const exportData = {
      contract_data: {
        contract_type: formData.contract_type,
        datum_contract: formData.datum_contract,
        partijen: {
          verhuurder: {
            naam: formData.verhuurder_naam,
            adres: formData.verhuurder_adres,
            telefoon: formData.verhuurder_telefoon,
            email: formData.verhuurder_email,
          },
          huurder: {
            naam: formData.huurder_naam,
            adres: formData.huurder_adres,
            telefoon: formData.huurder_telefoon,
            email: formData.huurder_email,
          },
        },
        pand: {
          adres: formData.pand_adres,
          type: formData.pand_type,
          oppervlakte: formData.pand_oppervlakte,
          aantal_kamers: formData.pand_kamers,
          verdieping: formData.pand_verdieping,
          epc: {
            energielabel: formData.pand_epc,
            certificaatnummer: formData.pand_epc_nummer,
          },
          kadaster: {
            afdeling: formData.kadaster_afdeling,
            sectie: formData.kadaster_sectie,
            nummer: formData.kadaster_nummer,
            kadastraal_inkomen: formData.kadaster_inkomen,
          },
        },
        financieel: {
          huurprijs: formData.huurprijs,
          waarborg: {
            bedrag: formData.waarborg_bedrag,
            waar_gedeponeerd: formData.waarborg_locatie,
          },
          kosten: formData.kosten,
          indexatie: formData.indexatie,
        },
        periodes: {
          ingangsdatum: formData.ingangsdatum,
          einddatum: formData.einddatum,
          duur: formData.duur,
          opzegtermijn: formData.opzegtermijn,
        },
        voorwaarden: {
          huisdieren: formData.huisdieren,
          onderverhuur: formData.onderverhuur,
          werken: formData.werken,
        },
        juridisch: {
          toepasselijk_recht: formData.toepasselijk_recht,
          bevoegde_rechtbank: formData.bevoegde_rechtbank,
        },
      },
      summary: formData.summary,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contract_data.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const inputClass =
    "w-full bg-muted border border-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <FileJson className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Contract Data Viewer</h1>
                <p className="text-xs text-muted-foreground">Importeer en beheer contractgegevens</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 print:hidden">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={handleLoadFile}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Laad JSON</span>
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                onClick={handleClearForm}
                className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {status && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-lg border p-4 ${
              status.type === "success"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            ) : (
              <FileJson className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{status.message}</span>
            {fileName && status.type === "success" && (
              <span className="ml-auto text-xs text-muted-foreground">{fileName}</span>
            )}
          </div>
        )}

        {/* Validation Status */}
        {validation?.is_valid && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="text-sm font-medium text-primary">{validation.message}</span>
          </div>
        )}

        <div className="grid gap-6">
          {/* Document Informatie */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Document Informatie</h2>
                <p className="text-sm text-muted-foreground">Algemene contractgegevens</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Type Document</label>
                <input
                  type="text"
                  value={formData.contract_type}
                  onChange={(e) => updateField("contract_type", e.target.value)}
                  className={inputClass}
                  placeholder="Huurovereenkomst"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Datum Contract</label>
                <input
                  type="text"
                  value={formData.datum_contract}
                  onChange={(e) => updateField("datum_contract", e.target.value)}
                  className={inputClass}
                  placeholder="01-01-2024"
                />
              </div>
            </div>
          </section>

          {/* Partijen */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Partijen</h2>
                <p className="text-sm text-muted-foreground">Verhuurder en huurder informatie</p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Verhuurder */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Verhuurder
                </h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Naam</label>
                    <input
                      type="text"
                      value={formData.verhuurder_naam}
                      onChange={(e) => updateField("verhuurder_naam", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Adres</label>
                    <input
                      type="text"
                      value={formData.verhuurder_adres}
                      onChange={(e) => updateField("verhuurder_adres", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Telefoon</label>
                      <input
                        type="text"
                        value={formData.verhuurder_telefoon}
                        onChange={(e) => updateField("verhuurder_telefoon", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">E-mail</label>
                      <input
                        type="email"
                        value={formData.verhuurder_email}
                        onChange={(e) => updateField("verhuurder_email", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Huurder */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Huurder
                </h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Naam</label>
                    <input
                      type="text"
                      value={formData.huurder_naam}
                      onChange={(e) => updateField("huurder_naam", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Adres</label>
                    <input
                      type="text"
                      value={formData.huurder_adres}
                      onChange={(e) => updateField("huurder_adres", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Telefoon</label>
                      <input
                        type="text"
                        value={formData.huurder_telefoon}
                        onChange={(e) => updateField("huurder_telefoon", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">E-mail</label>
                      <input
                        type="email"
                        value={formData.huurder_email}
                        onChange={(e) => updateField("huurder_email", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pand Informatie */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Pand Informatie</h2>
                <p className="text-sm text-muted-foreground">Details over het gehuurde pand</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Adres</label>
                <input
                  type="text"
                  value={formData.pand_adres}
                  onChange={(e) => updateField("pand_adres", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Type</label>
                <input
                  type="text"
                  value={formData.pand_type}
                  onChange={(e) => updateField("pand_type", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Oppervlakte (m2)</label>
                <input
                  type="text"
                  value={formData.pand_oppervlakte}
                  onChange={(e) => updateField("pand_oppervlakte", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Aantal Kamers</label>
                <input
                  type="text"
                  value={formData.pand_kamers}
                  onChange={(e) => updateField("pand_kamers", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Verdieping</label>
                <input
                  type="text"
                  value={formData.pand_verdieping}
                  onChange={(e) => updateField("pand_verdieping", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">EPC Label</label>
                <input
                  type="text"
                  value={formData.pand_epc}
                  onChange={(e) => updateField("pand_epc", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">EPC Certificaatnummer</label>
                <input
                  type="text"
                  value={formData.pand_epc_nummer}
                  onChange={(e) => updateField("pand_epc_nummer", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Kadastrale Gegevens */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Kadastrale Gegevens
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Afdeling</label>
                  <input
                    type="text"
                    value={formData.kadaster_afdeling}
                    onChange={(e) => updateField("kadaster_afdeling", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Sectie</label>
                  <input
                    type="text"
                    value={formData.kadaster_sectie}
                    onChange={(e) => updateField("kadaster_sectie", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Nummer</label>
                  <input
                    type="text"
                    value={formData.kadaster_nummer}
                    onChange={(e) => updateField("kadaster_nummer", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Kadastraal Inkomen</label>
                  <input
                    type="text"
                    value={formData.kadaster_inkomen}
                    onChange={(e) => updateField("kadaster_inkomen", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Financiele Gegevens */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Euro className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Financiele Gegevens</h2>
                <p className="text-sm text-muted-foreground">Huurprijs en waarborg informatie</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Huurprijs (EUR/maand)</label>
                <input
                  type="text"
                  value={formData.huurprijs}
                  onChange={(e) => updateField("huurprijs", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Waarborg (EUR)</label>
                <input
                  type="text"
                  value={formData.waarborg_bedrag}
                  onChange={(e) => updateField("waarborg_bedrag", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Waarborg Gedeponeerd Bij</label>
                <input
                  type="text"
                  value={formData.waarborg_locatie}
                  onChange={(e) => updateField("waarborg_locatie", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Kosten en Lasten</label>
                <textarea
                  value={formData.kosten}
                  onChange={(e) => updateField("kosten", e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Indexatie</label>
                <input
                  type="text"
                  value={formData.indexatie}
                  onChange={(e) => updateField("indexatie", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Periodes en Termijnen */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Periodes en Termijnen</h2>
                <p className="text-sm text-muted-foreground">Looptijd en opzegging</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Ingangsdatum</label>
                <input
                  type="text"
                  value={formData.ingangsdatum}
                  onChange={(e) => updateField("ingangsdatum", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Einddatum</label>
                <input
                  type="text"
                  value={formData.einddatum}
                  onChange={(e) => updateField("einddatum", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Duur</label>
                <input
                  type="text"
                  value={formData.duur}
                  onChange={(e) => updateField("duur", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Opzegtermijn</label>
                <input
                  type="text"
                  value={formData.opzegtermijn}
                  onChange={(e) => updateField("opzegtermijn", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Voorwaarden */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Voorwaarden</h2>
                <p className="text-sm text-muted-foreground">Bijzondere bepalingen</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Huisdieren</label>
                <input
                  type="text"
                  value={formData.huisdieren}
                  onChange={(e) => updateField("huisdieren", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Onderverhuur</label>
                <input
                  type="text"
                  value={formData.onderverhuur}
                  onChange={(e) => updateField("onderverhuur", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Bijzondere Voorwaarden en Werken</label>
              <textarea
                value={formData.werken}
                onChange={(e) => updateField("werken", e.target.value)}
                rows={4}
                className={inputClass}
              />
            </div>
          </section>

          {/* Juridisch */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Juridische Informatie</h2>
                <p className="text-sm text-muted-foreground">Toepasselijk recht en bevoegde rechtbank</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Toepasselijk Recht</label>
                <input
                  type="text"
                  value={formData.toepasselijk_recht}
                  onChange={(e) => updateField("toepasselijk_recht", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Bevoegde Rechtbank</label>
                <input
                  type="text"
                  value={formData.bevoegde_rechtbank}
                  onChange={(e) => updateField("bevoegde_rechtbank", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Samenvatting */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Samenvatting</h2>
                <p className="text-sm text-muted-foreground">AI-gegenereerde samenvatting van het contract</p>
              </div>
            </div>
            <textarea
              value={formData.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              rows={8}
              className={`${inputClass} bg-muted/50`}
              placeholder="De samenvatting verschijnt hier na het laden van een JSON bestand..."
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Contract Data Viewer - Importeer, bewerk en exporteer contractgegevens
          </p>
        </div>
      </footer>
    </div>
  )
}
